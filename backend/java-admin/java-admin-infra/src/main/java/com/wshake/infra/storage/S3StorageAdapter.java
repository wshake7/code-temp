package com.wshake.infra.storage;

import com.wshake.common.exception.BizException;
import com.wshake.common.result.ResultCode;
import com.wshake.service.port.StoragePort;
import java.io.InputStream;
import java.time.Duration;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

/**
 * {@link StoragePort} 的 S3 / MinIO 实现。
 *
 * @author wshake
 */
@Slf4j
public final class S3StorageAdapter implements StoragePort {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucket;
    private final String publicBaseUrl;
    private final Duration defaultTtl;

    /**
     * 根据已校验配置与 SDK 客户端构造 S3 适配器。
     *
     * @param properties 已校验的存储配置
     * @param s3Client   S3 客户端
     * @param s3Presigner 预签名客户端
     */
    public S3StorageAdapter(StorageProperties properties, S3Client s3Client, S3Presigner s3Presigner) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.bucket = properties.getS3().getBucket();
        this.publicBaseUrl = properties.getS3().getPublicBaseUrl();
        int seconds = properties.getS3().getPresignExpireSeconds();
        this.defaultTtl = Duration.ofSeconds(seconds > 0 ? seconds : 900);
    }

    @Override
    public StoredObject put(PutCommand command) {
        if (command == null || command.content() == null) {
            throw BizException.of(ResultCode.PARAM_INVALID, "存储写入内容不能为空");
        }
        if (command.contentLength() < 0) {
            throw BizException.of(ResultCode.PARAM_INVALID, "存储对象长度非法");
        }
        String key = StorageObjectKeys.normalize(command.key());
        String contentType = StorageObjectKeys.resolveContentType(command.contentType());
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .contentLength(command.contentLength())
                .build();
        try {
            s3Client.putObject(request, RequestBody.fromInputStream(command.content(), command.contentLength()));
            log.atInfo()
                    .addKeyValue("logType", "STORAGE")
                    .addKeyValue("key", key)
                    .addKeyValue("size", command.contentLength())
                    .log("s3 put");
            return new StoredObject(key, command.contentLength(), contentType, url(key).orElse(null));
        } catch (SdkException ex) {
            throw wrapRemote("写入 S3 对象失败", ex);
        }
    }

    @Override
    public InputStream open(String key) {
        String normalized = StorageObjectKeys.normalize(key);
        GetObjectRequest request =
                GetObjectRequest.builder().bucket(bucket).key(normalized).build();
        try {
            return s3Client.getObject(request);
        } catch (NoSuchKeyException ex) {
            throw BizException.of(ResultCode.PARAM_INVALID, "存储对象不存在");
        } catch (SdkException ex) {
            if (isNotFound(ex)) {
                throw BizException.of(ResultCode.PARAM_INVALID, "存储对象不存在");
            }
            throw wrapRemote("读取 S3 对象失败", ex);
        }
    }

    @Override
    public void delete(String key) {
        String normalized = StorageObjectKeys.normalize(key);
        try {
            s3Client.deleteObject(
                    DeleteObjectRequest.builder().bucket(bucket).key(normalized).build());
        } catch (SdkException ex) {
            throw wrapRemote("删除 S3 对象失败", ex);
        }
    }

    @Override
    public boolean exists(String key) {
        String normalized = StorageObjectKeys.normalize(key);
        try {
            s3Client.headObject(
                    HeadObjectRequest.builder().bucket(bucket).key(normalized).build());
            return true;
        } catch (NoSuchKeyException ex) {
            return false;
        } catch (SdkException ex) {
            if (isNotFound(ex)) {
                return false;
            }
            throw wrapRemote("查询 S3 对象失败", ex);
        }
    }

    @Override
    public Optional<String> url(String key) {
        return StorageObjectKeys.joinPublicUrl(publicBaseUrl, StorageObjectKeys.normalize(key));
    }

    @Override
    public String presignGet(String key, Duration ttl) {
        String normalized = StorageObjectKeys.normalize(key);
        Duration expire = (ttl == null || ttl.isZero() || ttl.isNegative()) ? defaultTtl : ttl;
        GetObjectRequest get =
                GetObjectRequest.builder().bucket(bucket).key(normalized).build();
        GetObjectPresignRequest request = GetObjectPresignRequest.builder()
                .signatureDuration(expire)
                .getObjectRequest(get)
                .build();
        try {
            PresignedGetObjectRequest presigned = s3Presigner.presignGetObject(request);
            return presigned.url().toString();
        } catch (SdkException ex) {
            throw wrapRemote("预签名 S3 对象失败", ex);
        }
    }

    private static boolean isNotFound(SdkException ex) {
        return ex instanceof S3Exception s3 && s3.statusCode() == 404;
    }

    private static BizException wrapRemote(String message, SdkException ex) {
        return new BizException(ResultCode.REMOTE_CALL_FAILED, message + ": " + ex.getMessage());
    }
}
