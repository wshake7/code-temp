package com.wshake.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.wshake.api.vo.PublicKeyVO;
import com.wshake.common.result.Result;
import com.wshake.infra.crypto.ServerKeyPairProvider;
import org.junit.jupiter.api.Test;

/**
 * {@link EncryptController} 单元测试。
 *
 * @author wshake
 */
class EncryptControllerTest {

    @Test
    void publicKey_returnsResultWithPublicKeyField() {
        ServerKeyPairProvider provider = mock(ServerKeyPairProvider.class);
        when(provider.getPublicKey()).thenReturn("BASE64_PUBLIC_KEY");
        EncryptController controller = new EncryptController(provider);

        Result<PublicKeyVO> result = controller.publicKey();

        assertThat(result.getCode()).isZero();
        assertThat(result.getData().getPublicKey()).isEqualTo("BASE64_PUBLIC_KEY");
    }
}
