package com.wshake.infra.temporal.workflow;

import com.wshake.service.task.TemporalTaskQueue;
import io.temporal.activity.ActivityOptions;
import io.temporal.spring.boot.WorkflowImpl;
import io.temporal.workflow.Workflow;
import java.time.Duration;

/**
 * {@link ExecutionMirrorTickWorkflow} 实现：调用一次镜像 Activity 后结束。
 *
 * @author wshake
 */
@WorkflowImpl(taskQueues = TemporalTaskQueue.DEMO)
public class ExecutionMirrorTickWorkflowImpl implements ExecutionMirrorTickWorkflow {

    private final ExecutionMirrorTickActivities activities = Workflow.newActivityStub(
            ExecutionMirrorTickActivities.class,
            ActivityOptions.newBuilder()
                    .setStartToCloseTimeout(Duration.ofMinutes(2))
                    .build());

    @Override
    public void run() {
        int n = activities.mirrorOnce();
        Workflow.getLogger(ExecutionMirrorTickWorkflowImpl.class).info("ExecutionMirrorTick done touched={}", n);
    }
}
