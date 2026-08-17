package com.wshake.infra.http;

import java.util.concurrent.TimeUnit;
import okhttp3.ConnectionPool;
import okhttp3.OkHttpClient;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 装配进程内共享 {@link OkHttpClient}。
 *
 * <p>业务与适配层应注入本 Bean，不要自行 {@code new OkHttpClient()}。
 *
 * @author wshake
 */
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(HttpClientProperties.class)
public class HttpClientConfiguration {

    /**
     * 共享出站客户端。
     *
     * @param properties HTTP 配置
     * @return 单例 OkHttpClient
     */
    @Bean
    public OkHttpClient okHttpClient(HttpClientProperties properties) {
        properties.validate();
        HttpClientProperties.Pool pool = properties.getPool();
        return new OkHttpClient.Builder()
                .connectTimeout(properties.getConnectTimeout())
                .readTimeout(properties.getReadTimeout())
                .writeTimeout(properties.getWriteTimeout())
                .callTimeout(properties.getCallTimeout())
                .connectionPool(new ConnectionPool(
                        pool.getMaxIdleConnections(), pool.getKeepAlive().toMillis(), TimeUnit.MILLISECONDS))
                .build();
    }

    /**
     * 关闭 dispatcher 线程池并清空连接，避免进程退出后残留。
     *
     * @param okHttpClient 共享客户端
     * @return 销毁回调
     */
    @Bean
    public DisposableBean okHttpClientShutdown(OkHttpClient okHttpClient) {
        return () -> {
            okHttpClient.dispatcher().executorService().shutdown();
            okHttpClient.connectionPool().evictAll();
        };
    }
}
