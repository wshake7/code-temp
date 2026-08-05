package com.wshake.infra.temporal.workflow;

import com.wshake.service.task.TemporalTaskQueue;
import io.temporal.spring.boot.ActivityImpl;
import java.util.concurrent.atomic.AtomicLong;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * {@link LogCountTickActivities} 实现：进程内 {@link AtomicLong} 计数。
 *
 * <p>注意：count 仅在当前 JVM Worker 进程有效，多实例/重启会重置。
 * Worker 队列见 {@link TemporalTaskQueue#DEMO}。
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
    public long incrementAndLog() {
        long value = COUNT.incrementAndGet();
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        log.info("log_count_tick count={}", value);
        return value;
    }

    /** 单测重置。 */
    static void resetForTest() {
        COUNT.set(0);
    }
}
