package com.wshake.infra.temporal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.wshake.service.port.TaskTriggerPort;
import com.wshake.service.task.LocalTaskTriggerPort;
import io.temporal.client.WorkflowClient;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 验证 Temporal 连接属性开启/关闭时 TaskTriggerPort 的装配切换。
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
        });
    }

    @Test
    void withTemporalTarget_usesTemporalPort() {
        runner.withUserConfiguration(WorkflowClientFixture.class)
                .withPropertyValues("spring.temporal.connection.target=127.0.0.1:4723")
                .run(ctx -> {
                    assertThat(ctx).hasSingleBean(TaskTriggerPort.class);
                    assertThat(ctx.getBean(TaskTriggerPort.class)).isInstanceOf(TemporalTaskTriggerPort.class);
                });
    }

    @Test
    void withTestServerEnabled_usesTemporalPort() {
        runner.withUserConfiguration(WorkflowClientFixture.class)
                .withPropertyValues("spring.temporal.test-server.enabled=true")
                .run(ctx -> {
                    assertThat(ctx).hasSingleBean(TaskTriggerPort.class);
                    assertThat(ctx.getBean(TaskTriggerPort.class)).isInstanceOf(TemporalTaskTriggerPort.class);
                });
    }

    @Configuration(proxyBeanMethods = false)
    static class WorkflowClientFixture {
        @Bean
        WorkflowClient workflowClient() {
            return mock(WorkflowClient.class);
        }
    }
}
