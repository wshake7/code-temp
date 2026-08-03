package com.wshake.service.task;

import com.wshake.service.port.TaskTriggerPort;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

/**
 * 本地任务触发实现（默认）：不连 Temporal，生成 mock 风格 workflowId/runId。
 *
 * <p>后续接入真实 Temporal 时新增 {@code TemporalTaskTriggerPort} 并注册为 Bean 即可覆盖本实现
 * （本类带 {@link ConditionalOnMissingBean}）。
 *
 * @author wshake
 */
@Component
@ConditionalOnMissingBean(TaskTriggerPort.class)
public class LocalTaskTriggerPort implements TaskTriggerPort {

    private static final DateTimeFormatter STAMP = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final AtomicLong seq = new AtomicLong(0);

    @Override
    public TriggerResult start(TriggerRequest request) {
        long n = seq.incrementAndGet();
        String stamp = LocalDateTime.now(ZoneId.systemDefault()).format(STAMP);
        String code = request.code() == null || request.code().isBlank() ? "task" : request.code();
        String workflowId = "wf-" + code + "-" + stamp + "-" + n;
        String runId = "run-" + stamp + "-" + n;
        return new TriggerResult(workflowId, runId);
    }
}
