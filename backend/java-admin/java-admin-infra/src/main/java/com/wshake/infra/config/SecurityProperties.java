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
        /** 是否拒绝重复 X-Request-ID（后续 ticket）。 */
        private boolean enabled = true;
    }

    @Data
    public static class Sign {
        /** 是否在 Encrypt 关闭时独立校验签名（后续 ticket）。 */
        private boolean enabled = true;
    }

    @Data
    public static class Language {
        /** 是否解析 X-Language（后续 ticket）。 */
        private boolean enabled = true;
    }
}
