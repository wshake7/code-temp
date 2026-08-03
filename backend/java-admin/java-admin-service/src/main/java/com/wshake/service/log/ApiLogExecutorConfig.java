package com.wshake.service.log;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * API 调用日志异步执行器。
 *
 * @author wshake
 */
@Configuration
public class ApiLogExecutorConfig {

    @Bean(name = "apiLogExecutor")
    public Executor apiLogExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}
