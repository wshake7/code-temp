package com.wshake.infra.storage;

import com.wshake.service.port.StoragePort;
import java.net.URI;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

/**
 * 按 {@code app.storage.type} 装配唯一 {@link StoragePort}。
 *
 * @author wshake
 */
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(StorageProperties.class)
public class StorageConfiguration {

    /**
     * 本地磁盘适配。
     *
     * @param properties 存储配置
     * @return local 端口
     */
    @Bean
    @ConditionalOnProperty(prefix = "app.storage", name = "type", havingValue = "local", matchIfMissing = true)
    public StoragePort localStoragePort(StorageProperties properties) {
        properties.validate();
        return new LocalStorageAdapter(properties);
    }

    /**
     * S3 客户端。
     *
     * @param properties 存储配置
     * @return 可关闭的 S3Client
     */
    @Bean(destroyMethod = "close")
    @ConditionalOnProperty(prefix = "app.storage", name = "type", havingValue = "s3")
    public S3Client storageS3Client(StorageProperties properties) {
        properties.validate();
        StorageProperties.S3 s3 = properties.getS3();
        return S3Client.builder()
                .httpClientBuilder(UrlConnectionHttpClient.builder())
                .endpointOverride(URI.create(s3.getEndpoint()))
                .region(Region.of(s3.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(s3.getAccessKey(), s3.getSecretKey())))
                .forcePathStyle(s3.isPathStyle())
                .build();
    }

    /**
     * S3 预签名客户端。
     *
     * @param properties 存储配置
     * @return 可关闭的 S3Presigner
     */
    @Bean(destroyMethod = "close")
    @ConditionalOnProperty(prefix = "app.storage", name = "type", havingValue = "s3")
    public S3Presigner storageS3Presigner(StorageProperties properties) {
        properties.validate();
        StorageProperties.S3 s3 = properties.getS3();
        return S3Presigner.builder()
                .endpointOverride(URI.create(s3.getEndpoint()))
                .region(Region.of(s3.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(s3.getAccessKey(), s3.getSecretKey())))
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(s3.isPathStyle())
                        .build())
                .build();
    }

    /**
     * S3 适配。
     *
     * @param properties 存储配置
     * @param s3Client   客户端
     * @param s3Presigner 预签名客户端
     * @return s3 端口
     */
    @Bean
    @ConditionalOnProperty(prefix = "app.storage", name = "type", havingValue = "s3")
    public StoragePort s3StoragePort(StorageProperties properties, S3Client s3Client, S3Presigner s3Presigner) {
        properties.validate();
        return new S3StorageAdapter(properties, s3Client, s3Presigner);
    }
}
