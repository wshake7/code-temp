package com.wshake.infra.temporal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;

/**
 * Temporal 未启用时的启动提示（不阻断启动）。
 *
 * @author wshake
 */
@Order(100)
public class TemporalTaskScheduleSyncDisabledNotice implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(TemporalTaskScheduleSyncDisabledNotice.class);

    @Override
    public void run(ApplicationArguments args) {
        log.info(
                "Temporal schedule sync skipped: spring.temporal.connection.target is empty "
                        + "and test-server is off (set TEMPORAL_TARGET=127.0.0.1:4723 for local compose)");
    }
}
