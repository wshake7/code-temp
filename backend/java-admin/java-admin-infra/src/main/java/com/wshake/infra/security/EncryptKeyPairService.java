package com.wshake.infra.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wshake.common.constant.RedisKeys;
import java.security.KeyPair;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/**
 * 全局 RSA 加解密密钥对的 Redis cache-aside。
 *
 * @author wshake
 */
@Slf4j
@Service
public class EncryptKeyPairService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final StringRedisTemplate redis;

    public EncryptKeyPairService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    /** 从 Redis 读取密钥对；缓存未命中返回 null。 */
    public EncryptKeyPair getEncryptKeyPair() {
        String json = redis.opsForValue().get(RedisKeys.GLOBAL_ENCRYPT_KEY_PAIR);
        if (json == null || json.isEmpty()) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readValue(json, EncryptKeyPair.class);
        } catch (Exception e) {
            log.error("反序列化 encrypt key pair 失败", e);
            return null;
        }
    }

    /** 写入 Redis。 */
    public void setEncryptKeyPair(String publicKey, String privateKey) {
        try {
            EncryptKeyPair pair = new EncryptKeyPair(publicKey, privateKey);
            String json = OBJECT_MAPPER.writeValueAsString(pair);
            redis.opsForValue().set(RedisKeys.GLOBAL_ENCRYPT_KEY_PAIR, json);
            log.info("全局 encrypt key pair 已写入 Redis");
        } catch (Exception e) {
            log.error("序列化 encrypt key pair 到 Redis 失败", e);
        }
    }

    /** 生成 RSA 密钥对并缓存。 */
    public KeyPairResult generateAndCacheKeyPair() {
        KeyPair keyPair = CryptoService.generateRsaKeyPair();
        String publicKey = CryptoService.toBase64(keyPair.getPublic());
        String privateKeyPem = CryptoService.toPem(keyPair.getPrivate());
        setEncryptKeyPair(publicKey, privateKeyPem);
        return new KeyPairResult(publicKey, privateKeyPem);
    }

    public record KeyPairResult(String publicKey, String privateKeyPem) {}
}
