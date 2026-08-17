package com.wshake.infra.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.wshake.common.exception.BizException;
import com.wshake.common.result.ResultCode;
import org.junit.jupiter.api.Test;

/**
 * {@link StorageObjectKeys} 规范化与 URL 拼接。
 */
class StorageObjectKeysTest {

    @Test
    void normalize_stripsSlashAndBackslash() {
        assertThat(StorageObjectKeys.normalize("/a\\b/c.txt")).isEqualTo("a/b/c.txt");
    }

    @Test
    void normalize_rejectsBlankAndTraversal() {
        assertThatThrownBy(() -> StorageObjectKeys.normalize("  "))
                .isInstanceOf(BizException.class)
                .extracting(ex -> ((BizException) ex).getCode())
                .isEqualTo(ResultCode.PARAM_INVALID.getCode());
        assertThatThrownBy(() -> StorageObjectKeys.normalize("../secret")).isInstanceOf(BizException.class);
        assertThatThrownBy(() -> StorageObjectKeys.normalize("a/../b")).isInstanceOf(BizException.class);
        assertThatThrownBy(() -> StorageObjectKeys.normalize("a//b")).isInstanceOf(BizException.class);
        assertThatThrownBy(() -> StorageObjectKeys.normalize("C:/windows/secret"))
                .isInstanceOf(BizException.class);
        assertThatThrownBy(() -> StorageObjectKeys.normalize("//unc/share")).isInstanceOf(BizException.class);
    }

    @Test
    void joinPublicUrl_trimsTrailingSlash() {
        assertThat(StorageObjectKeys.joinPublicUrl("http://cdn.example/", "a/b.png"))
                .contains("http://cdn.example/a/b.png");
        assertThat(StorageObjectKeys.joinPublicUrl("", "a/b.png")).isEmpty();
    }

    @Test
    void resolveContentType_defaultsOctetStream() {
        assertThat(StorageObjectKeys.resolveContentType(null)).isEqualTo("application/octet-stream");
        assertThat(StorageObjectKeys.resolveContentType("image/png")).isEqualTo("image/png");
    }
}
