package com.wshake.infra.temporal.workflow;

import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;
import java.util.Map;

/**
 * 测试用 Workflow：单次将进程内计数器 +1 并写日志。
 *
 * <p>对齐 seed {@code log_count_tick} / {@code workflow_type=LogCountTickWorkflow}。
 * 周期执行由 Temporal Schedule（cron / interval）负责，本 Workflow 不做 sleep 循环。
 *
 * @author wshake
 */
@WorkflowInterface
public interface LogCountTickWorkflow {

    /**
     * 执行一次 tick。
     *
     * @param input 业务入参（可空；schedule 触发会带 trigger/configCode）
     */
    @WorkflowMethod(name = "LogCountTickWorkflow")
    void run(Map<String, Object> input);
}
