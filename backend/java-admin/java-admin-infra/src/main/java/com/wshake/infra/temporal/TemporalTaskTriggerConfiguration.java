package com.wshake.infra.temporal;

import com.wshake.service.port.TaskTriggerPort;
import com.wshake.service.repository.TemporalTaskConfigRepository;
import com.wshake.service.task.LocalTaskTriggerPort;
import io.temporal.client.WorkflowClient;
import io.temporal.client.schedules.ScheduleClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 任务触发端口统一装配（Temporal / 本地回退）+ 启动时 Schedule 同步。
 *
 * <p>条件与 Temporal Spring Boot starter 对齐：
 * {@code spring.temporal.test-server.enabled=true} 或
 * {@code spring.temporal.connection.target} 非空时创建 {@link WorkflowClient} /
 * {@link ScheduleClient}（由 {@code RootNamespaceAutoConfiguration} 自动装配，勿重复定义同名 Bean）。
 * 使用属性表达式而非 {@code @ConditionalOnBean(WorkflowClient)}，避免 user-config
 * 先于 auto-config 求值导致永远回退本地实现。
 *
 * <p>Worker 优雅停机见 {@link TemporalWorkerGracefulShutdownConfiguration}。
 *
 * @author wshake
 * @see <a href="https://docs.temporal.io/develop/java/integrations/spring-boot-integration">Spring Boot integration</a>
 */
@Configuration(proxyBeanMethods = false)
public class TemporalTaskTriggerConfiguration {

    private static final String TEMPORAL_ENABLED =
            "${spring.temporal.test-server.enabled:false} || '${spring.temporal.connection.target:}'.length() > 0";

    /**
     * starter 启用时注册真实 Temporal 触发器。
     */
    @Bean
    @ConditionalOnExpression(TEMPORAL_ENABLED)
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

    /**
     * DB → Temporal Schedule 同步器。
     *
     * <p>{@link ScheduleClient} 由 Temporal starter 自动配置（bean 名 temporalScheduleClient）。
     */
    @Bean
    @ConditionalOnExpression(TEMPORAL_ENABLED)
    public TemporalTaskScheduleSync temporalTaskScheduleSync(
            ScheduleClient scheduleClient, TemporalTaskConfigRepository configRepository) {
        return new TemporalTaskScheduleSync(scheduleClient, configRepository);
    }

    /**
     * 启动后执行一次同步。
     */
    @Bean
    @ConditionalOnExpression(TEMPORAL_ENABLED)
    public TemporalTaskScheduleSyncRunner temporalTaskScheduleSyncRunner(TemporalTaskScheduleSync scheduleSync) {
        return new TemporalTaskScheduleSyncRunner(scheduleSync);
    }

    /**
     * Temporal 未启用时打明确日志，避免「重启了却没同步」时难以排查。
     */
    @Bean
    @ConditionalOnMissingBean(TemporalTaskScheduleSyncRunner.class)
    public TemporalTaskScheduleSyncDisabledNotice temporalTaskScheduleSyncDisabledNotice() {
        return new TemporalTaskScheduleSyncDisabledNotice();
    }
}
