package com.wshake.infra.temporal.workflow;

import com.wshake.service.task.TemporalTaskQueue;
import io.temporal.spring.boot.ActivityImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * {@link LogCountTickActivities} 实现：进程内 {@link AtomicLong} 计数。
 *
 * <p>注意：count 仅在当前 JVM Worker 进程有效，多实例/重启会重置。
 * Worker 队列见 {@link TemporalTaskQueue#DEMO}。
 *
 * <p>返回 Map 供 Workflow 作为业务结果；镜像 tick 会写入执行记录 {@code result_summary}。
 *
 * @author wshake
 */
@Component
@ActivityImpl(taskQueues = TemporalTaskQueue.DEMO)
public class LogCountTickActivitiesImpl implements LogCountTickActivities {

    private static final Logger log = LoggerFactory.getLogger(LogCountTickActivitiesImpl.class);

    /** 进程内全局计数（测试用）。 */
    static final AtomicLong COUNT = new AtomicLong(0);

    @Override
    public Map<String, Object> incrementAndLog(Map<String, Object> input) {
        long value = COUNT.incrementAndGet();
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(e);
        }

        Map<String, Object> safeInput = input == null ? Map.of() : input;
        log.info("log_count_tick count={} inputKeys={}", value, safeInput.size());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("count", value);
        result.put("message", "log_count_tick ok");
        result.put("input", safeInput);
        return result;
    }

    /** 单测重置。 */
    static void resetForTest() {
        COUNT.set(0);
    }
}
