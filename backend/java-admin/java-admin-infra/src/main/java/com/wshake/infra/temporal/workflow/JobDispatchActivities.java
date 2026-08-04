package com.wshake.infra.temporal.workflow;

import com.wshake.infra.temporal.workflow.JobDispatchModels.CompleteExecutionInput;
import com.wshake.infra.temporal.workflow.JobDispatchModels.CreateExecutionInput;
import com.wshake.infra.temporal.workflow.JobDispatchModels.CreateExecutionResult;
import io.temporal.activity.ActivityInterface;
import io.temporal.activity.ActivityMethod;

/**
 * 派发流程用 Activity：落库 / 更新 {@code temporal_task_execution}。
 *
 * @author wshake
 */
@ActivityInterface
public interface JobDispatchActivities {

    /** 子 Workflow 启动后写入 RUNNING 记录。 */
    @ActivityMethod
    CreateExecutionResult createExecution(CreateExecutionInput input);

    /** 子 Workflow 结束后更新终态。 */
    @ActivityMethod
    void completeExecution(CompleteExecutionInput input);
}
