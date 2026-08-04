package com.wshake.infra.temporal.workflow;

import com.wshake.infra.temporal.TemporalTaskTriggerPort;
import com.wshake.infra.temporal.workflow.JobDispatchModels.CompleteExecutionInput;
import com.wshake.infra.temporal.workflow.JobDispatchModels.CreateExecutionInput;
import com.wshake.infra.temporal.workflow.JobDispatchModels.CreateExecutionResult;
import com.wshake.infra.temporal.workflow.JobDispatchModels.DispatchInput;
import com.wshake.service.task.TemporalTaskQueue;
import io.temporal.activity.ActivityOptions;
import io.temporal.api.common.v1.WorkflowExecution;
import io.temporal.common.RetryOptions;
import io.temporal.failure.CanceledFailure;
import io.temporal.failure.ChildWorkflowFailure;
import io.temporal.failure.TimeoutFailure;
import io.temporal.spring.boot.WorkflowImpl;
import io.temporal.workflow.ChildWorkflowOptions;
import io.temporal.workflow.ChildWorkflowStub;
import io.temporal.workflow.Promise;
import io.temporal.workflow.Workflow;
import java.time.Duration;
import java.util.Map;

/**
 * {@link JobDispatchWorkflow} 实现。
 *
 * <p>顺序：untyped child start → CreateExecution → wait child → CompleteExecution。
 * 业务失败时先 complete 再 rethrow，使派发 WF 与业务结果一致。
 *
 * @author wshake
 */
@WorkflowImpl(taskQueues = TemporalTaskQueue.DEMO)
public class JobDispatchWorkflowImpl implements JobDispatchWorkflow {

    private final JobDispatchActivities activities = Workflow.newActivityStub(
            JobDispatchActivities.class,
            ActivityOptions.newBuilder()
                    .setStartToCloseTimeout(Duration.ofMinutes(1))
                    .setRetryOptions(RetryOptions.newBuilder()
                            .setInitialInterval(Duration.ofSeconds(1))
                            .setBackoffCoefficient(2.0)
                            .setMaximumAttempts(3)
                            .build())
                    .build());

    @Override
    public void dispatch(DispatchInput input) {
        if (input == null) {
            throw new IllegalArgumentException("dispatch input is required");
        }
        String workflowType = requireNonBlank(input.workflowType(), "workflowType");
        String taskQueue = requireNonBlank(input.taskQueue(), "taskQueue");
        String childWorkflowId = buildChildWorkflowId(input);

        ChildWorkflowOptions.Builder childOptions =
                ChildWorkflowOptions.newBuilder().setWorkflowId(childWorkflowId).setTaskQueue(taskQueue);
        if (input.timeoutSeconds() != null && input.timeoutSeconds() > 0) {
            childOptions.setWorkflowExecutionTimeout(Duration.ofSeconds(input.timeoutSeconds()));
        }
        RetryOptions childRetry = TemporalTaskTriggerPort.toRetryOptions(input.retryPolicy());
        if (childRetry != null) {
            childOptions.setRetryOptions(childRetry);
        }

        ChildWorkflowStub child = Workflow.newUntypedChildWorkflowStub(workflowType, childOptions.build());
        Object childArg = input.input() == null ? Map.of() : input.input();
        Promise<Object> childResultPromise = child.executeAsync(Object.class, childArg);

        WorkflowExecution execution = child.getExecution().get();
        CreateExecutionResult created = activities.createExecution(new CreateExecutionInput(
                input.configId(),
                execution.getWorkflowId(),
                execution.getRunId(),
                workflowType,
                taskQueue,
                input.input()));

        try {
            Object childResult = childResultPromise.get();
            activities.completeExecution(new CompleteExecutionInput(created.id(), "COMPLETED", childResult, null));
        } catch (Exception ex) {
            String status = mapErrorStatus(ex);
            String message = rootMessage(ex);
            activities.completeExecution(new CompleteExecutionInput(created.id(), status, null, message));
            throw ex;
        }
    }

    static String buildChildWorkflowId(DispatchInput input) {
        String prefix = input.workflowIdPrefix();
        if (prefix == null || prefix.isBlank()) {
            prefix = input.configCode();
        }
        if (prefix == null || prefix.isBlank()) {
            prefix = "job";
        }
        return prefix.trim() + "-" + Workflow.currentTimeMillis();
    }

    /**
     * 将 child 失败映射为执行记录状态。
     */
    static String mapErrorStatus(Throwable error) {
        Throwable cursor = error;
        while (cursor != null) {
            if (cursor instanceof CanceledFailure) {
                return "CANCELLED";
            }
            if (cursor instanceof TimeoutFailure) {
                return "TIMED_OUT";
            }
            if (cursor instanceof ChildWorkflowFailure child && child.getCause() != null) {
                cursor = child.getCause();
                continue;
            }
            cursor = cursor.getCause();
        }
        return "FAILED";
    }

    static String rootMessage(Throwable error) {
        if (error == null) {
            return null;
        }
        Throwable cursor = error;
        while (cursor.getCause() != null && !cursor.getCause().equals(cursor)) {
            cursor = cursor.getCause();
        }
        String msg = cursor.getMessage();
        return msg == null || msg.isBlank() ? error.toString() : msg;
    }

    private static String requireNonBlank(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return value.trim();
    }
}
