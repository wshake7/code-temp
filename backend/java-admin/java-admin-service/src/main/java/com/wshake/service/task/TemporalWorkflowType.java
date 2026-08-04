package com.wshake.service.task;

import com.wshake.common.exception.BizException;
import com.wshake.common.result.ResultCode;
import java.util.List;

/**
 * 已注册 Temporal Workflow 类型常量（与 {@code @WorkflowMethod(name=...)} 对齐）。
 *
 * <p>使用常量类而非枚举，便于注解引用编译期常量；任务配置 create/update 时必须命中
 * {@link #requireCode(String)}。新增 Workflow 时在此登记并加入 {@link #ALL}。
 *
 * @author wshake
 */
public final class TemporalWorkflowType {

    /** 日志计数 tick（dev 测试 / 当前唯一已注册 Workflow）。 */
    public static final String LOG_COUNT_TICK = "LogCountTickWorkflow";

    /** 全部合法 workflow type。 */
    public static final List<String> ALL = List.of(LOG_COUNT_TICK);

    private TemporalWorkflowType() {}

    /**
     * 解析合法 workflow type；未知值抛业务异常。
     *
     * @param raw 请求中的 workflowType
     * @return 规范化后的常量值（与登记字面量大小写一致）
     */
    public static String requireCode(String raw) {
        if (raw == null || raw.isBlank()) {
            throw BizException.of(ResultCode.PARAM_INVALID, "workflowType is required");
        }
        String trimmed = raw.trim();
        for (String allowed : ALL) {
            if (allowed.equalsIgnoreCase(trimmed)) {
                return allowed;
            }
        }
        throw BizException.of(
                ResultCode.PARAM_INVALID, "unknown workflowType: " + trimmed + "; allowed=" + String.join(",", ALL));
    }

    /** 是否已登记。 */
    public static boolean isKnown(String raw) {
        if (raw == null || raw.isBlank()) {
            return false;
        }
        String trimmed = raw.trim();
        for (String allowed : ALL) {
            if (allowed.equalsIgnoreCase(trimmed)) {
                return true;
            }
        }
        return false;
    }
}
