package com.wshake.infra.config;

import com.wshake.infra.security.CryptoService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 安全加解密相关 Bean。
 *
 * @author wshake
 */
@Configuration(proxyBeanMethods = false)
public final class SecurityCryptoConfig {

    @Bean
    public CryptoService cryptoService() {
        return new CryptoService();
    }
}
