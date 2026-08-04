package com.wshake.infra.temporal.workflow;

import io.temporal.activity.ActivityOptions;
import io.temporal.spring.boot.WorkflowImpl;
import io.temporal.workflow.Workflow;
import java.time.Duration;
import java.util.Map;

/**
 * {@link LogCountTickWorkflow} 实现：每 intervalSeconds 调用一次 Activity，避免无限 History 膨胀时
 * continue-as-new。
 *
 * @author wshake
 */
@WorkflowImpl(taskQueues = LogCountTickWorkflowImpl.TASK_QUEUE)
public class LogCountTickWorkflowImpl implements LogCountTickWorkflow {

    /** 与 seed log_count_tick.task_queue 对齐。 */
    public static final String TASK_QUEUE = "demo";

    private static final int DEFAULT_INTERVAL_SECONDS = 10;
    private static final int DEFAULT_MAX_TICKS_BEFORE_CONTINUE = 60;

    private final LogCountTickActivities activities = Workflow.newActivityStub(
            LogCountTickActivities.class,
            ActivityOptions.newBuilder()
                    .setStartToCloseTimeout(Duration.ofSeconds(30))
                    .build());

    @Override
    public void run(Map<String, Object> input) {
        Map<String, Object> safeInput = input == null ? Map.of() : input;
        int intervalSeconds = positiveInt(safeInput.get("intervalSeconds"), DEFAULT_INTERVAL_SECONDS);
        int maxTicks = positiveInt(safeInput.get("maxTicksBeforeContinueAsNew"), DEFAULT_MAX_TICKS_BEFORE_CONTINUE);

        for (int i = 0; i < maxTicks; i++) {
            long count = activities.incrementAndLog();
            Workflow.getLogger(LogCountTickWorkflowImpl.class).info("LogCountTick tick={} count={}", i + 1, count);
            Workflow.sleep(Duration.ofSeconds(intervalSeconds));
        }

        // 继续新一轮，保持节拍不中断且限制单次 run History 长度
        Workflow.continueAsNew(safeInput);
    }

    private static int positiveInt(Object raw, int defaultValue) {
        if (raw instanceof Number number) {
            int v = number.intValue();
            return v > 0 ? v : defaultValue;
        }
        if (raw instanceof String text) {
            try {
                int v = Integer.parseInt(text.trim());
                return v > 0 ? v : defaultValue;
            } catch (NumberFormatException ignored) {
                return defaultValue;
            }
        }
        return defaultValue;
    }
}
