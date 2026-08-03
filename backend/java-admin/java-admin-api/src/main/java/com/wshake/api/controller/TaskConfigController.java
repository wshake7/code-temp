package com.wshake.api.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wshake.api.dto.CreateTaskConfigRequest;
import com.wshake.api.dto.TaskConfigBatchRequest;
import com.wshake.api.vo.TaskConfigBatchResultVO;
import com.wshake.api.vo.TaskConfigVO;
import com.wshake.api.vo.TaskExecutionVO;
import com.wshake.api.vo.TaskTriggerResultVO;
import com.wshake.common.result.PageData;
import com.wshake.common.result.Result;
import com.wshake.service.task.TaskConfigService;
import com.wshake.service.task.TaskManageModels.CreateTaskConfigCommand;
import com.wshake.service.task.TaskManageModels.TaskBatchCommand;
import com.wshake.service.task.TaskManageModels.TaskBatchResult;
import com.wshake.service.task.TaskManageModels.TaskConfigListQuery;
import com.wshake.service.task.TaskManageModels.TaskConfigView;
import com.wshake.service.task.TaskManageModels.TaskTriggerResult;
import com.wshake.service.task.TaskManageModels.UpdateTaskConfigCommand;
import io.github.linpeilie.Converter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 任务配置管理（路径对齐 mock {@code /api/system/task-config/*}）。
 *
 * @author wshake
 */
@Tag(name = "任务配置", description = "分页/CRUD/软删/batch/手动触发")
@RestController
@RequestMapping("/api/system/task-config")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TaskConfigController {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    private final TaskConfigService taskConfigService;
    private final Converter converter;
    private final ObjectMapper objectMapper;

    @GetMapping("/list")
    @Operation(summary = "分页查询任务配置", description = "筛选 code/name/status；软删不出现")
    public Result<PageData<TaskConfigVO>> list(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize,
            @RequestParam(required = false) List<String> code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer status) {
        PageData<TaskConfigView> pageData =
                taskConfigService.page(TaskConfigListQuery.of(page, pageSize, code, name, status));
        List<TaskConfigVO> items = converter.convert(pageData.getItems(), TaskConfigVO.class);
        return Result.ok(PageData.of(items, pageData.getTotal()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "任务配置详情")
    public Result<TaskConfigVO> detail(@PathVariable Long id) {
        return Result.ok(converter.convert(taskConfigService.getById(id), TaskConfigVO.class));
    }

    @PostMapping
    @Operation(summary = "创建任务配置")
    public Result<TaskConfigVO> create(@Valid @RequestBody CreateTaskConfigRequest req) {
        CreateTaskConfigCommand cmd = converter.convert(req, CreateTaskConfigCommand.class);
        return Result.ok(converter.convert(taskConfigService.create(cmd), TaskConfigVO.class));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新任务配置", description = "按 JSON 字段是否出现决定是否修改（对齐 mock）")
    public Result<TaskConfigVO> update(@PathVariable Long id, @RequestBody JsonNode body) {
        UpdateTaskConfigCommand cmd = toUpdateCommand(id, body == null ? objectMapper.nullNode() : body);
        return Result.ok(converter.convert(taskConfigService.update(cmd), TaskConfigVO.class));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "软删任务配置", description = "允许存在 execution")
    public Result<TaskConfigVO> delete(@PathVariable Long id) {
        return Result.ok(converter.convert(taskConfigService.softDelete(id), TaskConfigVO.class));
    }

    @PostMapping("/batch")
    @Operation(summary = "批量 enable|disable|delete|trigger")
    public Result<TaskConfigBatchResultVO> batch(@RequestBody TaskConfigBatchRequest req) {
        TaskBatchResult result = taskConfigService.batch(new TaskBatchCommand(req.getAction(), req.getIds()));
        return Result.ok(new TaskConfigBatchResultVO(
                result.action(), result.affected(), result.ids(), result.executionIds(), result.skippedDisabled()));
    }

    @PostMapping("/{id}/trigger")
    @Operation(summary = "手动触发任务配置")
    public Result<TaskTriggerResultVO> trigger(@PathVariable Long id) {
        TaskTriggerResult result = taskConfigService.trigger(id);
        return Result.ok(new TaskTriggerResultVO(
                converter.convert(result.config(), TaskConfigVO.class),
                converter.convert(result.execution(), TaskExecutionVO.class)));
    }

    private UpdateTaskConfigCommand toUpdateCommand(Long id, JsonNode body) {
        boolean codePresent = body.has("code");
        boolean namePresent = body.has("name");
        boolean workflowTypePresent = body.has("workflowType");
        boolean taskQueuePresent = body.has("taskQueue");
        boolean cronExprPresent = body.has("cronExpr");
        boolean retryPolicyPresent = body.has("retryPolicy");
        boolean timeoutSecondsPresent = body.has("timeoutSeconds");
        boolean remarkPresent = body.has("remark");
        boolean isEnabledPresent = body.has("isEnabled");

        String code =
                codePresent && !body.get("code").isNull() ? body.get("code").asText() : null;
        String name =
                namePresent && !body.get("name").isNull() ? body.get("name").asText() : null;
        String workflowType = workflowTypePresent && !body.get("workflowType").isNull()
                ? body.get("workflowType").asText()
                : null;
        String taskQueue = taskQueuePresent && !body.get("taskQueue").isNull()
                ? body.get("taskQueue").asText()
                : null;
        String cronExpr = cronExprPresent && !body.get("cronExpr").isNull()
                ? body.get("cronExpr").asText()
                : null;
        Map<String, Object> retryPolicy = null;
        if (retryPolicyPresent && !body.get("retryPolicy").isNull()) {
            retryPolicy = objectMapper.convertValue(body.get("retryPolicy"), MAP_TYPE);
        }
        Integer timeoutSeconds = null;
        if (timeoutSecondsPresent && !body.get("timeoutSeconds").isNull()) {
            timeoutSeconds = body.get("timeoutSeconds").asInt();
        }
        String remark = remarkPresent && !body.get("remark").isNull()
                ? body.get("remark").asText()
                : null;
        Integer isEnabled = null;
        if (isEnabledPresent && !body.get("isEnabled").isNull()) {
            isEnabled = body.get("isEnabled").asInt();
        }

        return new UpdateTaskConfigCommand(
                id,
                code,
                codePresent,
                name,
                namePresent,
                workflowType,
                workflowTypePresent,
                taskQueue,
                taskQueuePresent,
                cronExpr,
                cronExprPresent,
                retryPolicy,
                retryPolicyPresent,
                timeoutSeconds,
                timeoutSecondsPresent,
                remark,
                remarkPresent,
                isEnabled,
                isEnabledPresent);
    }
}
