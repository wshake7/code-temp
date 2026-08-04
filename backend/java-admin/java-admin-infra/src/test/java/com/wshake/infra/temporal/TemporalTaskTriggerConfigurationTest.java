package com.wshake.infra.temporal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.wshake.service.port.TaskTriggerPort;
import com.wshake.service.repository.TemporalTaskConfigRepository;
import com.wshake.service.task.LocalTaskTriggerPort;
import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowClientOptions;
import io.temporal.client.schedules.ScheduleClient;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 验证 Temporal 连接属性开启/关闭时 TaskTriggerPort / Schedule 同步装配切换。
 */
class TemporalTaskTriggerConfigurationTest {

    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withUserConfiguration(TemporalTaskTriggerConfiguration.class)
            .withPropertyValues("spring.main.web-application-type=none");

    @Test
    void withoutTemporalTarget_usesLocalPort() {
        runner.withPropertyValues("spring.temporal.connection.target=").run(ctx -> {
            assertThat(ctx).hasSingleBean(TaskTriggerPort.class);
            assertThat(ctx.getBean(TaskTriggerPort.class)).isInstanceOf(LocalTaskTriggerPort.class);
            assertThat(ctx).doesNotHaveBean(ScheduleClient.class);
            assertThat(ctx).doesNotHaveBean(TemporalTaskScheduleSync.class);
            assertThat(ctx).doesNotHaveBean(TemporalTaskScheduleSyncRunner.class);
            assertThat(ctx).hasSingleBean(TemporalTaskScheduleSyncDisabledNotice.class);
        });
    }

    @Test
    void withTemporalTarget_usesTemporalPortAndScheduleSync() {
        // withBean 先于 Configuration 注册，满足 @ConditionalOnMissingBean(ScheduleClient)
        runner.withUserConfiguration(WorkflowClientFixture.class)
                .withBean(ScheduleClient.class, () -> mock(ScheduleClient.class))
                .withBean(TemporalTaskConfigRepository.class, () -> mock(TemporalTaskConfigRepository.class))
                .withPropertyValues("spring.temporal.connection.target=127.0.0.1:4723")
                .run(ctx -> {
                    assertThat(ctx).hasSingleBean(TaskTriggerPort.class);
                    assertThat(ctx.getBean(TaskTriggerPort.class)).isInstanceOf(TemporalTaskTriggerPort.class);
                    assertThat(ctx).hasSingleBean(ScheduleClient.class);
                    assertThat(ctx).hasSingleBean(TemporalTaskScheduleSync.class);
                    assertThat(ctx).hasSingleBean(TemporalTaskScheduleSyncRunner.class);
                });
    }

    @Test
    void withTestServerEnabled_usesTemporalPort() {
        runner.withUserConfiguration(WorkflowClientFixture.class)
                .withBean(ScheduleClient.class, () -> mock(ScheduleClient.class))
                .withBean(TemporalTaskConfigRepository.class, () -> mock(TemporalTaskConfigRepository.class))
                .withPropertyValues("spring.temporal.test-server.enabled=true")
                .run(ctx -> {
                    assertThat(ctx).hasSingleBean(TaskTriggerPort.class);
                    assertThat(ctx.getBean(TaskTriggerPort.class)).isInstanceOf(TemporalTaskTriggerPort.class);
                    assertThat(ctx).hasSingleBean(TemporalTaskScheduleSyncRunner.class);
                });
    }

    @Configuration(proxyBeanMethods = false)
    static class WorkflowClientFixture {
        @Bean
        WorkflowClient workflowClient() {
            WorkflowClient client = mock(WorkflowClient.class);
            when(client.getOptions())
                    .thenReturn(WorkflowClientOptions.newBuilder().setNamespace("default").build());
            return client;
        }
    }
}
