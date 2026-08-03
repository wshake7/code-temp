package com.wshake.service.task;

import com.wshake.service.port.TaskTriggerPort;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 任务触发端口默认装配。
 *
 * <p>{@link ConditionalOnMissingBean} 必须用在 {@code @Bean} 方法上（而非 {@code @Component}
 * 类上），否则启动时默认实现可能不会注册，导致 {@link TaskConfigService} 注入失败。
 *
 * @author wshake
 */
@Configuration
public class TaskTriggerConfiguration {

    @Bean
    @ConditionalOnMissingBean(TaskTriggerPort.class)
    public TaskTriggerPort taskTriggerPort() {
        return new LocalTaskTriggerPort();
    }
}
