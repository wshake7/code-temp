package com.wshake.infra.temporal.workflow;

import com.wshake.infra.temporal.workflow.JobDispatchModels.DispatchInput;
import com.wshake.service.task.TemporalWorkflowType;
import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;

/**
 * 任务派发包装 Workflow：启动业务 child Workflow，并经 Activity 写入执行记录。
 *
 * <p>对齐 Go {@code temporaljob.JobDispatchWorkflow}。手动 trigger 与 Schedule 均启动本类型，
 * 而非直接启动业务 Workflow。
 *
 * @author wshake
 */
@WorkflowInterface
public interface JobDispatchWorkflow {

    /**
     * 派发并等待业务 child 结束。
     *
     * @param input 配置快照 + 业务类型/队列/入参
     */
    @WorkflowMethod(name = TemporalWorkflowType.JOB_DISPATCH)
    void dispatch(DispatchInput input);
}
