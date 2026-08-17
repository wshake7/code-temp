package com.wshake.infra.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.wshake.common.exception.BizException;
import com.wshake.service.port.StoragePort;
import com.wshake.service.port.StoragePort.PutCommand;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * 本地磁盘适配：写入、读取、删除、URL。
 */
class LocalStorageAdapterTest {

    @TempDir
    Path tempDir;

    private StoragePort storage;

    @BeforeEach
    void initAdapter() {
        StorageProperties props = new StorageProperties();
        props.getLocal().setBasePath(tempDir.toString());
        props.getLocal().setPublicBaseUrl("http://127.0.0.1:4080/files");
        storage = new LocalStorageAdapter(props);
    }

    @Test
    void putOpenDelete_roundTrip() throws Exception {
        byte[] body = "hello".getBytes(StandardCharsets.UTF_8);
        StoragePort.StoredObject stored =
                storage.put(new PutCommand("docs/a.txt", new ByteArrayInputStream(body), body.length, "text/plain"));

        assertThat(stored.key()).isEqualTo("docs/a.txt");
        assertThat(stored.size()).isEqualTo(5);
        assertThat(stored.contentType()).isEqualTo("text/plain");
        assertThat(stored.url()).isEqualTo("http://127.0.0.1:4080/files/docs/a.txt");
        assertThat(storage.exists("docs/a.txt")).isTrue();
        try (var in = storage.open("docs/a.txt")) {
            assertThat(in.readAllBytes()).isEqualTo(body);
        }

        storage.delete("docs/a.txt");
        assertThat(storage.exists("docs/a.txt")).isFalse();
        storage.delete("docs/a.txt");
    }

    @Test
    void open_missing_throws() {
        assertThatThrownBy(() -> storage.open("missing.txt")).isInstanceOf(BizException.class);
    }

    @Test
    void put_negativeLength_throws() {
        assertThatThrownBy(() -> storage.put(new PutCommand("a.txt", new ByteArrayInputStream(new byte[0]), -1, null)))
                .isInstanceOf(BizException.class);
    }

    @Test
    void presignGet_usesPublicUrl() {
        assertThat(storage.presignGet("docs/a.txt", null)).isEqualTo("http://127.0.0.1:4080/files/docs/a.txt");
    }

    @Test
    void presignGet_withoutPublicUrl_throws() {
        StorageProperties props = new StorageProperties();
        props.getLocal().setBasePath(tempDir.toString());
        StoragePort localOnly = new LocalStorageAdapter(props);
        assertThatThrownBy(() -> localOnly.presignGet("a.txt", null)).isInstanceOf(BizException.class);
        assertThat(localOnly.url("a.txt")).isEmpty();
    }
}
