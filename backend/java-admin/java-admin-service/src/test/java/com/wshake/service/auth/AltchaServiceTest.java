package com.wshake.service.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.altcha.altcha.v2.Altcha;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * {@link AltchaService} 集成式单测：真实签发 + 求解 + 校验。
 *
 * @author wshake
 */
class AltchaServiceTest {

    private AltchaService altchaService;

    @BeforeEach
    void setUp() throws Exception {
        altchaService = new AltchaService();
        setField(altchaService, "hmacSecret", "trellis-demo-altcha-dev-secret");
        setField(altchaService, "cost", 100);
        setField(altchaService, "expiresSeconds", 600L);
    }

    @Test
    void createAndVerify_roundTrip_succeeds() throws Exception {
        Altcha.Challenge challenge = altchaService.createChallenge();
        assertThat(challenge).isNotNull();
        assertThat(challenge.signature()).isNotBlank();
        assertThat(challenge.parameters()).isNotNull();

        Altcha.Solution solution = Altcha.solveChallenge(challenge, Altcha.kdf("PBKDF2/SHA-256"));
        JSONObject solutionJson =
                new JSONObject().put("counter", solution.counter()).put("derivedKey", solution.derivedKey());
        if (solution.time() != null) {
            solutionJson.put("time", solution.time());
        }
        String payloadJson = new JSONObject()
                .put("challenge", new JSONObject(challenge.toJson()))
                .put("solution", solutionJson)
                .toString();
        String payloadBase64 = Base64.getEncoder().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));

        assertThat(altchaService.verify(payloadBase64)).isTrue();
        // 重放拒绝
        assertThat(altchaService.verify(payloadBase64)).isFalse();
    }

    @Test
    void verify_blank_returnsFalse() {
        assertThat(altchaService.verify(null)).isFalse();
        assertThat(altchaService.verify("")).isFalse();
        assertThat(altchaService.verify("not-base64-json")).isFalse();
    }

    private static void setField(Object target, String name, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(name);
        field.setAccessible(true);
        field.set(target, value);
    }
}
