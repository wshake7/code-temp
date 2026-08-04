package com.wshake.infra.temporal.workflow;

import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;
import java.util.Map;

/**
 * 测试用 Workflow：进程内计数器每 10 秒 +1 并写日志。
 *
 * <p>对齐 seed {@code log_count_tick} / {@code workflow_type=LogCountTickWorkflow}。
 *
 * @author wshake
 */
@WorkflowInterface
public interface LogCountTickWorkflow {

    /**
     * 启动循环节拍。
     *
     * <p>可选 input：
     * <ul>
     *   <li>{@code intervalSeconds} — 间隔秒数，默认 10</li>
     *   <li>{@code maxTicksBeforeContinueAsNew} — 多少次 tick 后 continue-as-new，默认 60</li>
     * </ul>
     *
     * @param input 业务入参（可空）
     */
    @WorkflowMethod(name = "LogCountTickWorkflow")
    void run(Map<String, Object> input);
}
