package com.wshake.infra.security;

import com.wshake.common.constant.RedisKeys;
import java.time.Duration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/**
 * 基于 Redis {@code SET NX EX} 的 Nonce 存储。
 *
 * @author wshake
 */
@Component
public class RedisNonceStore implements NonceStore {

    private final StringRedisTemplate redis;

    public RedisNonceStore(StringRedisTemplate redis) {
        this.redis = redis;
    }

    @Override
    public boolean tryAcquire(String nonce, long ttlMs) {
        Boolean ok =
                redis.opsForValue().setIfAbsent(RedisKeys.SECURITY_NONCE_PREFIX + nonce, "1", Duration.ofMillis(ttlMs));
        return Boolean.TRUE.equals(ok);
    }
}
