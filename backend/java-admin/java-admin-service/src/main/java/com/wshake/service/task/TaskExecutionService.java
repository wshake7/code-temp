package com.wshake.service.task;

import com.easy.query.core.api.pagination.EasyPageResult;
import com.wshake.common.exception.BizException;
import com.wshake.common.result.PageData;
import com.wshake.common.result.ResultCode;
import com.wshake.service.entity.TemporalTaskExecution;
import com.wshake.service.repository.TemporalTaskConfigRepository;
import com.wshake.service.repository.TemporalTaskExecutionRepository;
import com.wshake.service.task.TaskManageModels.TaskExecutionListQuery;
import com.wshake.service.task.TaskManageModels.TaskExecutionView;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 任务执行记录 Service：分页/详情（只读；配置名软解析）。
 *
 * @author wshake
 */
@Service
@RequiredArgsConstructor
public class TaskExecutionService {

    private final TemporalTaskExecutionRepository executionRepository;
    private final TemporalTaskConfigRepository configRepository;

    public PageData<TaskExecutionView> page(TaskExecutionListQuery query) {
        if (query.status() != null && !TaskManageModels.EXECUTION_STATUSES.contains(query.status())) {
            throw BizException.of(
                    ResultCode.PARAM_INVALID, "status must be one of " + TaskManageModels.EXECUTION_STATUSES);
        }
        EasyPageResult<TemporalTaskExecution> page = executionRepository.page(
                query.page(),
                query.pageSize(),
                query.configId(),
                query.status(),
                query.startedAtFrom(),
                query.startedAtTo());
        List<TemporalTaskExecution> rows = page.getData() == null ? List.of() : page.getData();
        Map<Long, String> nameMap = resolveConfigNames(rows);
        return PageData.of(
                rows.stream().map(r -> toView(r, nameMap.get(r.getConfigId()))).toList(), page.getTotal());
    }

    public TaskExecutionView getById(Long id) {
        if (id == null) {
            throw BizException.of(ResultCode.PARAM_INVALID, "id 不能为空");
        }
        TemporalTaskExecution row = executionRepository.findById(id);
        if (row == null) {
            throw BizException.of(ResultCode.PARAM_INVALID, "task-execution " + id + " not found");
        }
        String configName = null;
        if (row.getConfigId() != null) {
            configName =
                    configRepository.mapNameByIds(List.of(row.getConfigId())).get(row.getConfigId());
        }
        return toView(row, configName);
    }

    private Map<Long, String> resolveConfigNames(List<TemporalTaskExecution> rows) {
        Set<Long> ids = rows.stream()
                .map(TemporalTaskExecution::getConfigId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));
        return configRepository.mapNameByIds(ids);
    }

    private TaskExecutionView toView(TemporalTaskExecution e, String configName) {
        return new TaskExecutionView(
                e.getId(),
                e.getConfigId(),
                configName,
                e.getWorkflowId(),
                e.getRunId(),
                e.getWorkflowType(),
                e.getTaskQueue(),
                e.getStatus(),
                e.getStartedAt(),
                e.getClosedAt(),
                TaskJsonSupport.parseObject(e.getInputSummary(), "inputSummary"),
                TaskJsonSupport.parseObject(e.getResultSummary(), "resultSummary"),
                e.getFailureReason(),
                e.getCreatedAt());
    }
}
