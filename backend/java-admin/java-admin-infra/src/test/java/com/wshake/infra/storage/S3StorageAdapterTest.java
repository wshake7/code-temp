package com.wshake.infra.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.wshake.common.exception.BizException;
import com.wshake.common.result.ResultCode;
import com.wshake.service.port.StoragePort;
import com.wshake.service.port.StoragePort.PutCommand;
import java.io.ByteArrayInputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.AbortableInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

/**
 * S3 适配：委托 S3Client / S3Presigner，错误转为 BizException。
 */
class S3StorageAdapterTest {

    private S3Client s3Client;
    private S3Presigner s3Presigner;
    private StoragePort storage;

    @BeforeEach
    void initAdapter() {
        s3Client = mock(S3Client.class);
        s3Presigner = mock(S3Presigner.class);
        StorageProperties props = new StorageProperties();
        props.setType(StorageProperties.TYPE_S3);
        props.getS3().setBucket("java-admin");
        props.getS3().setPublicBaseUrl("https://cdn.example/files");
        props.getS3().setPresignExpireSeconds(600);
        storage = new S3StorageAdapter(props, s3Client, s3Presigner);
    }

    @Test
    void put_sendsBucketAndKey() {
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());
        byte[] body = "hi".getBytes(StandardCharsets.UTF_8);

        StoragePort.StoredObject stored =
                storage.put(new PutCommand("/docs/a.txt", new ByteArrayInputStream(body), body.length, "text/plain"));

        assertThat(stored.key()).isEqualTo("docs/a.txt");
        assertThat(stored.url()).isEqualTo("https://cdn.example/files/docs/a.txt");
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void open_missing_throwsParamInvalid() {
        when(s3Client.getObject(any(GetObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().message("missing").build());
        assertThatThrownBy(() -> storage.open("gone.txt"))
                .isInstanceOf(BizException.class)
                .extracting(ex -> ((BizException) ex).getCode())
                .isEqualTo(ResultCode.PARAM_INVALID.getCode());
    }

    @Test
    void open_returnsStream() throws Exception {
        byte[] body = "data".getBytes(StandardCharsets.UTF_8);
        ResponseInputStream<GetObjectResponse> stream = new ResponseInputStream<>(
                GetObjectResponse.builder().build(), AbortableInputStream.create(new ByteArrayInputStream(body)));
        when(s3Client.getObject(any(GetObjectRequest.class))).thenReturn(stream);

        try (var in = storage.open("docs/a.txt")) {
            assertThat(in.readAllBytes()).isEqualTo(body);
        }
    }

    @Test
    void exists_falseOnNoSuchKey() {
        when(s3Client.headObject(any(HeadObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().message("missing").build());
        assertThat(storage.exists("gone.txt")).isFalse();
    }

    @Test
    void exists_trueOnHead() {
        when(s3Client.headObject(any(HeadObjectRequest.class)))
                .thenReturn(HeadObjectResponse.builder().build());
        assertThat(storage.exists("docs/a.txt")).isTrue();
    }

    @Test
    void delete_delegates() {
        storage.delete("docs/a.txt");
        verify(s3Client).deleteObject(any(DeleteObjectRequest.class));
    }

    @Test
    void presignGet_returnsUrl() throws Exception {
        PresignedGetObjectRequest presigned = mock(PresignedGetObjectRequest.class);
        when(presigned.url())
                .thenReturn(URI.create("http://127.0.0.1:4900/java-admin/docs/a.txt?X-Amz-Signature=1")
                        .toURL());
        when(s3Presigner.presignGetObject(any(GetObjectPresignRequest.class))).thenReturn(presigned);

        assertThat(storage.presignGet("docs/a.txt", Duration.ofMinutes(5))).contains("X-Amz-Signature=1");
    }

    @Test
    void put_negativeLength_throws() {
        assertThatThrownBy(() -> storage.put(new PutCommand("a.txt", new ByteArrayInputStream(new byte[0]), -1, null)))
                .isInstanceOf(BizException.class);
    }

    @Test
    void put_sdkClientFailure_isRemoteCallFailed() {
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenThrow(SdkClientException.create("timeout"));
        byte[] body = "hi".getBytes(StandardCharsets.UTF_8);
        assertThatThrownBy(() ->
                        storage.put(new PutCommand("docs/a.txt", new ByteArrayInputStream(body), body.length, null)))
                .isInstanceOf(BizException.class)
                .extracting(ex -> ((BizException) ex).getCode())
                .isEqualTo(ResultCode.REMOTE_CALL_FAILED.getCode());
    }
}
