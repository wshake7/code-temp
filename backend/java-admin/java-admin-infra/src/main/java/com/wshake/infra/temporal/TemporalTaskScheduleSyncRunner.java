package com.wshake.infra.temporal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;

/**
 * 服务启动后将 DB 任务配置同步到 Temporal Schedule。
 *
 * <p>仅在 Temporal 连接启用时由配置类注册；失败只打日志，不阻断启动。
 *
 * @author wshake
 */
@Order(100)
public class TemporalTaskScheduleSyncRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(TemporalTaskScheduleSyncRunner.class);

    private final TemporalTaskScheduleSync scheduleSync;

    public TemporalTaskScheduleSyncRunner(TemporalTaskScheduleSync scheduleSync) {
        this.scheduleSync = scheduleSync;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("Starting Temporal schedule sync from temporal_task_config ...");
        try {
            TemporalTaskScheduleSync.SyncSummary summary = scheduleSync.syncAll();
            if (summary.failed() > 0) {
                log.warn(
                        "Temporal schedule sync finished with failures: failed={} total={}",
                        summary.failed(),
                        summary.total());
            }
        } catch (RuntimeException ex) {
            log.error("Temporal schedule sync aborted: {}", ex.getMessage(), ex);
        }
    }
}
