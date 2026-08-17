package com.wshake.infra.storage;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 对象存储配置。
 *
 * <p>对应 {@code app.storage.*}。{@code type} 仅允许 {@code local} 或 {@code s3}。
 *
 * @author wshake
 */
@Data
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    /** 本地磁盘。 */
    public static final String TYPE_LOCAL = "local";

    /** S3 / MinIO。 */
    public static final String TYPE_S3 = "s3";

    /** 适配类型：local 或 s3。 */
    private String type = TYPE_LOCAL;

    /** 本地磁盘配置。 */
    private Local local = new Local();

    /** S3 / MinIO 配置。 */
    private S3 s3 = new S3();

    /**
     * 校验当前 type 所需字段。
     */
    public void validate() {
        if (TYPE_LOCAL.equals(type)) {
            if (local == null
                    || local.getBasePath() == null
                    || local.getBasePath().isBlank()) {
                throw new IllegalStateException("app.storage.local.base-path 不能为空");
            }
            return;
        }
        if (TYPE_S3.equals(type)) {
            if (s3 == null) {
                throw new IllegalStateException("app.storage.s3 不能为空");
            }
            requireS3("endpoint", s3.getEndpoint());
            requireS3("region", s3.getRegion());
            requireS3("bucket", s3.getBucket());
            requireS3("access-key", s3.getAccessKey());
            requireS3("secret-key", s3.getSecretKey());
            return;
        }
        throw new IllegalStateException("app.storage.type 仅支持 local 或 s3，实际=" + type);
    }

    private static void requireS3(String field, String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("app.storage.s3." + field + " 不能为空");
        }
    }

    /**
     * 本地磁盘。
     */
    @Data
    public static class Local {

        /** 根目录。 */
        private String basePath = "./data/storage";

        /** 公开访问前缀，可空。 */
        private String publicBaseUrl = "";
    }

    /**
     * S3 / MinIO。
     */
    @Data
    public static class S3 {

        /** 服务端点，例如 127.0.0.1:4900。 */
        private String endpoint = "";

        /** 区域；MinIO 可用 us-east-1。 */
        private String region = "us-east-1";

        /** 桶名。 */
        private String bucket = "";

        /** 访问密钥。 */
        private String accessKey = "";

        /** 秘密密钥。 */
        private String secretKey = "";

        /** 公开访问前缀，可空。 */
        private String publicBaseUrl = "";

        /** 是否 path-style（MinIO 需 true）。 */
        private boolean pathStyle = true;

        /** 预签名默认秒数。 */
        private int presignExpireSeconds = 900;
    }
}
