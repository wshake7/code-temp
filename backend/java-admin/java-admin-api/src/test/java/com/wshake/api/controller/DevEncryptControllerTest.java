package com.wshake.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import cn.dev33.satoken.session.SaSession;
import cn.dev33.satoken.stp.StpUtil;
import com.wshake.common.exception.AuthException;
import com.wshake.common.result.Result;
import com.wshake.infra.security.ServerKeyPairProvider;
import com.wshake.infra.security.SessionEncryptKeys;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

/**
 * {@link DevEncryptController} 单元测试（dev-only key-pair / session-key 形状）。
 *
 * @author wshake
 */
class DevEncryptControllerTest {

    @Test
    void keyPair_returnsPublicAndPrivateKeys() {
        ServerKeyPairProvider provider = mock(ServerKeyPairProvider.class);
        when(provider.getPublicKey()).thenReturn("BASE64_PUBLIC_KEY");
        when(provider.getPrivateKeyPem()).thenReturn("-----BEGIN PRIVATE KEY-----\nX\n-----END PRIVATE KEY-----");
        DevEncryptController controller = new DevEncryptController(provider);

        Result<Map<String, String>> result = controller.keyPair();

        assertThat(result.getCode()).isZero();
        assertThat(result.getData())
                .containsEntry("publicKey", "BASE64_PUBLIC_KEY")
                .containsKey("privateKey");
        assertThat(result.getData().get("privateKey")).contains("BEGIN PRIVATE KEY");
    }

    @Test
    void sessionKey_withBearer_returnsSessionKeyPair() {
        ServerKeyPairProvider provider = mock(ServerKeyPairProvider.class);
        DevEncryptController controller = new DevEncryptController(provider);
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("Authorization")).thenReturn("Bearer tok-1");

        SaSession tokenSession = mock(SaSession.class);
        when(tokenSession.get(SessionEncryptKeys.SESSION_PRIVATE_KEY))
                .thenReturn("-----BEGIN PRIVATE KEY-----\nSESSION\n-----END PRIVATE KEY-----");
        when(tokenSession.get(SessionEncryptKeys.SESSION_PUBLIC_KEY)).thenReturn("SESSION_PUBLIC");

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(() -> StpUtil.getTokenSessionByToken("tok-1")).thenReturn(tokenSession);

            Result<Map<String, String>> result = controller.sessionKey(request);

            assertThat(result.getCode()).isZero();
            assertThat(result.getData())
                    .containsEntry("publicKey", "SESSION_PUBLIC")
                    .containsEntry("privateKey", "-----BEGIN PRIVATE KEY-----\nSESSION\n-----END PRIVATE KEY-----");
        }
    }

    @Test
    void sessionKey_withoutToken_throwsNotLogin() {
        DevEncryptController controller = new DevEncryptController(mock(ServerKeyPairProvider.class));
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("Authorization")).thenReturn(null);

        assertThatThrownBy(() -> controller.sessionKey(request)).isInstanceOf(AuthException.class);
    }
}
