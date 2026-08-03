package com.wshake.infra.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wshake.common.constant.SecurityHeaders;
import com.wshake.common.result.Result;
import com.wshake.common.result.ResultCode;
import com.wshake.infra.config.SecurityProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

/**
 * 请求体解密 / 响应体加密；Encrypt 开启时除白名单外强制要求加密头。
 *
 * @author wshake
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class EncryptFilter extends OncePerRequestFilter {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final CryptoService cryptoService;
    private final ServerKeyPairProvider serverKeyPairProvider;
    private final SecurityProperties securityProperties;

    public EncryptFilter(
            CryptoService cryptoService,
            ServerKeyPairProvider serverKeyPairProvider,
            SecurityProperties securityProperties) {
        this.cryptoService = cryptoService;
        this.serverKeyPairProvider = serverKeyPairProvider;
        this.securityProperties = securityProperties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // Encrypt 关闭：明文放行
        if (!securityProperties.getEncrypt().isEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        // SSE / multipart：不缓冲 body
        if (request.getRequestURI().endsWith("/events")) {
            filterChain.doFilter(request, response);
            return;
        }
        String contentType = request.getContentType();
        if (contentType != null && contentType.startsWith("multipart/form-data")) {
            filterChain.doFilter(request, response);
            return;
        }

        String encryptedKey = request.getHeader(SecurityHeaders.REQUEST_ENCRYPTED_KEY);
        boolean hasEncryptedKey = encryptedKey != null && !encryptedKey.isEmpty();

        if (!hasEncryptedKey) {
            if (isWhitelisted(request)) {
                filterChain.doFilter(request, response);
                return;
            }
            // 强制加密：缺头拒绝
            log.debug("Encrypt 已开启且路径不在白名单，缺少 {}", SecurityHeaders.REQUEST_ENCRYPTED_KEY);
            writeError(response, ResultCode.REQUEST_ERROR);
            return;
        }

        // 已登录：会话专属私钥；未登录/无会话钥：全局私钥（登录前公钥路径等）
        String privateKeyPem = SessionEncryptKeys.resolvePrivateKeyPem(request, serverKeyPairProvider);
        String aesKeyBase64;
        try {
            aesKeyBase64 = cryptoService.rsaDecrypt(encryptedKey, CryptoService.parsePrivateKeyPem(privateKeyPem));
        } catch (Exception e) {
            log.debug("RSA 解密 AES key 失败: {}", e.getMessage());
            writeError(response, ResultCode.REQUEST_KEY_FAILED);
            return;
        }

        String aad = buildAadFromRequest(request);

        HttpServletRequest requestToUse = request;
        byte[] rawBody = readBodyBytes(request);
        if (rawBody.length > 0) {
            String sign = firstHeader(request, SecurityHeaders.REQUEST_SIGNATURE, SecurityHeaders.SIGN_LEGACY);
            if (sign == null || sign.isEmpty()) {
                // Encrypt 开启时有 body 必须带签名并 AES-GCM 解密，避免明文 body 绕过
                log.debug("Encrypt 已开启且请求体非空，缺少 {}", SecurityHeaders.REQUEST_SIGNATURE);
                writeError(response, ResultCode.REQUEST_ERROR);
                return;
            }
            try {
                String ciphertextBody = new String(rawBody, StandardCharsets.UTF_8);
                byte[] decrypted = cryptoService.aesDecryptCiphertextAndTag(ciphertextBody, sign, aesKeyBase64, aad);
                requestToUse = new CachedBodyRequestWrapper(request, decrypted);
            } catch (Exception e) {
                log.debug("请求体解密失败: {}", e.getMessage());
                writeError(response, ResultCode.REQUEST_KEY_FAILED);
                return;
            }
        }

        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);
        try {
            filterChain.doFilter(requestToUse, wrappedResponse);

            byte[] responseBody = wrappedResponse.getContentAsByteArray();
            if (responseBody.length > 0) {
                try {
                    String plainResponse = new String(responseBody, StandardCharsets.UTF_8);
                    CryptoService.EncryptResult result = cryptoService.aesEncrypt(plainResponse, aesKeyBase64, "");
                    byte[] encryptedResponse = result.combined.getBytes(StandardCharsets.UTF_8);

                    wrappedResponse.resetBuffer();
                    wrappedResponse.setHeader(SecurityHeaders.RESPONSE_IS_ENCRYPT, "true");
                    wrappedResponse.setContentType("application/json");
                    wrappedResponse.setCharacterEncoding("UTF-8");
                    wrappedResponse.setContentLength(encryptedResponse.length);
                    wrappedResponse.getOutputStream().write(encryptedResponse);
                } catch (Exception e) {
                    log.error("响应加密失败: {}", e.getMessage());
                    wrappedResponse.resetBuffer();
                    writeError(wrappedResponse, ResultCode.INTERNAL_ERROR);
                }
            }
        } finally {
            wrappedResponse.copyBodyToResponse();
        }
    }

    private boolean isWhitelisted(HttpServletRequest request) {
        return SecurityPathMatcher.isWhitelisted(request);
    }

    private String buildAadFromRequest(HttpServletRequest request) {
        Map<String, String> params = new LinkedHashMap<>();

        String requestId = firstHeader(request, SecurityHeaders.REQUEST_ID);
        if (requestId != null && !requestId.isEmpty()) {
            params.put(SecurityHeaders.REQUEST_ID, requestId);
        }

        String timestamp = firstHeader(request, SecurityHeaders.REQUEST_TIMESTAMP, SecurityHeaders.TIMESTAMP_LEGACY);
        if (timestamp != null && !timestamp.isEmpty()) {
            params.put(timestampHeaderName(request), timestamp);
        }

        for (Map.Entry<String, String[]> e : request.getParameterMap().entrySet()) {
            String[] values = e.getValue();
            if (values != null && values.length > 0) {
                params.put(e.getKey(), values[0]);
            }
        }

        return cryptoService.buildAad(params);
    }

    private static String firstHeader(HttpServletRequest request, String... names) {
        for (String name : names) {
            String value = request.getHeader(name);
            if (value != null && !value.isEmpty()) {
                return value;
            }
        }
        return null;
    }

    private static String timestampHeaderName(HttpServletRequest request) {
        String frontendTimestamp = request.getHeader(SecurityHeaders.REQUEST_TIMESTAMP);
        if (frontendTimestamp != null && !frontendTimestamp.isEmpty()) {
            return SecurityHeaders.REQUEST_TIMESTAMP;
        }
        return SecurityHeaders.TIMESTAMP_LEGACY;
    }

    private static byte[] readBodyBytes(HttpServletRequest request) throws IOException {
        try (InputStream inputStream = request.getInputStream();
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            inputStream.transferTo(outputStream);
            return outputStream.toByteArray();
        }
    }

    private static void writeError(HttpServletResponse response, ResultCode code) throws IOException {
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        Result<Void> error = Result.error(code);
        response.getWriter().write(OBJECT_MAPPER.writeValueAsString(error));
    }

    /** 缓存解密后的 body，供下游重复读取。 */
    static class CachedBodyRequestWrapper extends HttpServletRequestWrapper {
        private final byte[] body;

        CachedBodyRequestWrapper(HttpServletRequest request, byte[] body) {
            super(request);
            this.body = body;
        }

        @Override
        public ServletInputStream getInputStream() {
            ByteArrayInputStream bis = new ByteArrayInputStream(body);
            return new ServletInputStream() {
                @Override
                public int read() {
                    return bis.read();
                }

                @Override
                public boolean isFinished() {
                    return bis.available() == 0;
                }

                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setReadListener(ReadListener listener) {}
            };
        }

        @Override
        public BufferedReader getReader() {
            return new BufferedReader(new InputStreamReader(getInputStream(), StandardCharsets.UTF_8));
        }

        @Override
        public int getContentLength() {
            return body.length;
        }

        @Override
        public long getContentLengthLong() {
            return body.length;
        }
    }
}
