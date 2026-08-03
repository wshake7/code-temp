package com.wshake.infra.temporal;

import com.wshake.service.port.TaskTriggerPort;
import com.wshake.service.task.LocalTaskTriggerPort;
import io.temporal.client.WorkflowClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 任务触发端口统一装配（Temporal / 本地回退）。
 *
 * <p>条件与 Temporal Spring Boot starter 对齐：
 * {@code spring.temporal.test-server.enabled=true} 或
 * {@code spring.temporal.connection.target} 非空时创建 {@link WorkflowClient}。
 * 使用属性表达式而非 {@code @ConditionalOnBean(WorkflowClient)}，避免 user-config
 * 先于 auto-config 求值导致永远回退本地实现。
 *
 * @author wshake
 * @see <a href="https://docs.temporal.io/develop/java/integrations/spring-boot-integration">Spring Boot integration</a>
 */
@Configuration(proxyBeanMethods = false)
public class TemporalTaskTriggerConfiguration {

    /**
     * starter 启用时注册真实 Temporal 触发器。
     */
    @Bean
    @ConditionalOnExpression(
            "${spring.temporal.test-server.enabled:false} || '${spring.temporal.connection.target:}'.length() > 0")
    public TaskTriggerPort temporalTaskTriggerPort(WorkflowClient workflowClient) {
        return new TemporalTaskTriggerPort(workflowClient);
    }

    /**
     * 未配置 Temporal 连接时回退本地 mock 触发。
     */
    @Bean
    @ConditionalOnMissingBean(TaskTriggerPort.class)
    public TaskTriggerPort localTaskTriggerPort() {
        return new LocalTaskTriggerPort();
    }
}
