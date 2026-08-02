package com.wshake.infra.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wshake.common.constant.SecurityHeaders;
import com.wshake.common.result.ResultCode;
import com.wshake.infra.config.SecurityProperties;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/**
 * HTTP 安全协议主 seam：Timestamp + Encrypt 开关与强制加密路径。
 *
 * <p>通过 Filter 边界断言 Result code/msg 与关键响应头，不绑内部实现。
 *
 * @author wshake
 */
class SecurityFilterTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private SecurityProperties securityProperties;
    private CryptoService cryptoService;
    private ServerKeyPairProvider keyPairProvider;
    private TimestampFilter timestampFilter;
    private EncryptFilter encryptFilter;
    private String publicKeyBase64;
    private String privateKeyPem;

    @BeforeEach
    void setUp() {
        securityProperties = new SecurityProperties();
        securityProperties.getTimestamp().setEnabled(true);
        securityProperties.getEncrypt().setEnabled(true);

        cryptoService = new CryptoService();
        KeyPair keyPair = CryptoService.generateRsaKeyPair();
        publicKeyBase64 = CryptoService.toBase64(keyPair.getPublic());
        privateKeyPem = CryptoService.toPem(keyPair.getPrivate());

        EncryptKeyPairService keyPairService = new EncryptKeyPairService(null) {
            @Override
            public EncryptKeyPair getEncryptKeyPair() {
                return new EncryptKeyPair(publicKeyBase64, privateKeyPem);
            }

            @Override
            public KeyPairResult generateAndCacheKeyPair() {
                return new KeyPairResult(publicKeyBase64, privateKeyPem);
            }
        };
        keyPairProvider = new ServerKeyPairProvider(keyPairService);
        timestampFilter = new TimestampFilter(securityProperties);
        encryptFilter = new EncryptFilter(cryptoService, keyPairProvider, securityProperties);
    }

    // ---- Timestamp ----

    @Test
    void timestamp_expired_returnsRequestExpired() throws Exception {
        long expired = System.currentTimeMillis() - (6 * 60 * 1000L);
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
        req.addHeader(SecurityHeaders.REQUEST_TIMESTAMP, String.valueOf(expired));
        MockHttpServletResponse resp = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        timestampFilter.doFilter(req, resp, (r, s) -> chainCalled.set(true));

        assertThat(chainCalled).isFalse();
        JsonNode body = MAPPER.readTree(resp.getContentAsString());
        assertThat(body.get("code").asInt()).isEqualTo(ResultCode.REQUEST_EXPIRED.getCode());
        assertThat(body.get("msg").asText()).isEqualTo(ResultCode.REQUEST_EXPIRED.getMsg());
    }

    @Test
    void timestamp_valid_passes() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
        req.addHeader(SecurityHeaders.REQUEST_TIMESTAMP, String.valueOf(System.currentTimeMillis()));
        MockHttpServletResponse resp = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        timestampFilter.doFilter(req, resp, (r, s) -> chainCalled.set(true));

        assertThat(chainCalled).isTrue();
    }

    @Test
    void timestamp_missing_passes() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
        MockHttpServletResponse resp = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        timestampFilter.doFilter(req, resp, (r, s) -> chainCalled.set(true));

        assertThat(chainCalled).isTrue();
    }

    @Test
    void timestamp_disabled_ignoresExpired() throws Exception {
        securityProperties.getTimestamp().setEnabled(false);
        long expired = System.currentTimeMillis() - (6 * 60 * 1000L);
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
        req.addHeader(SecurityHeaders.REQUEST_TIMESTAMP, String.valueOf(expired));
        MockHttpServletResponse resp = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        timestampFilter.doFilter(req, resp, (r, s) -> chainCalled.set(true));

        assertThat(chainCalled).isTrue();
    }

    // ---- Encrypt force / whitelist ----

    @Test
    void encrypt_missingKeyOnLogin_rejected() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
        req.setContentType("application/json");
        req.setContent("{\"username\":\"root\"}".getBytes(StandardCharsets.UTF_8));
        MockHttpServletResponse resp = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        encryptFilter.doFilter(req, resp, (r, s) -> chainCalled.set(true));

        assertThat(chainCalled).isFalse();
        JsonNode body = MAPPER.readTree(resp.getContentAsString());
        assertThat(body.get("code").asInt()).isEqualTo(ResultCode.REQUEST_ERROR.getCode());
        assertThat(body.get("msg").asText()).isEqualTo(ResultCode.REQUEST_ERROR.getMsg());
    }

    @Test
    void encrypt_publicKeyPath_allowsPlaintext() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/encrypt/public/key");
        MockHttpServletResponse resp = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        encryptFilter.doFilter(req, resp, (r, s) -> {
            chainCalled.set(true);
            s.setContentType("application/json");
            s.getWriter().write("{\"code\":0,\"msg\":\"ok\",\"data\":{\"publicKey\":\"x\"}}");
        });

        assertThat(chainCalled).isTrue();
        assertThat(resp.getHeader(SecurityHeaders.RESPONSE_IS_ENCRYPT)).isNull();
        assertThat(resp.getContentAsString()).contains("publicKey");
    }

    @Test
    void encrypt_altchaPath_allowsPlaintext() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/altcha/challenge");
        MockHttpServletResponse resp = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        encryptFilter.doFilter(req, resp, (r, s) -> chainCalled.set(true));

        assertThat(chainCalled).isTrue();
    }

    @Test
    void encrypt_disabled_allowsPlainLogin() throws Exception {
        securityProperties.getEncrypt().setEnabled(false);
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
        req.setContentType("application/json");
        req.setContent("{\"username\":\"root\"}".getBytes(StandardCharsets.UTF_8));
        MockHttpServletResponse resp = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        encryptFilter.doFilter(req, resp, (r, s) -> chainCalled.set(true));

        assertThat(chainCalled).isTrue();
        assertThat(resp.getHeader(SecurityHeaders.RESPONSE_IS_ENCRYPT)).isNull();
    }

    @Test
    void encrypt_validEncryptedRequest_decryptsBodyAndEncryptsResponse() throws Exception {
        String aesKey = CryptoService.generateAesKey();
        String encryptedAesKey = cryptoService.rsaEncrypt(aesKey, CryptoService.parsePublicKeyPem(publicKeyBase64));

        long now = System.currentTimeMillis();
        Map<String, String> aadParams = new LinkedHashMap<>();
        aadParams.put(SecurityHeaders.REQUEST_ID, "req-encrypt-1");
        aadParams.put(SecurityHeaders.REQUEST_TIMESTAMP, String.valueOf(now));
        String aad = cryptoService.buildAad(aadParams);

        String plainBody = "{\"username\":\"root\",\"password\":\"123456\"}";
        CryptoService.EncryptResult enc = cryptoService.aesEncrypt(plainBody, aesKey, aad);

        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
        req.setContentType("application/json");
        req.addHeader(SecurityHeaders.REQUEST_ENCRYPTED_KEY, encryptedAesKey);
        req.addHeader(SecurityHeaders.REQUEST_SIGNATURE, enc.tagIv);
        req.addHeader(SecurityHeaders.REQUEST_ID, aadParams.get(SecurityHeaders.REQUEST_ID));
        req.addHeader(SecurityHeaders.REQUEST_TIMESTAMP, aadParams.get(SecurityHeaders.REQUEST_TIMESTAMP));
        req.setContent(enc.ciphertext.getBytes(StandardCharsets.UTF_8));

        MockHttpServletResponse resp = new MockHttpServletResponse();
        AtomicReference<String> bodySeenByBusiness = new AtomicReference<>();

        encryptFilter.doFilter(req, resp, (r, s) -> {
            bodySeenByBusiness.set(new String(r.getInputStream().readAllBytes(), StandardCharsets.UTF_8));
            s.setContentType("application/json");
            s.getWriter().write("{\"code\":0,\"msg\":\"ok\",\"data\":{\"accessToken\":\"t\"}}");
        });

        assertThat(bodySeenByBusiness.get()).isEqualTo(plainBody);
        assertThat(resp.getHeader(SecurityHeaders.RESPONSE_IS_ENCRYPT)).isEqualTo("true");

        String encryptedResponse = resp.getContentAsString();
        String decrypted =
                new String(cryptoService.aesDecryptCombined(encryptedResponse, aesKey, ""), StandardCharsets.UTF_8);
        JsonNode node = MAPPER.readTree(decrypted);
        assertThat(node.get("code").asInt()).isZero();
        assertThat(node.get("data").get("accessToken").asText()).isEqualTo("t");
    }

    @Test
    void encrypt_bodyWithoutSignature_rejected() throws Exception {
        String aesKey = CryptoService.generateAesKey();
        String encryptedAesKey = cryptoService.rsaEncrypt(aesKey, CryptoService.parsePublicKeyPem(publicKeyBase64));

        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
        req.setContentType("application/json");
        req.addHeader(SecurityHeaders.REQUEST_ENCRYPTED_KEY, encryptedAesKey);
        req.addHeader(SecurityHeaders.REQUEST_ID, "missing-sign");
        req.addHeader(SecurityHeaders.REQUEST_TIMESTAMP, String.valueOf(System.currentTimeMillis()));
        req.setContent("{\"username\":\"root\",\"password\":\"123456\"}".getBytes(StandardCharsets.UTF_8));
        MockHttpServletResponse resp = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        encryptFilter.doFilter(req, resp, (r, s) -> chainCalled.set(true));

        assertThat(chainCalled).isFalse();
        JsonNode body = MAPPER.readTree(resp.getContentAsString());
        assertThat(body.get("code").asInt()).isEqualTo(ResultCode.REQUEST_ERROR.getCode());
    }

    @Test
    void encrypt_docPath_allowsPlaintext() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/v3/api-docs");
        MockHttpServletResponse resp = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        encryptFilter.doFilter(req, resp, (r, s) -> chainCalled.set(true));

        assertThat(chainCalled).isTrue();
    }

    @Test
    void timestamp_invalidFormat_returnsRequestError() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
        req.addHeader(SecurityHeaders.REQUEST_TIMESTAMP, "not-a-number");
        MockHttpServletResponse resp = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        timestampFilter.doFilter(req, resp, (r, s) -> chainCalled.set(true));

        assertThat(chainCalled).isFalse();
        JsonNode body = MAPPER.readTree(resp.getContentAsString());
        assertThat(body.get("code").asInt()).isEqualTo(ResultCode.REQUEST_ERROR.getCode());
    }

    @Test
    void encrypt_stalePublicKey_returnsKeyFailed() throws Exception {
        String aesKey = CryptoService.generateAesKey();
        KeyPair stale = CryptoService.generateRsaKeyPair();
        String encryptedAesKey = cryptoService.rsaEncrypt(aesKey, stale.getPublic());

        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
        req.setContentType("application/json");
        req.addHeader(SecurityHeaders.REQUEST_ENCRYPTED_KEY, encryptedAesKey);
        req.addHeader(SecurityHeaders.REQUEST_ID, "stale");
        req.addHeader(SecurityHeaders.REQUEST_TIMESTAMP, String.valueOf(System.currentTimeMillis()));
        req.setContent("{\"username\":\"root\"}".getBytes(StandardCharsets.UTF_8));
        MockHttpServletResponse resp = new MockHttpServletResponse();
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        encryptFilter.doFilter(req, resp, (r, s) -> chainCalled.set(true));

        assertThat(chainCalled).isFalse();
        JsonNode body = MAPPER.readTree(resp.getContentAsString());
        assertThat(body.get("code").asInt()).isEqualTo(ResultCode.REQUEST_KEY_FAILED.getCode());
        assertThat(resp.getHeader(SecurityHeaders.RESPONSE_IS_ENCRYPT)).isNull();
    }

    @Test
    void encryptController_publicKey_returnsResultWithPublicKey() {
        EncryptControllerLike controller = new EncryptControllerLike(keyPairProvider);
        var result = controller.publicKey();
        assertThat(result.getCode()).isZero();
        assertThat(result.getData().get("publicKey")).isEqualTo(publicKeyBase64);
    }

    /** 轻量镜像 Controller 行为，避免在 infra 模块依赖 api 包。 */
    private static final class EncryptControllerLike {
        private final ServerKeyPairProvider provider;

        EncryptControllerLike(ServerKeyPairProvider provider) {
            this.provider = provider;
        }

        com.wshake.common.result.Result<Map<String, String>> publicKey() {
            return com.wshake.common.result.Result.ok(Map.of("publicKey", provider.getPublicKey()));
        }
    }
}
