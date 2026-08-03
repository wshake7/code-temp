package com.wshake.infra.crypto;

/**
 * 全局 RSA 密钥对（Redis 缓存结构）。
 *
 * @param publicKey  X.509 SPKI base64（非 PEM 包装）
 * @param privateKey PKCS#8 PEM
 * @author wshake
 */
public record EncryptKeyPair(String publicKey, String privateKey) {}
