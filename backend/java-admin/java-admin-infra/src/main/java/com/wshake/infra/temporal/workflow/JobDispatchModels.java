package com.wshake.infra.temporal.workflow;

import java.util.Map;

/**
 * JobDispatchWorkflow 与执行记录 Activity 的入参/出参（对齐 Go temporaljob）。
 *
 * @author wshake
 */
public final class JobDispatchModels {

    private JobDispatchModels() {}

    /**
     * 派发入参：由手动 trigger / Schedule 提交给 {@link JobDispatchWorkflow}。
     *
     * @param configId          配置 id（可空）
     * @param configCode        任务编码
     * @param workflowType      子业务 Workflow 类型名
     * @param taskQueue         子业务与本派发共用的 task queue
     * @param workflowIdPrefix  子 WF id 前缀；空则用 configCode
     * @param timeoutSeconds    子 WF 执行超时秒（可空）
     * @param retryPolicy       子 WF 重试策略（可空；字段同任务配置）
     * @param input             业务入参（可空）
     * @param retryCount        业务重试次数（仅镜像/预留，表无该列）
     */
    public record DispatchInput(
            Long configId,
            String configCode,
            String workflowType,
            String taskQueue,
            String workflowIdPrefix,
            Integer timeoutSeconds,
            Map<String, Object> retryPolicy,
            Map<String, Object> input,
            int retryCount) {}

    /**
     * 创建执行记录入参（先落 PENDING；child 未启动时 runId 可为占位）。
     *
     * @param configId            配置 id
     * @param temporalWorkflowId  子 WF workflowId（可先用计划 id）
     * @param temporalRunId       子 WF runId（未启动时可用占位，如 {@code pending}）
     * @param workflowType        业务类型
     * @param taskQueue           队列
     * @param input               业务入参摘要
     */
    public record CreateExecutionInput(
            Long configId,
            String temporalWorkflowId,
            String temporalRunId,
            String workflowType,
            String taskQueue,
            Map<String, Object> input) {}

    /** 创建执行记录结果。 */
    public record CreateExecutionResult(Long id) {}

    /**
     * 将执行记录标记为 RUNNING（写入真实 workflowId/runId 与 startedAt）。
     *
     * @param id                  记录主键
     * @param temporalWorkflowId  子 WF 真实 workflowId
     * @param temporalRunId       子 WF 真实 runId
     */
    public record MarkRunningInput(Long id, String temporalWorkflowId, String temporalRunId) {}

    /**
     * 完成执行记录入参。
     *
     * @param id            记录主键
     * @param status        终态（COMPLETED/FAILED/CANCELLED/TIMED_OUT…）
     * @param result        结果摘要（可空）
     * @param errorMessage  失败原因（可空）
     */
    public record CompleteExecutionInput(Long id, String status, Object result, String errorMessage) {}
}
