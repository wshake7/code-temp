package com.wshake.infra.temporal;

import com.wshake.common.exception.BizException;
import com.wshake.common.result.ResultCode;
import com.wshake.service.port.TaskTriggerPort;
import io.temporal.api.common.v1.WorkflowExecution;
import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import io.temporal.client.WorkflowServiceException;
import io.temporal.client.WorkflowStub;
import io.temporal.common.RetryOptions;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 基于 Temporal {@link WorkflowClient} 的任务触发实现。
 *
 * <p>使用 untyped stub，按配置中的 {@code workflowType}/{@code taskQueue} 启动；
 * 由 {@link TemporalTaskTriggerConfiguration} 在 Temporal 连接属性启用时注册。
 *
 * @author wshake
 */
public class TemporalTaskTriggerPort implements TaskTriggerPort {

    private static final Logger log = LoggerFactory.getLogger(TemporalTaskTriggerPort.class);

    private static final DateTimeFormatter STAMP = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final WorkflowClient workflowClient;
    private final AtomicLong seq = new AtomicLong(0);

    public TemporalTaskTriggerPort(WorkflowClient workflowClient) {
        this.workflowClient = workflowClient;
    }

    @Override
    public TriggerResult start(TriggerRequest request) {
        if (request == null) {
            throw BizException.of(ResultCode.PARAM_INVALID, "trigger request is required");
        }
        String workflowType = requireNonBlank(request.workflowType(), "workflowType");
        String taskQueue = requireNonBlank(request.taskQueue(), "taskQueue");
        String workflowId = buildWorkflowId(request.code());

        WorkflowOptions.Builder options =
                WorkflowOptions.newBuilder().setWorkflowId(workflowId).setTaskQueue(taskQueue);

        if (request.timeoutSeconds() != null && request.timeoutSeconds() > 0) {
            options.setWorkflowExecutionTimeout(Duration.ofSeconds(request.timeoutSeconds()));
        }

        RetryOptions retryOptions = toRetryOptions(request.retryPolicy());
        if (retryOptions != null) {
            options.setRetryOptions(retryOptions);
        }

        Map<String, Object> input = request.input() == null ? Map.of() : request.input();
        try {
            WorkflowStub stub = workflowClient.newUntypedWorkflowStub(workflowType, options.build());
            WorkflowExecution execution = stub.start(input);
            log.info(
                    "Temporal workflow started: type={} queue={} workflowId={} runId={}",
                    workflowType,
                    taskQueue,
                    execution.getWorkflowId(),
                    execution.getRunId());
            return new TriggerResult(execution.getWorkflowId(), execution.getRunId());
        } catch (WorkflowServiceException ex) {
            throw BizException.of(ResultCode.REMOTE_CALL_FAILED, "Temporal start failed: " + ex.getMessage());
        } catch (RuntimeException ex) {
            throw BizException.of(ResultCode.REMOTE_CALL_FAILED, "Temporal start failed: " + ex.getMessage());
        }
    }

    private String buildWorkflowId(String code) {
        String safe = code == null || code.isBlank() ? "task" : code.trim();
        long n = seq.incrementAndGet();
        String stamp = LocalDateTime.now(ZoneId.systemDefault()).format(STAMP);
        return "wf-" + safe + "-" + stamp + "-" + n;
    }

    /**
     * 将配置侧 JSON 对象映射为 Temporal {@link RetryOptions}。
     *
     * <p>兼容 mock/seed 字段：{@code maxAttempts}、{@code initialInterval}（如 {@code 30s}）、
     * {@code backoff}。
     */
    static RetryOptions toRetryOptions(Map<String, Object> retryPolicy) {
        if (retryPolicy == null || retryPolicy.isEmpty()) {
            return null;
        }
        RetryOptions.Builder builder = RetryOptions.newBuilder();
        boolean any = false;

        Object maxAttempts = firstNonNull(retryPolicy, "maxAttempts", "maximumAttempts");
        if (maxAttempts instanceof Number number && number.intValue() > 0) {
            builder.setMaximumAttempts(number.intValue());
            any = true;
        }

        Object initial = firstNonNull(retryPolicy, "initialInterval", "initial_interval");
        Duration initialInterval = parseDuration(initial);
        if (initialInterval != null && !initialInterval.isZero() && !initialInterval.isNegative()) {
            builder.setInitialInterval(initialInterval);
            any = true;
        }

        Object backoff = firstNonNull(retryPolicy, "backoff", "backoffCoefficient");
        if (backoff instanceof Number number && number.doubleValue() > 0) {
            builder.setBackoffCoefficient(number.doubleValue());
            any = true;
        }

        return any ? builder.build() : null;
    }

    static Duration parseDuration(Object raw) {
        if (raw == null) {
            return null;
        }
        if (raw instanceof Number number) {
            long seconds = number.longValue();
            return seconds <= 0 ? null : Duration.ofSeconds(seconds);
        }
        String text = raw.toString().trim();
        if (text.isEmpty()) {
            return null;
        }
        try {
            if (text.endsWith("ms") && text.length() > 2) {
                return Duration.ofMillis(Long.parseLong(text.substring(0, text.length() - 2)));
            }
            if (text.endsWith("s") && text.length() > 1 && !text.endsWith("ms")) {
                char unitPrev = text.charAt(text.length() - 2);
                if (Character.isDigit(unitPrev)) {
                    return Duration.ofSeconds(Long.parseLong(text.substring(0, text.length() - 1)));
                }
            }
            if (text.endsWith("m") && text.length() > 1 && Character.isDigit(text.charAt(text.length() - 2))) {
                return Duration.ofMinutes(Long.parseLong(text.substring(0, text.length() - 1)));
            }
            if (text.endsWith("h") && text.length() > 1 && Character.isDigit(text.charAt(text.length() - 2))) {
                return Duration.ofHours(Long.parseLong(text.substring(0, text.length() - 1)));
            }
            // ISO-8601，如 PT30S
            return Duration.parse(text);
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private static Object firstNonNull(Map<String, Object> map, String... keys) {
        for (String key : keys) {
            if (map.containsKey(key) && map.get(key) != null) {
                return map.get(key);
            }
        }
        return null;
    }

    private static String requireNonBlank(String value, String field) {
        if (value == null || value.isBlank()) {
            throw BizException.of(ResultCode.PARAM_INVALID, field + " is required");
        }
        return value.trim();
    }
}
