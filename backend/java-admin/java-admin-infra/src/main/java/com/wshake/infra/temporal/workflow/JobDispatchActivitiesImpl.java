package com.wshake.infra.temporal.workflow;

import com.wshake.infra.temporal.workflow.JobDispatchModels.CompleteExecutionInput;
import com.wshake.infra.temporal.workflow.JobDispatchModels.CreateExecutionInput;
import com.wshake.infra.temporal.workflow.JobDispatchModels.CreateExecutionResult;
import com.wshake.infra.temporal.workflow.JobDispatchModels.MarkRunningInput;
import com.wshake.service.entity.TemporalTaskExecution;
import com.wshake.service.repository.TemporalTaskExecutionRepository;
import com.wshake.service.task.TaskJsonSupport;
import com.wshake.service.task.TemporalTaskQueue;
import io.temporal.spring.boot.ActivityImpl;
import java.time.LocalDateTime;
import java.time.ZoneId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * {@link JobDispatchActivities} 实现：写 {@code temporal_task_execution}。
 *
 * @author wshake
 */
@Component
@ActivityImpl(taskQueues = TemporalTaskQueue.DEMO)
public class JobDispatchActivitiesImpl implements JobDispatchActivities {

    private static final Logger log = LoggerFactory.getLogger(JobDispatchActivitiesImpl.class);

    private static final int FAILURE_REASON_MAX = 1024;

    private final TemporalTaskExecutionRepository executionRepository;

    public JobDispatchActivitiesImpl(TemporalTaskExecutionRepository executionRepository) {
        this.executionRepository = executionRepository;
    }

    @Override
    public CreateExecutionResult createExecution(CreateExecutionInput input) {
        if (input == null) {
            throw new IllegalArgumentException("createExecution input is required");
        }
        if (input.temporalWorkflowId() == null || input.temporalWorkflowId().isBlank()) {
            throw new IllegalArgumentException("temporalWorkflowId is required");
        }
        if (input.temporalRunId() == null || input.temporalRunId().isBlank()) {
            throw new IllegalArgumentException("temporalRunId is required");
        }
        LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
        TemporalTaskExecution row = new TemporalTaskExecution();
        row.setConfigId(input.configId());
        row.setWorkflowId(input.temporalWorkflowId().trim());
        row.setRunId(input.temporalRunId().trim());
        row.setWorkflowType(nullToEmpty(input.workflowType()));
        row.setTaskQueue(nullToEmpty(input.taskQueue()));
        // 尚未真正运行：PENDING 且 startedAt 为空，等 markRunning 再写入
        row.setStatus("PENDING");
        row.setStartedAt(null);
        row.setClosedAt(null);
        row.setInputSummary(TaskJsonSupport.toJson(input.input(), "inputSummary"));
        row.setResultSummary(null);
        row.setFailureReason(null);
        row.setCreatedAt(now);
        executionRepository.insert(row);
        log.info(
                "execution pending: id={} workflowId={} runId={} configId={}",
                row.getId(),
                row.getWorkflowId(),
                row.getRunId(),
                row.getConfigId());
        return new CreateExecutionResult(row.getId());
    }

    @Override
    public void markRunning(MarkRunningInput input) {
        if (input == null || input.id() == null) {
            throw new IllegalArgumentException("markRunning id is required");
        }
        if (input.temporalWorkflowId() == null || input.temporalWorkflowId().isBlank()) {
            throw new IllegalArgumentException("temporalWorkflowId is required");
        }
        if (input.temporalRunId() == null || input.temporalRunId().isBlank()) {
            throw new IllegalArgumentException("temporalRunId is required");
        }
        LocalDateTime startedAt = LocalDateTime.now(ZoneId.systemDefault());
        long n = executionRepository.markRunning(
                input.id(),
                input.temporalWorkflowId().trim(),
                input.temporalRunId().trim(),
                startedAt);
        log.info(
                "execution running: id={} workflowId={} runId={} startedAt={} rows={}",
                input.id(),
                input.temporalWorkflowId(),
                input.temporalRunId(),
                startedAt,
                n);
    }

    @Override
    public void completeExecution(CompleteExecutionInput input) {
        if (input == null || input.id() == null) {
            throw new IllegalArgumentException("completeExecution id is required");
        }
        if (input.status() == null || input.status().isBlank()) {
            throw new IllegalArgumentException("completeExecution status is required");
        }
        String resultJson = toResultJson(input.result());
        String failure = truncate(input.errorMessage(), FAILURE_REASON_MAX);
        LocalDateTime closedAt = LocalDateTime.now(ZoneId.systemDefault());
        long n = executionRepository.complete(input.id(), input.status().trim(), resultJson, failure, closedAt);
        log.info("execution completed: id={} status={} rows={}", input.id(), input.status(), n);
    }

    static String toResultJson(Object result) {
        if (result == null) {
            return null;
        }
        if (result instanceof java.util.Map<?, ?>) {
            return TaskJsonSupport.toJson(result, "resultSummary");
        }
        // 非 Map 结果包一层，满足 JSON 对象列约束
        return TaskJsonSupport.toJson(java.util.Map.of("value", String.valueOf(result)), "resultSummary");
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private static String truncate(String value, int max) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
    }
}
