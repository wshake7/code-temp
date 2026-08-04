package com.wshake.infra.temporal.workflow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.wshake.infra.temporal.workflow.JobDispatchModels.CompleteExecutionInput;
import com.wshake.infra.temporal.workflow.JobDispatchModels.CreateExecutionInput;
import com.wshake.infra.temporal.workflow.JobDispatchModels.CreateExecutionResult;
import com.wshake.service.entity.TemporalTaskExecution;
import com.wshake.service.repository.TemporalTaskExecutionRepository;
import java.time.LocalDateTime;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

/**
 * {@link JobDispatchActivitiesImpl} 单元测试。
 */
class JobDispatchActivitiesImplTest {

    private final TemporalTaskExecutionRepository repository = mock(TemporalTaskExecutionRepository.class);
    private JobDispatchActivitiesImpl activities;

    @BeforeEach
    void setUp() {
        activities = new JobDispatchActivitiesImpl(repository);
    }

    @Test
    void createExecution_insertsRunningRow() {
        org.mockito.Mockito.doAnswer(inv -> {
                    TemporalTaskExecution row = inv.getArgument(0);
                    row.setId(42L);
                    return null;
                })
                .when(repository)
                .insert(any());

        CreateExecutionResult result = activities.createExecution(new CreateExecutionInput(
                1L, "child-wf-1", "run-1", "LogCountTickWorkflow", "demo", Map.of("trigger", "manual")));

        assertThat(result.id()).isEqualTo(42L);
        ArgumentCaptor<TemporalTaskExecution> cap = ArgumentCaptor.forClass(TemporalTaskExecution.class);
        verify(repository).insert(cap.capture());
        TemporalTaskExecution row = cap.getValue();
        assertThat(row.getConfigId()).isEqualTo(1L);
        assertThat(row.getWorkflowId()).isEqualTo("child-wf-1");
        assertThat(row.getRunId()).isEqualTo("run-1");
        assertThat(row.getStatus()).isEqualTo("RUNNING");
        assertThat(row.getInputSummary()).contains("manual");
        assertThat(row.getClosedAt()).isNull();
    }

    @Test
    void createExecution_rejectsBlankWorkflowId() {
        assertThatThrownBy(() -> activities.createExecution(new CreateExecutionInput(1L, " ", "run", "t", "q", null)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("temporalWorkflowId");
    }

    @Test
    void completeExecution_updatesTerminalStatus() {
        when(repository.complete(eq(9L), eq("COMPLETED"), any(), any(), any(LocalDateTime.class)))
                .thenReturn(1L);

        activities.completeExecution(new CompleteExecutionInput(9L, "COMPLETED", Map.of("ok", true), null));

        verify(repository).complete(eq(9L), eq("COMPLETED"), eq("{\"ok\":true}"), eq(null), any(LocalDateTime.class));
    }

    @Test
    void toResultJson_wrapsNonMap() {
        assertThat(JobDispatchActivitiesImpl.toResultJson(123L)).isEqualTo("{\"value\":\"123\"}");
        assertThat(JobDispatchActivitiesImpl.toResultJson(null)).isNull();
    }

    @Test
    void mapErrorStatus_detectsCancelAndTimeout() {
        assertThat(JobDispatchWorkflowImpl.mapErrorStatus(new io.temporal.failure.CanceledFailure("c")))
                .isEqualTo("CANCELLED");
        assertThat(JobDispatchWorkflowImpl.mapErrorStatus(new io.temporal.failure.TimeoutFailure(
                        "t", null, io.temporal.api.enums.v1.TimeoutType.TIMEOUT_TYPE_START_TO_CLOSE)))
                .isEqualTo("TIMED_OUT");
        assertThat(JobDispatchWorkflowImpl.mapErrorStatus(new RuntimeException("x")))
                .isEqualTo("FAILED");
    }
}
