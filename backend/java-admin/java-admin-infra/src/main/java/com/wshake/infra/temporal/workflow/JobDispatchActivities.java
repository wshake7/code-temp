package com.wshake.infra.temporal.workflow;

import com.wshake.infra.temporal.workflow.JobDispatchModels.CompleteExecutionInput;
import com.wshake.infra.temporal.workflow.JobDispatchModels.CreateExecutionInput;
import com.wshake.infra.temporal.workflow.JobDispatchModels.CreateExecutionResult;
import com.wshake.infra.temporal.workflow.JobDispatchModels.MarkRunningInput;
import io.temporal.activity.ActivityInterface;
import io.temporal.activity.ActivityMethod;

/**
 * 派发流程用 Activity：落库 / 更新 {@code temporal_task_execution}。
 *
 * @author wshake
 */
@ActivityInterface
public interface JobDispatchActivities {

    /** 派发开始时写入 PENDING 记录（startedAt 为空，等待 child 实际启动）。 */
    @ActivityMethod
    CreateExecutionResult createExecution(CreateExecutionInput input);

    /** 子 Workflow 实际启动后推进为 RUNNING。 */
    @ActivityMethod
    void markRunning(MarkRunningInput input);

    /** 子 Workflow 结束后更新终态。 */
    @ActivityMethod
    void completeExecution(CompleteExecutionInput input);
}
