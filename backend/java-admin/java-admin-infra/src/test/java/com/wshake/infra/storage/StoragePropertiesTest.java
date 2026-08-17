package com.wshake.infra.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

/**
 * {@link StorageProperties} 启动期校验。
 */
class StoragePropertiesTest {

    @Test
    void localDefault_passes() {
        StorageProperties props = new StorageProperties();
        props.validate();
        assertThat(props.getType()).isEqualTo(StorageProperties.TYPE_LOCAL);
    }

    @Test
    void local_blankBasePath_fails() {
        StorageProperties props = new StorageProperties();
        props.getLocal().setBasePath(" ");
        assertThatThrownBy(props::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("base-path");
    }

    @Test
    void s3_missingEndpoint_fails() {
        StorageProperties props = new StorageProperties();
        props.setType(StorageProperties.TYPE_S3);
        props.getS3().setBucket("demo");
        props.getS3().setAccessKey("ak");
        props.getS3().setSecretKey("sk");
        assertThatThrownBy(props::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("endpoint");
    }

    @Test
    void s3_complete_passes() {
        StorageProperties props = new StorageProperties();
        props.setType(StorageProperties.TYPE_S3);
        props.getS3().setEndpoint("http://127.0.0.1:4900");
        props.getS3().setBucket("java-admin");
        props.getS3().setAccessKey("minioadmin");
        props.getS3().setSecretKey("minioadmin");
        props.validate();
    }

    @Test
    void unknownType_fails() {
        StorageProperties props = new StorageProperties();
        props.setType("oss");
        assertThatThrownBy(props::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("local 或 s3");
    }
}
