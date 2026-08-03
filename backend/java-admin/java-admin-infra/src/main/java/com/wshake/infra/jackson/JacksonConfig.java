package com.wshake.infra.jackson;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Jackson {@link ObjectMapper} 全局 Bean。
 *
 * <p>项目未启用 Spring Boot Jackson 自动配置时，显式注册供日志切面、序列化等复用。
 *
 * @author wshake
 */
@Configuration(proxyBeanMethods = false)
public final class JacksonConfig {

    /**
     * 提供全局 ObjectMapper：支持 Java Time，未知字段不失败，日期不写时间戳。
     *
     * @return 配置完成的 ObjectMapper
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        return mapper;
    }
}
