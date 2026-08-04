package com.wshake.infra.temporal.workflow;

import com.wshake.service.task.TemporalTaskQueue;
import io.temporal.activity.ActivityOptions;
import io.temporal.spring.boot.WorkflowImpl;
import io.temporal.workflow.Workflow;
import java.time.Duration;
import java.util.Map;

/**
 * {@link LogCountTickWorkflow} 实现：单次 tick（Activity 计数+1 并打日志后结束）。
 *
 * <p>节拍由 Temporal Schedule（DB {@code cron_expr} / interval）驱动，不再在 Workflow 内
 * {@code sleep} 死循环，避免与 Schedule 叠多实例或固定 workflowId 挡住后续调度。
 * Worker 注册队列见 {@link TemporalTaskQueue#DEMO}。
 *
 * @author wshake
 */
@WorkflowImpl(taskQueues = TemporalTaskQueue.DEMO)
public class LogCountTickWorkflowImpl implements LogCountTickWorkflow {

    private final LogCountTickActivities activities = Workflow.newActivityStub(
            LogCountTickActivities.class,
            ActivityOptions.newBuilder()
                    .setStartToCloseTimeout(Duration.ofSeconds(30))
                    .build());

    @Override
    public void run(Map<String, Object> input) {
        long count = activities.incrementAndLog();
        Workflow.getLogger(LogCountTickWorkflowImpl.class)
                .info("LogCountTick done count={} inputKeys={}", count, input == null ? 0 : input.size());
    }
}
