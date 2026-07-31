package com.wshake.service.auth;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.altcha.altcha.v2.Altcha;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * ALTCHA PoW 挑战签发与校验。
 *
 * <p>协议 v2（PBKDF2/SHA-256），与 mock / 前端 {@code altcha} widget 对齐。
 * challenge 接口返回原始 challenge 对象（不可包 {@code Result}）。
 *
 * @author wshake
 */
@Slf4j
@Service
public class AltchaService {

    /** 与 mock 默认一致，便于本地联调；生产通过配置注入。 */
    @Value("${altcha.hmac-secret:altcha-dev-hmac-secret}")
    private String hmacSecret;

    /** PoW 成本；dev 取 1000，浏览器端秒级可解。 */
    @Value("${altcha.cost:1000}")
    private int cost;

    /** 挑战有效期（秒）。 */
    @Value("${altcha.expires-seconds:600}")
    private long expiresSeconds;

    private static final String ALGORITHM = "PBKDF2/SHA-256";

    /** 已消费 signature，防重放（进程内；多实例部署需换 Redis）。 */
    private final Set<String> consumedSignatures = ConcurrentHashMap.newKeySet();

    /**
     * 签发新 challenge。
     *
     * @return 库原始 Challenge（JSON 字段：parameters / signature）
     */
    public Altcha.Challenge createChallenge() {
        try {
            Altcha.CreateChallengeOptions options = new Altcha.CreateChallengeOptions()
                    .algorithm(ALGORITHM)
                    .cost(cost)
                    .hmacSignatureSecret(hmacSecret)
                    .expiresInSeconds(expiresSeconds);
            return Altcha.createChallenge(options);
        } catch (Exception e) {
            log.error("[ALTCHA] createChallenge failed", e);
            throw new IllegalStateException("ALTCHA challenge 签发失败", e);
        }
    }

    /**
     * 校验 widget 提交的 Base64 payload。
     *
     * @param payloadBase64 登录体 {@code altcha} 字段
     * @return true=通过
     */
    public boolean verify(String payloadBase64) {
        if (payloadBase64 == null || payloadBase64.isBlank()) {
            return false;
        }
        try {
            Altcha.Payload payload = Altcha.parsePayload(payloadBase64);
            if (payload == null
                    || payload.challenge() == null
                    || payload.challenge().signature() == null) {
                return false;
            }
            String signature = payload.challenge().signature();
            if (consumedSignatures.contains(signature)) {
                log.warn("[ALTCHA] replay detected signature={}", signature);
                return false;
            }
            Altcha.VerifySolutionResult result =
                    Altcha.verifySolution(payloadBase64, hmacSecret, Altcha.kdf(ALGORITHM));
            if (result.verified()) {
                consumedSignatures.add(signature);
                return true;
            }
            log.warn(
                    "[ALTCHA] verify failed expired={} invalidSig={} invalidSol={}",
                    result.expired(),
                    result.invalidSignature(),
                    result.invalidSolution());
            return false;
        } catch (Exception e) {
            log.warn("[ALTCHA] verify exception: {}", e.getMessage());
            return false;
        }
    }
}
