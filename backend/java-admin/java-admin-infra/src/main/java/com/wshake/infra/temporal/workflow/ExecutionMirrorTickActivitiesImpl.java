package com.wshake.infra.temporal.workflow;

import com.wshake.infra.temporal.TemporalTaskTriggerPort;
import com.wshake.service.entity.TemporalTaskConfig;
import com.wshake.service.entity.TemporalTaskExecution;
import com.wshake.service.repository.TemporalTaskConfigRepository;
import com.wshake.service.repository.TemporalTaskExecutionRepository;
import com.wshake.service.task.TaskJsonSupport;
import com.wshake.service.task.TemporalTaskQueue;
import com.wshake.service.task.TemporalWorkflowType;
import io.temporal.api.enums.v1.WorkflowExecutionStatus;
import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowExecutionMetadata;
import io.temporal.client.WorkflowStub;
import io.temporal.failure.ApplicationFailure;
import io.temporal.spring.boot.ActivityImpl;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * {@link ExecutionMirrorTickActivities}：DB 未终态 describe + Visibility 扫新 run。
 *
 * <p>双轨语义：
 * <ul>
 *   <li>① 读库中 PENDING/RUNNING/RETRYING 行，对每条 {@code describe} 推进状态
 *   <li>② 按业务 {@link TemporalWorkflowType#ALL} list Visibility 近 {@link #LOOKBACK} 内 run，
 *       upsert 补建（主要覆盖 Schedule 触发、无种子行）
 * </ul>
 *
 * @author wshake
 */
@Component
@ActivityImpl(taskQueues = TemporalTaskQueue.DEMO)
public class ExecutionMirrorTickActivitiesImpl implements ExecutionMirrorTickActivities {

    private static final Logger log = LoggerFactory.getLogger(ExecutionMirrorTickActivitiesImpl.class);

    /** 单轮最多 describe 的未终态 DB 行数，防止开放任务过多拖垮 tick。 */
    private static final int OPEN_LIMIT = 200;

    /** 每个业务 workflowType 单轮 Visibility 最多消费条数。 */
    private static final int VISIBILITY_LIMIT_PER_TYPE = 100;

    /**
     * Visibility 回看窗口：与 Schedule 间隔重叠，避免漏扫刚结束的 run；
     * 过大会放大 list 成本。
     */
    private static final Duration LOOKBACK = Duration.ofMinutes(15);

    /** {@code failure_reason} 列上限，与 schema VARCHAR(1024) 对齐。 */
    private static final int FAILURE_REASON_MAX = 1024;

    private static final ZoneId ZONE = ZoneId.systemDefault();

    private final WorkflowClient workflowClient;
    private final TemporalTaskExecutionRepository executionRepository;
    private final TemporalTaskConfigRepository configRepository;

    public ExecutionMirrorTickActivitiesImpl(
            WorkflowClient workflowClient,
            TemporalTaskExecutionRepository executionRepository,
            TemporalTaskConfigRepository configRepository) {
        this.workflowClient = workflowClient;
        this.executionRepository = executionRepository;
        this.configRepository = configRepository;
    }

    /**
     * 跑一轮双轨镜像。
     *
     * @return 本轮实际 insert/update 的行数（无变化跳过不计）
     */
    @Override
    public int mirrorOnce() {
        int touched = 0;
        // workflowId|runId，避免 ① 已处理的行在 ② 再 upsert 一遍
        Set<String> seen = new HashSet<>();

        // ① DB 未终态
        List<TemporalTaskExecution> open = executionRepository.listOpen(OPEN_LIMIT);
        for (TemporalTaskExecution row : open) {
            try {
                if (mirrorExisting(row)) {
                    touched++;
                }
                seen.add(key(row.getWorkflowId(), row.getRunId()));
            } catch (RuntimeException ex) {
                log.warn(
                        "mirror open row failed: id={} workflowId={} reason={}",
                        row.getId(),
                        row.getWorkflowId(),
                        ex.getMessage());
            }
        }

        // ② Visibility：已登记业务类型近期 run
        Instant since = Instant.now().minus(LOOKBACK);
        for (String workflowType : TemporalWorkflowType.ALL) {
            String query = "WorkflowType = \"" + workflowType + "\" AND StartTime > \"" + since + "\"";
            try (var stream = workflowClient.listExecutions(query)) {
                int n = 0;
                var it = stream.iterator();
                while (it.hasNext() && n < VISIBILITY_LIMIT_PER_TYPE) {
                    WorkflowExecutionMetadata meta = it.next();
                    n++;
                    if (meta == null || meta.getExecution() == null) {
                        continue;
                    }
                    String wfId = meta.getExecution().getWorkflowId();
                    String runId = meta.getExecution().getRunId();
                    if (shouldSkipWorkflow(wfId, meta.getWorkflowType())) {
                        continue;
                    }
                    String k = key(wfId, runId);
                    if (seen.contains(k)) {
                        continue;
                    }
                    seen.add(k);
                    try {
                        if (mirrorMetadata(meta)) {
                            touched++;
                        }
                    } catch (RuntimeException ex) {
                        log.warn(
                                "mirror visibility row failed: workflowId={} reason={}", wfId, ex.getMessage());
                    }
                }
            } catch (RuntimeException ex) {
                log.warn("listExecutions failed: type={} reason={}", workflowType, ex.getMessage());
            }
        }

        log.info("ExecutionMirrorTick mirrorOnce touched={} scannedKeys={}", touched, seen.size());
        return touched;
    }

    /**
     * 双轨①：对已有 DB 行 describe Temporal 并写回。
     *
     * @param row 未终态镜像行（须含 workflowId；runId/workflowType 可空）
     * @return 是否发生 DB 写入
     */
    private boolean mirrorExisting(TemporalTaskExecution row) {
        WorkflowStub stub = workflowClient.newUntypedWorkflowStub(
                row.getWorkflowId(),
                java.util.Optional.ofNullable(row.getRunId()),
                java.util.Optional.ofNullable(row.getWorkflowType()));
        WorkflowExecutionMetadata meta = stub.describe();
        return applySnapshot(row, meta, true);
    }

    /**
     * 双轨②：Visibility 元数据 → 已有行则更新，否则 insert 种子。
     *
     * @param meta listExecutions 返回的执行摘要（含 status / 时间 / memo）
     * @return 是否发生 DB 写入
     */
    private boolean mirrorMetadata(WorkflowExecutionMetadata meta) {
        String wfId = meta.getExecution().getWorkflowId();
        String runId = meta.getExecution().getRunId();
        TemporalTaskExecution existing = executionRepository.findByWorkflowIdAndRunId(wfId, runId);
        if (existing != null) {
            return applySnapshot(existing, meta, true);
        }
        TemporalTaskExecution created = newSeedFromMeta(meta);
        if (created == null) {
            return false;
        }
        executionRepository.insert(created);
        // list 元数据无 result；终态时再 describe 补 result/failure
        if (isTerminal(mapStatus(meta.getStatus()))) {
            try {
                WorkflowStub stub = workflowClient.newUntypedWorkflowStub(
                        wfId, java.util.Optional.of(runId), java.util.Optional.ofNullable(meta.getWorkflowType()));
                applySnapshot(created, stub.describe(), true);
            } catch (RuntimeException ignored) {
                // 已插入基础行即可
            }
        }
        return true;
    }

    /**
     * 由 Visibility 元数据构造待 insert 的镜像行（尚无主键）。
     *
     * @param meta Temporal 执行摘要
     * @return 新行；异常输入理论上不出现，保留 null 防御
     */
    private TemporalTaskExecution newSeedFromMeta(WorkflowExecutionMetadata meta) {
        String wfId = meta.getExecution().getWorkflowId();
        String runId = meta.getExecution().getRunId();
        Long configId = resolveConfigId(meta, wfId);
        LocalDateTime now = LocalDateTime.now(ZONE);
        LocalDateTime startedAt = toLocal(meta.getStartTime() != null ? meta.getStartTime() : meta.getExecutionTime());
        if (startedAt == null) {
            startedAt = now;
        }
        String status = mapStatus(meta.getStatus());
        TemporalTaskExecution row = new TemporalTaskExecution();
        row.setConfigId(configId);
        row.setWorkflowId(wfId);
        row.setRunId(runId);
        row.setWorkflowType(nullToEmpty(meta.getWorkflowType()));
        row.setTaskQueue(nullToEmpty(meta.getTaskQueue()));
        row.setStatus(status);
        row.setStartedAt(startedAt);
        row.setClosedAt(toLocal(meta.getCloseTime()));
        row.setInputSummary(null);
        row.setResultSummary(null);
        row.setFailureReason(null);
        row.setRetryCount(0);
        row.setCreatedAt(now);
        return row;
    }

    /**
     * 将 Temporal 快照合并进 DB 行。
     *
     * @param row         已有或刚 insert 的镜像实体（应尽量带 id）
     * @param meta        describe/list 得到的状态与时间
     * @param fetchResult 终态时是否尝试 {@code getResult} 填 result_summary / failure_reason
     * @return true=执行了 updateMirror；false=与库内一致跳过
     */
    private boolean applySnapshot(TemporalTaskExecution row, WorkflowExecutionMetadata meta, boolean fetchResult) {
        String status = mapStatus(meta.getStatus());
        LocalDateTime startedAt = toLocal(meta.getStartTime() != null ? meta.getStartTime() : meta.getExecutionTime());
        LocalDateTime closedAt = toLocal(meta.getCloseTime());
        String resultJson = null;
        String failure = null;

        if (fetchResult && isTerminal(status)) {
            ResultAndFailure rf = tryFetchResult(row.getWorkflowId(), row.getRunId(), row.getWorkflowType(), status);
            resultJson = rf.resultJson();
            failure = rf.failureReason();
        }

        // 无变化则跳过写库
        if (status.equals(row.getStatus())
                && sameTime(row.getClosedAt(), closedAt)
                && (resultJson == null || resultJson.equals(row.getResultSummary()))
                && (failure == null || failure.equals(row.getFailureReason()))) {
            return false;
        }

        if (row.getId() == null) {
            // insert 后未刷 id 的边角：按 wf+run 再查
            TemporalTaskExecution reloaded =
                    executionRepository.findByWorkflowIdAndRunId(row.getWorkflowId(), row.getRunId());
            if (reloaded == null) {
                return false;
            }
            row.setId(reloaded.getId());
        }

        // startedAt：保留种子行已有值，避免 mirror 时钟覆盖手动触发写入的启动时间
        LocalDateTime started = row.getStartedAt() != null ? row.getStartedAt() : startedAt;
        executionRepository.updateMirror(row.getId(), status, started, closedAt, resultJson, failure, null);
        row.setStatus(status);
        row.setClosedAt(closedAt);
        if (resultJson != null) {
            row.setResultSummary(resultJson);
        }
        row.setFailureReason(failure);
        return true;
    }

    /**
     * 终态尽力取业务结果；失败时抽错误信息。
     *
     * @param workflowId   Temporal workflowId
     * @param runId        Temporal runId（可空则取最新 run）
     * @param workflowType 类型名，供 untyped stub 可选携带
     * @param status       已映射的业务 status（COMPLETED/FAILED/…）
     * @return resultJson 与 failureReason，均可为 null
     */
    private ResultAndFailure tryFetchResult(String workflowId, String runId, String workflowType, String status) {
        if (!"COMPLETED".equals(status) && !"FAILED".equals(status) && !"TIMED_OUT".equals(status)) {
            return new ResultAndFailure(null, null);
        }
        try {
            WorkflowStub stub = workflowClient.newUntypedWorkflowStub(
                    workflowId, java.util.Optional.ofNullable(runId), java.util.Optional.ofNullable(workflowType));
            // 已关闭的执行 getResult 应立即返回；2s 仅防异常挂起
            Object result = stub.getResult(2, TimeUnit.SECONDS, Object.class);
            return new ResultAndFailure(toResultJson(result), null);
        } catch (Exception ex) {
            String msg = rootMessage(ex);
            if ("COMPLETED".equals(status)) {
                // void 结果或无法反序列化：不记 failure
                return new ResultAndFailure(null, null);
            }
            return new ResultAndFailure(null, truncate(msg, FAILURE_REASON_MAX));
        }
    }

    /**
     * 解析 config_id：优先 Memo.configId，其次 Memo.configCode / workflowId 约定反查配置表。
     *
     * @param meta       可含 memo
     * @param workflowId 用于 {@code wf-|sched-{code}-...} 解析
     * @return 配置主键；无法解析时 null（允许软悬空）
     */
    private Long resolveConfigId(WorkflowExecutionMetadata meta, String workflowId) {
        Long fromMemo = toLong(safeMemo(meta, TemporalTaskTriggerPort.MEMO_CONFIG_ID));
        if (fromMemo != null) {
            return fromMemo;
        }
        Object memoCode = safeMemo(meta, TemporalTaskTriggerPort.MEMO_CONFIG_CODE);
        String code = memoCode instanceof String s && !s.isBlank()
                ? s.trim()
                : TemporalTaskTriggerPort.parseConfigCodeFromWorkflowId(workflowId);
        if (code == null) {
            return null;
        }
        TemporalTaskConfig config = configRepository.findByCode(code);
        return config == null ? null : config.getId();
    }

    /**
     * 安全读取 Memo 字段。
     *
     * @param meta 执行元数据
     * @param key  Memo 键（如 configId / configCode）
     * @return 解码后的值；键不存在或解码失败时 null
     */
    private static Object safeMemo(WorkflowExecutionMetadata meta, String key) {
        try {
            // SDK 两参 getMemo 返回 Object
            return meta.getMemo(key, Object.class);
        } catch (RuntimeException ex) {
            return null;
        }
    }

    /**
     * Temporal 原生状态 → 镜像表 status 字面量。
     *
     * @param status Temporal enum；null 视为 RUNNING
     */
    static String mapStatus(WorkflowExecutionStatus status) {
        if (status == null) {
            return "RUNNING";
        }
        return switch (status) {
            case WORKFLOW_EXECUTION_STATUS_COMPLETED -> "COMPLETED";
            case WORKFLOW_EXECUTION_STATUS_FAILED -> "FAILED";
            case WORKFLOW_EXECUTION_STATUS_CANCELED -> "CANCELLED";
            case WORKFLOW_EXECUTION_STATUS_TERMINATED -> "TERMINATED";
            case WORKFLOW_EXECUTION_STATUS_TIMED_OUT -> "TIMED_OUT";
            case WORKFLOW_EXECUTION_STATUS_CONTINUED_AS_NEW -> "CONTINUED_AS_NEW";
            case WORKFLOW_EXECUTION_STATUS_RUNNING, WORKFLOW_EXECUTION_STATUS_PAUSED -> "RUNNING";
            default -> "RUNNING";
        };
    }

    /**
     * 是否为镜像表终态（非 PENDING/RUNNING/RETRYING）。
     *
     * @param status 镜像 status 字符串
     */
    static boolean isTerminal(String status) {
        return status != null
                && !TemporalTaskExecutionRepository.isOpenStatus(status)
                && !"PENDING".equals(status);
    }

    /**
     * 是否跳过镜像（系统 tick、遗留 JobDispatch、sys- 前缀）。
     *
     * @param workflowId   Temporal workflowId
     * @param workflowType Temporal workflow type 名
     * @return true=不入库 / 不更新
     */
    static boolean shouldSkipWorkflow(String workflowId, String workflowType) {
        if (workflowType != null
                && (workflowType.equals(TemporalWorkflowType.EXECUTION_MIRROR_TICK)
                        || workflowType.equals("JobDispatchWorkflow"))) {
            return true;
        }
        if (workflowId == null) {
            return true;
        }
        return workflowId.startsWith("sys-");
    }

    /**
     * 业务返回值 → result_summary JSON。
     *
     * @param result getResult 反序列化对象；Map 原样序列化，其它包 {@code {"value":...}}
     */
    static String toResultJson(Object result) {
        if (result == null) {
            return null;
        }
        if (result instanceof Map<?, ?>) {
            return TaskJsonSupport.toJson(result, "resultSummary");
        }
        return TaskJsonSupport.toJson(Map.of("value", String.valueOf(result)), "resultSummary");
    }

    /** @param instant Temporal Instant；null → null */
    private static LocalDateTime toLocal(Instant instant) {
        return instant == null ? null : LocalDateTime.ofInstant(instant, ZONE);
    }

    /**
     * @param a 库内 closedAt
     * @param b Temporal closeTime
     */
    private static boolean sameTime(LocalDateTime a, LocalDateTime b) {
        if (a == null && b == null) {
            return true;
        }
        if (a == null || b == null) {
            return false;
        }
        return a.equals(b);
    }

    /**
     * 本轮去重键。
     *
     * @param workflowId Temporal workflowId
     * @param runId      Temporal runId
     */
    private static String key(String workflowId, String runId) {
        return nullToEmpty(workflowId) + "|" + nullToEmpty(runId);
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    /** Memo / 数字字段宽松转 Long。 */
    private static Long toLong(Object raw) {
        if (raw == null) {
            return null;
        }
        if (raw instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(raw.toString().trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    /** 抽取最内层可读错误信息（含 ApplicationFailure.originalMessage）。 */
    private static String rootMessage(Throwable error) {
        if (error == null) {
            return null;
        }
        Throwable cursor = error;
        while (cursor.getCause() != null && !cursor.getCause().equals(cursor)) {
            cursor = cursor.getCause();
        }
        if (cursor instanceof ApplicationFailure app && app.getOriginalMessage() != null) {
            return app.getOriginalMessage();
        }
        String msg = cursor.getMessage();
        return msg == null || msg.isBlank() ? error.toString() : msg;
    }

    /**
     * @param value 原始字符串
     * @param max   最大长度（含）
     */
    private static String truncate(String value, int max) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
    }

    /**
     * getResult 尽力结果。
     *
     * @param resultJson    写入 result_summary 的 JSON；成功且无结果时可为 null
     * @param failureReason 写入 failure_reason；成功时 null
     */
    private record ResultAndFailure(String resultJson, String failureReason) {}
}
