package com.wshake.api.controller;

import com.wshake.common.exception.AuthException;
import com.wshake.common.result.Result;
import com.wshake.infra.security.ServerKeyPairProvider;
import com.wshake.infra.security.SessionEncryptKeys;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 仅 dev profile：向 backend-mock 暴露 RSA 密钥，便于 hybrid 联调时 mock 与 Java 同钥解密。
 *
 * <p><strong>正式（prod）不注册本 Bean</strong>，避免私钥泄露到公网。
 *
 * @author wshake
 */
@Tag(name = "加密（dev）", description = "仅 dev：mock 拉取全局/会话密钥对")
@RestController
@RequestMapping("/api/encrypt/dev")
@Profile("dev")
@RequiredArgsConstructor
public class DevEncryptController {

    private final ServerKeyPairProvider serverKeyPairProvider;

    /**
     * 返回全局 RSA 公钥（SPKI base64）与私钥（PKCS#8 PEM），供 mock 进程内 adopt。
     */
    @GetMapping("/key-pair")
    @Operation(
            summary = "【dev only】获取全局完整密钥对",
            description = "仅 spring.profiles.active=dev 可用；返回 data.publicKey + data.privateKey")
    public Result<Map<String, String>> keyPair() {
        return Result.ok(Map.of(
                "publicKey", serverKeyPairProvider.getPublicKey(),
                "privateKey", serverKeyPairProvider.getPrivateKeyPem()));
    }

    /**
     * 按 Authorization Bearer token 返回该登录会话的专属密钥对，供 mock 解密「登录后前端用会话公钥」的请求。
     *
     * <p>配置示例（mock）：{@code SECURITY_JAVA_SESSION_KEY_URL=http://localhost:4080/api/encrypt/dev/session-key}
     */
    @GetMapping("/session-key")
    @Operation(
            summary = "【dev only】获取当前 token 会话专属密钥对",
            description = "须带 Authorization: Bearer <accessToken>；返回 data.publicKey + data.privateKey")
    public Result<Map<String, String>> sessionKey(HttpServletRequest request) {
        String token = SessionEncryptKeys.extractBearerToken(request);
        if (token == null) {
            throw AuthException.notLogin();
        }
        SessionEncryptKeys.KeyPairStrings pair = SessionEncryptKeys.findKeyPairByToken(token);
        if (pair == null) {
            throw AuthException.notLogin();
        }
        return Result.ok(Map.of(
                "publicKey", pair.publicKey() == null ? "" : pair.publicKey(),
                "privateKey", pair.privateKeyPem()));
    }
}
