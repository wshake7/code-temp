package com.wshake.infra.temporal.workflow;

import io.temporal.spring.boot.ActivityImpl;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * {@link ReportDailyActivities} Spring Bean；由 workers-auto-discovery 注册到 queue {@code reports}。
 *
 * @author wshake
 */
@Component
@ActivityImpl(taskQueues = ReportDailyWorkflowImpl.TASK_QUEUE)
public class ReportDailyActivitiesImpl implements ReportDailyActivities {

    private static final Logger log = LoggerFactory.getLogger(ReportDailyActivitiesImpl.class);

    @Override
    public Map<String, Object> generateReport(Map<String, Object> input) {
        Map<String, Object> safeInput = input == null ? Map.of() : input;
        log.info("ReportDaily activity running, inputKeys={}", safeInput.keySet());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "ok");
        result.put("generatedAt", Instant.now().toString());
        result.put("configCode", safeInput.get("configCode"));
        result.put("message", "demo report generated");
        return result;
    }
}
