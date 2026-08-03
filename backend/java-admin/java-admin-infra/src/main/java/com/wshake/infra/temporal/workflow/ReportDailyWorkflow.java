package com.wshake.infra.temporal.workflow;

import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;
import java.util.Map;

/**
 * Demo Workflow：对齐 seed/mock 的 {@code workflow_type=ReportDailyWorkflow}。
 *
 * <p>入参为管理端 trigger 写入的 input map（含 trigger/configCode 等）。
 *
 * @author wshake
 */
@WorkflowInterface
public interface ReportDailyWorkflow {

    /**
     * 执行日报生成任务。
     *
     * @param input 业务入参（可空 map）
     * @return 结果摘要
     */
    @WorkflowMethod(name = "ReportDailyWorkflow")
    Map<String, Object> run(Map<String, Object> input);
}
