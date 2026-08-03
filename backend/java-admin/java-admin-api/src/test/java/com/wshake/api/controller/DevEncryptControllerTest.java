package com.wshake.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.wshake.common.result.Result;
import com.wshake.infra.security.ServerKeyPairProvider;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * {@link DevEncryptController} 单元测试（dev-only key-pair 形状）。
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
}
