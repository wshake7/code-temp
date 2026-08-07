package com.wshake.infra.temporal.workflow;

import static org.assertj.core.api.Assertions.assertThat;

import io.temporal.api.enums.v1.WorkflowExecutionStatus;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * {@link ExecutionMirrorTickActivitiesImpl} 纯函数映射单测。
 */
class ExecutionMirrorTickActivitiesImplTest {

    @Test
    void mapStatus_coversTerminalAndRunning() {
        assertThat(ExecutionMirrorTickActivitiesImpl.mapStatus(WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_COMPLETED))
                .isEqualTo("COMPLETED");
        assertThat(ExecutionMirrorTickActivitiesImpl.mapStatus(WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_FAILED))
                .isEqualTo("FAILED");
        assertThat(ExecutionMirrorTickActivitiesImpl.mapStatus(WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_CANCELED))
                .isEqualTo("CANCELLED");
        assertThat(ExecutionMirrorTickActivitiesImpl.mapStatus(WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_TIMED_OUT))
                .isEqualTo("TIMED_OUT");
        assertThat(ExecutionMirrorTickActivitiesImpl.mapStatus(WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_RUNNING))
                .isEqualTo("RUNNING");
        assertThat(ExecutionMirrorTickActivitiesImpl.mapStatus(WorkflowExecutionStatus.WORKFLOW_EXECUTION_STATUS_PAUSED))
                .isEqualTo("RUNNING");
    }

    @Test
    void shouldSkipSystemAndLegacyDispatch() {
        assertThat(ExecutionMirrorTickActivitiesImpl.shouldSkipWorkflow("sys-execution-mirror-1", "X"))
                .isTrue();
        assertThat(ExecutionMirrorTickActivitiesImpl.shouldSkipWorkflow("wf-a-1", "ExecutionMirrorTickWorkflow"))
                .isTrue();
        assertThat(ExecutionMirrorTickActivitiesImpl.shouldSkipWorkflow("wf-a-1", "JobDispatchWorkflow"))
                .isTrue();
        assertThat(ExecutionMirrorTickActivitiesImpl.shouldSkipWorkflow("wf-log_count_tick-1", "LogCountTickWorkflow"))
                .isFalse();
    }

    @Test
    void toResultJson_wrapsScalar() {
        assertThat(ExecutionMirrorTickActivitiesImpl.toResultJson(12)).contains("\"value\"");
        assertThat(ExecutionMirrorTickActivitiesImpl.toResultJson(null)).isNull();
    }

    @Test
    void extractInputFromResult_readsInputKey() {
        assertThat(ExecutionMirrorTickActivitiesImpl.extractInputFromResult(
                        Map.of("count", 1L, "input", Map.of("trigger", "manual"))))
                .contains("\"trigger\"")
                .contains("manual");
        assertThat(ExecutionMirrorTickActivitiesImpl.extractInputFromResult(Map.of("count", 1L))).isNull();
        assertThat(ExecutionMirrorTickActivitiesImpl.extractInputFromResult(null)).isNull();
        assertThat(ExecutionMirrorTickActivitiesImpl.decodeStartedInput(null, null)).isNull();
    }
}
