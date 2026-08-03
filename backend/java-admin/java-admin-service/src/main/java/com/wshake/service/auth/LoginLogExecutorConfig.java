package com.wshake.service.auth;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 登录日志异步执行器。
 *
 * @author wshake
 */
@Configuration
public final class LoginLogExecutorConfig {

    @Bean(name = "loginLogExecutor")
    public Executor loginLogExecutor() {
        // Java 21 虚拟线程：轻量 fire-and-forget
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}
