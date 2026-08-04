package com.wshake.service.task;

import com.wshake.common.exception.BizException;
import com.wshake.common.result.ResultCode;
import java.util.List;

/**
 * 已注册 Temporal task queue 常量（与 {@code @WorkflowImpl(taskQueues=...)} 对齐）。
 *
 * <p>使用常量类而非枚举，便于注解引用编译期常量；任务配置 create/update 时必须命中
 * {@link #requireCode(String)}。新增队列时在此登记并加入 {@link #ALL}。
 *
 * @author wshake
 */
public final class TemporalTaskQueue {

    /** Demo / 测试队列（LogCountTick 等）。 */
    public static final String DEMO = "demo";

    /** 全部合法 task queue。 */
    public static final List<String> ALL = List.of(DEMO);

    private TemporalTaskQueue() {}

    /**
     * 解析合法 task queue；未知值抛业务异常。
     *
     * @param raw 请求中的 taskQueue
     * @return 规范化后的常量值
     */
    public static String requireCode(String raw) {
        if (raw == null || raw.isBlank()) {
            throw BizException.of(ResultCode.PARAM_INVALID, "taskQueue is required");
        }
        String trimmed = raw.trim();
        for (String allowed : ALL) {
            if (allowed.equalsIgnoreCase(trimmed)) {
                return allowed;
            }
        }
        throw BizException.of(
                ResultCode.PARAM_INVALID, "unknown taskQueue: " + trimmed + "; allowed=" + String.join(",", ALL));
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
