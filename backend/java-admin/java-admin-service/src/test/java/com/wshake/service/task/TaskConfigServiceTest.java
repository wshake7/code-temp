package com.wshake.service.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.wshake.common.exception.BizException;
import com.wshake.service.entity.TemporalTaskConfig;
import com.wshake.service.entity.TemporalTaskExecution;
import com.wshake.service.port.TaskTriggerPort;
import com.wshake.service.port.TaskTriggerPort.TriggerResult;
import com.wshake.service.repository.TemporalTaskConfigRepository;
import com.wshake.service.repository.TemporalTaskExecutionRepository;
import com.wshake.service.task.TaskManageModels.CreateTaskConfigCommand;
import com.wshake.service.task.TaskManageModels.TaskBatchCommand;
import com.wshake.service.task.TaskManageModels.TaskBatchResult;
import com.wshake.service.task.TaskManageModels.TaskTriggerResult;
import com.wshake.service.task.TaskManageModels.UpdateTaskConfigCommand;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

/**
 * {@link TaskConfigService} 校验与触发逻辑单测。
 */
class TaskConfigServiceTest {

    private final TemporalTaskConfigRepository configRepository = mock(TemporalTaskConfigRepository.class);
    private final TemporalTaskExecutionRepository executionRepository = mock(TemporalTaskExecutionRepository.class);
    private final TaskTriggerPort taskTriggerPort = mock(TaskTriggerPort.class);
    private TaskConfigService service;

    @BeforeEach
    void setUp() {
        service = new TaskConfigService(configRepository, executionRepository, taskTriggerPort);
    }

    @Test
    void create_rejectsInvalidCode() {
        CreateTaskConfigCommand cmd =
                new CreateTaskConfigCommand("Bad-Code", "n", "Wf", "q", null, null, null, null, 1);

        assertThatThrownBy(() -> service.create(cmd))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("code must match");
    }

    @Test
    void create_rejectsDuplicateCode() {
        when(configRepository.existsByCode("report_daily", null)).thenReturn(true);
        CreateTaskConfigCommand cmd = new CreateTaskConfigCommand(
                "report_daily", "日报", "ReportDailyWorkflow", "reports", null, null, null, null, 1);

        assertThatThrownBy(() -> service.create(cmd))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void update_partialIsEnabledOnly() {
        TemporalTaskConfig row = activeConfig(1L, "report_daily", 1);
        when(configRepository.findById(1L)).thenReturn(row);
        when(configRepository.update(row)).thenReturn(1L);

        UpdateTaskConfigCommand cmd = new UpdateTaskConfigCommand(
                1L, null, false, null, false, null, false, null, false, null, false, null, false, null, false, null,
                false, 0, true);

        service.update(cmd);

        assertThat(row.getIsEnabled()).isEqualTo(0);
        assertThat(row.getName()).isEqualTo("日报");
        verify(configRepository).update(row);
    }

    @Test
    void trigger_rejectsDisabled() {
        when(configRepository.findById(1L)).thenReturn(activeConfig(1L, "report_daily", 0));

        assertThatThrownBy(() -> service.trigger(1L))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("disabled");
        verify(taskTriggerPort, never()).start(any());
    }

    @Test
    void trigger_writesRunningExecution() {
        TemporalTaskConfig config = activeConfig(1L, "report_daily", 1);
        when(configRepository.findById(1L)).thenReturn(config);
        when(taskTriggerPort.start(any())).thenReturn(new TriggerResult("wf-1", "run-1"));
        when(executionRepository.findById(any())).thenAnswer(inv -> {
            TemporalTaskExecution e = new TemporalTaskExecution();
            e.setId(99L);
            e.setConfigId(1L);
            e.setWorkflowId("wf-1");
            e.setRunId("run-1");
            e.setWorkflowType("ReportDailyWorkflow");
            e.setTaskQueue("reports");
            e.setStatus("RUNNING");
            return e;
        });

        TaskTriggerResult result = service.trigger(1L);

        assertThat(result.config().code()).isEqualTo("report_daily");
        assertThat(result.execution().status()).isEqualTo("RUNNING");
        ArgumentCaptor<TemporalTaskExecution> cap = ArgumentCaptor.forClass(TemporalTaskExecution.class);
        verify(executionRepository).insert(cap.capture());
        assertThat(cap.getValue().getWorkflowId()).isEqualTo("wf-1");
        assertThat(cap.getValue().getStatus()).isEqualTo("RUNNING");
        assertThat(cap.getValue().getInputSummary()).contains("manual");
    }

    @Test
    void batch_triggerSkipsDisabled() {
        TemporalTaskConfig enabled = activeConfig(1L, "a", 1);
        TemporalTaskConfig disabled = activeConfig(2L, "b", 0);
        when(configRepository.listByIds(List.of(1L, 2L))).thenReturn(List.of(enabled, disabled));
        when(configRepository.findById(1L)).thenReturn(enabled);
        when(taskTriggerPort.start(any())).thenReturn(new TriggerResult("wf-x", "run-x"));
        when(executionRepository.findById(any())).thenAnswer(inv -> {
            TemporalTaskExecution e = new TemporalTaskExecution();
            e.setId(50L);
            e.setConfigId(1L);
            e.setStatus("RUNNING");
            e.setWorkflowId("wf-x");
            e.setRunId("run-x");
            e.setWorkflowType("ReportDailyWorkflow");
            e.setTaskQueue("reports");
            return e;
        });

        TaskBatchResult result = service.batch(new TaskBatchCommand("trigger", List.of(1L, 2L)));

        assertThat(result.affected()).isEqualTo(1);
        assertThat(result.ids()).containsExactly(1L);
        assertThat(result.skippedDisabled()).containsExactly(2L);
        assertThat(result.executionIds()).containsExactly(50L);
        verify(taskTriggerPort).start(any());
    }

    @Test
    void softDelete_allowsExistingExecutions() {
        when(configRepository.findById(3L)).thenReturn(activeConfig(3L, "data_archive", 1));
        when(configRepository.softDeleteById(3L)).thenReturn(1L);

        var view = service.softDelete(3L);

        assertThat(view.deletedAt()).isGreaterThan(0L);
        verify(configRepository).softDeleteById(eq(3L));
    }

    private static TemporalTaskConfig activeConfig(Long id, String code, int enabled) {
        TemporalTaskConfig c = new TemporalTaskConfig();
        c.setId(id);
        c.setCode(code);
        c.setName("日报");
        c.setWorkflowType("ReportDailyWorkflow");
        c.setTaskQueue("reports");
        c.setCronExpr("0 0 2 * * ?");
        c.setRetryPolicy("{\"maxAttempts\":3}");
        c.setTimeoutSeconds(3600);
        c.setRemark("");
        c.setIsEnabled(enabled);
        c.setDeletedAt(0L);
        return c;
    }
}
