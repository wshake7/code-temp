package com.wshake.infra.http;

import java.time.Duration;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 出站 HTTP 客户端配置。
 *
 * <p>对应 {@code app.http.*}。超时 {@link Duration#ZERO} 表示该项关闭（对齐 OkHttp）。
 *
 * @author wshake
 */
@Data
@ConfigurationProperties(prefix = "app.http")
public class HttpClientProperties {

    /** 建立连接超时。 */
    private Duration connectTimeout = Duration.ofSeconds(5);

    /** 读超时。 */
    private Duration readTimeout = Duration.ofSeconds(30);

    /** 写超时。 */
    private Duration writeTimeout = Duration.ofSeconds(10);

    /** 整次调用超时；0 表示关闭。 */
    private Duration callTimeout = Duration.ZERO;

    /** 连接池。 */
    private Pool pool = new Pool();

    /**
     * 校验超时与连接池。
     */
    public void validate() {
        requireNonNegative("connect-timeout", connectTimeout);
        requireNonNegative("read-timeout", readTimeout);
        requireNonNegative("write-timeout", writeTimeout);
        requireNonNegative("call-timeout", callTimeout);
        if (pool == null) {
            throw new IllegalStateException("app.http.pool 不能为空");
        }
        if (pool.getMaxIdleConnections() <= 0) {
            throw new IllegalStateException("app.http.pool.max-idle-connections 必须为正");
        }
        Duration keepAlive = pool.getKeepAlive();
        if (keepAlive == null || keepAlive.isZero() || keepAlive.isNegative()) {
            throw new IllegalStateException("app.http.pool.keep-alive 必须为正");
        }
    }

    private static void requireNonNegative(String field, Duration value) {
        if (value == null || value.isNegative()) {
            throw new IllegalStateException("app.http." + field + " 不能为负");
        }
    }

    /**
     * 连接池。
     */
    @Data
    public static class Pool {

        /** 每地址最大空闲连接数。 */
        private int maxIdleConnections = 5;

        /** 空闲连接保活时长。 */
        private Duration keepAlive = Duration.ofMinutes(5);
    }
}
