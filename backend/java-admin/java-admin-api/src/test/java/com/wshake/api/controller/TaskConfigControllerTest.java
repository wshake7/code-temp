package com.wshake.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.wshake.api.dto.CreateTaskConfigRequest;
import com.wshake.api.dto.TaskConfigBatchRequest;
import com.wshake.api.vo.TaskConfigBatchResultVO;
import com.wshake.api.vo.TaskConfigVO;
import com.wshake.api.vo.TaskTriggerResultVO;
import com.wshake.common.result.PageData;
import com.wshake.common.result.Result;
import com.wshake.service.task.TaskConfigService;
import com.wshake.service.task.TaskManageModels.CreateTaskConfigCommand;
import com.wshake.service.task.TaskManageModels.TaskBatchResult;
import com.wshake.service.task.TaskManageModels.TaskConfigListQuery;
import com.wshake.service.task.TaskManageModels.TaskConfigView;
import com.wshake.service.task.TaskManageModels.TaskExecutionView;
import com.wshake.service.task.TaskManageModels.TaskTriggerResult;
import com.wshake.service.task.TaskManageModels.UpdateTaskConfigCommand;
import io.github.linpeilie.Converter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;

/**
 * {@link TaskConfigController} 契约测试。
 */
class TaskConfigControllerTest {

    private final TaskConfigService taskConfigService = mock(TaskConfigService.class);
    private final Converter converter = new Converter();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final TaskConfigController controller =
            new TaskConfigController(taskConfigService, converter, objectMapper);

    @Test
    void list_returnsItemsTotal() {
        when(taskConfigService.page(ArgumentMatchers.any(TaskConfigListQuery.class)))
                .thenReturn(PageData.of(List.of(sampleConfig(1L, "report_daily")), 1L));

        Result<PageData<TaskConfigVO>> result = controller.list(1, 20, null, null, null);

        assertThat(result.getCode()).isEqualTo(0);
        assertThat(result.getData().getTotal()).isEqualTo(1L);
        assertThat(result.getData().getItems().get(0).getCode()).isEqualTo("report_daily");
    }

    @Test
    void create_mapsBody() {
        when(taskConfigService.create(ArgumentMatchers.any(CreateTaskConfigCommand.class)))
                .thenReturn(sampleConfig(10L, "cache_warmup"));
        CreateTaskConfigRequest req = new CreateTaskConfigRequest();
        req.setCode("cache_warmup");
        req.setName("缓存预热");
        req.setWorkflowType("CacheWarmupWorkflow");
        req.setTaskQueue("maintenance");

        Result<TaskConfigVO> result = controller.create(req);

        assertThat(result.getCode()).isEqualTo(0);
        ArgumentCaptor<CreateTaskConfigCommand> cap = ArgumentCaptor.forClass(CreateTaskConfigCommand.class);
        verify(taskConfigService).create(cap.capture());
        assertThat(cap.getValue().code()).isEqualTo("cache_warmup");
        assertThat(cap.getValue().workflowType()).isEqualTo("CacheWarmupWorkflow");
    }

    @Test
    void update_usesFieldPresence() {
        when(taskConfigService.update(ArgumentMatchers.any(UpdateTaskConfigCommand.class)))
                .thenReturn(sampleConfig(2L, "report_daily"));
        ObjectNode body = objectMapper.createObjectNode();
        body.put("isEnabled", 0);

        Result<TaskConfigVO> result = controller.update(2L, body);

        assertThat(result.getCode()).isEqualTo(0);
        ArgumentCaptor<UpdateTaskConfigCommand> cap = ArgumentCaptor.forClass(UpdateTaskConfigCommand.class);
        verify(taskConfigService).update(cap.capture());
        UpdateTaskConfigCommand cmd = cap.getValue();
        assertThat(cmd.id()).isEqualTo(2L);
        assertThat(cmd.isEnabledPresent()).isTrue();
        assertThat(cmd.isEnabled()).isEqualTo(0);
        assertThat(cmd.namePresent()).isFalse();
        assertThat(cmd.cronExprPresent()).isFalse();
    }

    @Test
    void update_canClearCronExprWithNull() {
        when(taskConfigService.update(ArgumentMatchers.any(UpdateTaskConfigCommand.class)))
                .thenReturn(sampleConfig(2L, "report_daily"));
        ObjectNode body = objectMapper.createObjectNode();
        body.putNull("cronExpr");

        controller.update(2L, body);

        ArgumentCaptor<UpdateTaskConfigCommand> cap = ArgumentCaptor.forClass(UpdateTaskConfigCommand.class);
        verify(taskConfigService).update(cap.capture());
        assertThat(cap.getValue().cronExprPresent()).isTrue();
        assertThat(cap.getValue().cronExpr()).isNull();
    }

    @Test
    void batch_returnsTriggerExtras() {
        when(taskConfigService.batch(ArgumentMatchers.any()))
                .thenReturn(new TaskBatchResult("trigger", 1, List.of(1L), List.of(99L), List.of(2L)));
        TaskConfigBatchRequest req = new TaskConfigBatchRequest();
        req.setAction("trigger");
        req.setIds(List.of(1L, 2L));

        Result<TaskConfigBatchResultVO> result = controller.batch(req);

        assertThat(result.getData().getAffected()).isEqualTo(1);
        assertThat(result.getData().getExecutionIds()).containsExactly(99L);
        assertThat(result.getData().getSkippedDisabled()).containsExactly(2L);
    }

    @Test
    void trigger_returnsConfigAndExecution() {
        when(taskConfigService.trigger(1L))
                .thenReturn(new TaskTriggerResult(sampleConfig(1L, "report_daily"), sampleExecution(9L, 1L)));

        Result<TaskTriggerResultVO> result = controller.trigger(1L);

        assertThat(result.getData().getConfig().getCode()).isEqualTo("report_daily");
        assertThat(result.getData().getExecution().getId()).isEqualTo(9L);
    }

    private static TaskConfigView sampleConfig(Long id, String code) {
        LocalDateTime now = LocalDateTime.of(2026, 1, 1, 0, 0);
        return new TaskConfigView(
                id,
                code,
                "名称",
                "ReportDailyWorkflow",
                "reports",
                "0 0 2 * * ?",
                Map.of("maxAttempts", 3),
                3600,
                "",
                1,
                0L,
                now,
                now,
                0L,
                0L);
    }

    private static TaskExecutionView sampleExecution(Long id, Long configId) {
        LocalDateTime now = LocalDateTime.of(2026, 6, 20, 2, 0);
        return new TaskExecutionView(
                id,
                configId,
                "名称",
                "wf-report-1",
                "run-1",
                "ReportDailyWorkflow",
                "reports",
                "RUNNING",
                now,
                null,
                Map.of("trigger", "manual"),
                null,
                null,
                now);
    }
}
