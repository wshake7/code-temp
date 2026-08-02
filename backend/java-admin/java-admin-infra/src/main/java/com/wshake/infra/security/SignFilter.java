package com.wshake.infra.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wshake.common.constant.SecurityConstants;
import com.wshake.common.constant.SecurityHeaders;
import com.wshake.common.result.Result;
import com.wshake.common.result.ResultCode;
import com.wshake.infra.config.SecurityProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * 独立 Sign 校验：仅在 Encrypt 关闭且 Sign 开启时生效。
 *
 * <p>对齐 Go {@code SignMiddleware}：RSA 解 AES key，AAD = 排序后的 Request-ID / Timestamp / query /
 * body({@code signData})，用 AES-GCM（空 ciphertext + tagIv）校验签名。
 *
 * @author wshake
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 25)
public class SignFilter extends OncePerRequestFilter {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final CryptoService cryptoService;
    private final ServerKeyPairProvider serverKeyPairProvider;
    private final SecurityProperties securityProperties;

    public SignFilter(
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
        // Encrypt 优先：开启时由 EncryptFilter 完成 body/AAD 完整性，不重复独立 Sign
        if (securityProperties.getEncrypt().isEnabled()
                || !securityProperties.getSign().isEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        if ("OPTIONS".equalsIgnoreCase(request.getMethod()) || SecurityPathMatcher.isWhitelisted(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String contentType = request.getContentType();
        if (contentType != null && contentType.startsWith("multipart/form-data")) {
            filterChain.doFilter(request, response);
            return;
        }
        if (request.getRequestURI().endsWith("/events")) {
            filterChain.doFilter(request, response);
            return;
        }

        String encryptedKey = request.getHeader(SecurityHeaders.REQUEST_ENCRYPTED_KEY);
        String sign = firstHeader(request, SecurityHeaders.REQUEST_SIGNATURE, SecurityHeaders.SIGN_LEGACY);
        if (encryptedKey == null || encryptedKey.isEmpty() || sign == null || sign.isEmpty()) {
            log.debug("Sign 已开启，缺少加密密钥头或签名头");
            writeError(response, ResultCode.REQUEST_ERROR);
            return;
        }

        String aesKeyBase64;
        try {
            String privateKeyPem = serverKeyPairProvider.getPrivateKeyPem();
            aesKeyBase64 = cryptoService.rsaDecrypt(encryptedKey, CryptoService.parsePrivateKeyPem(privateKeyPem));
        } catch (Exception e) {
            log.debug("Sign 路径 RSA 解密 AES key 失败: {}", e.getMessage());
            writeError(response, ResultCode.REQUEST_KEY_FAILED);
            return;
        }

        byte[] rawBody = readBodyBytes(request);
        HttpServletRequest requestToUse = new EncryptFilter.CachedBodyRequestWrapper(request, rawBody);

        String aad = buildSignAad(requestToUse, rawBody);
        if (!cryptoService.verifySign(sign, aesKeyBase64, aad)) {
            log.debug("Sign 校验失败");
            writeError(response, ResultCode.REQUEST_SIGN_FAILED);
            return;
        }

        filterChain.doFilter(requestToUse, response);
    }

    private String buildSignAad(HttpServletRequest request, byte[] rawBody) {
        Map<String, String> params = new LinkedHashMap<>();

        String requestId = firstHeader(request, SecurityHeaders.REQUEST_ID);
        if (requestId != null && !requestId.isEmpty()) {
            params.put(SecurityHeaders.REQUEST_ID, requestId);
        }

        String timestamp = firstHeader(request, SecurityHeaders.REQUEST_TIMESTAMP, SecurityHeaders.TIMESTAMP_LEGACY);
        if (timestamp != null && !timestamp.isEmpty()) {
            String tsName = request.getHeader(SecurityHeaders.REQUEST_TIMESTAMP);
            if (tsName != null && !tsName.isEmpty()) {
                params.put(SecurityHeaders.REQUEST_TIMESTAMP, timestamp);
            } else {
                params.put(SecurityHeaders.TIMESTAMP_LEGACY, timestamp);
            }
        }

        for (Map.Entry<String, String[]> e : request.getParameterMap().entrySet()) {
            String[] values = e.getValue();
            if (values != null && values.length > 0) {
                params.put(e.getKey(), values[0]);
            }
        }

        if (rawBody.length > 0) {
            params.put(SecurityConstants.SIGN_DATA_AAD_KEY, new String(rawBody, StandardCharsets.UTF_8));
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
}
