package com.wshake.infra.temporal.workflow;

import io.temporal.activity.ActivityOptions;
import io.temporal.spring.boot.WorkflowImpl;
import io.temporal.workflow.Workflow;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * {@link ReportDailyWorkflow} 实现；由 workers-auto-discovery 扫描注册到 queue {@code reports}。
 *
 * <p>非 Spring Bean（由 classpath scan 实例化），符合 Temporal Workflow 无状态约束。
 *
 * @author wshake
 */
@WorkflowImpl(taskQueues = ReportDailyWorkflowImpl.TASK_QUEUE)
public class ReportDailyWorkflowImpl implements ReportDailyWorkflow {

    /** 与 seed/mock 中 report_daily.task_queue 对齐。 */
    public static final String TASK_QUEUE = "reports";

    private final ReportDailyActivities activities = Workflow.newActivityStub(
            ReportDailyActivities.class,
            ActivityOptions.newBuilder()
                    .setStartToCloseTimeout(Duration.ofMinutes(5))
                    .build());

    @Override
    public Map<String, Object> run(Map<String, Object> input) {
        Map<String, Object> safeInput = input == null ? Map.of() : input;
        Map<String, Object> activityResult = activities.generateReport(safeInput);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("workflow", "ReportDailyWorkflow");
        result.put("input", safeInput);
        result.put("activity", activityResult);
        return result;
    }
}
