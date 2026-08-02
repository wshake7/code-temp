package com.wshake.infra.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 请求安全中间件开关（Timestamp / Encrypt / Nonce / Sign / Language 独立）。
 *
 * <p>对应 {@code app.security.*}；dev 默认全开。
 *
 * @author wshake
 */
@Data
@Component
@ConfigurationProperties(prefix = "app.security")
public class SecurityProperties {

    private Timestamp timestamp = new Timestamp();
    private Encrypt encrypt = new Encrypt();
    private Nonce nonce = new Nonce();
    private Sign sign = new Sign();
    private Language language = new Language();

    @Data
    public static class Timestamp {
        /** 是否校验请求时间窗。 */
        private boolean enabled = true;
        /** 允许的时间偏差（毫秒），默认 5 分钟。 */
        private long expireMs = 5 * 60 * 1000L;
    }

    @Data
    public static class Encrypt {
        /** 是否强制请求加密（白名单除外）并加解密 body。 */
        private boolean enabled = true;
    }

    @Data
    public static class Nonce {
        /** 是否拒绝重复 X-Request-ID。 */
        private boolean enabled = true;
        /**
         * Nonce TTL（毫秒）。{@code <= 0} 时使用 {@code timestamp.expireMs * 2}（对齐 Go）。
         */
        private long expireMs = 0;
    }

    @Data
    public static class Sign {
        /** 是否在 Encrypt 关闭时独立校验签名。 */
        private boolean enabled = true;
    }

    @Data
    public static class Language {
        /** 是否解析 X-Language / Accept-Language 并写入请求上下文。 */
        private boolean enabled = true;
    }

    /** Nonce 有效 TTL：显式配置优先，否则 2 倍时间窗。 */
    public long resolveNonceExpireMs() {
        long configured = nonce != null ? nonce.getExpireMs() : 0;
        if (configured > 0) {
            return configured;
        }
        long window = timestamp != null ? timestamp.getExpireMs() : 5 * 60 * 1000L;
        return window * 2;
    }
}
