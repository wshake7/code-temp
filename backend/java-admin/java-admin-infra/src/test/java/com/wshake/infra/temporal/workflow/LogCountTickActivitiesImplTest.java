package com.wshake.infra.temporal.workflow;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * {@link LogCountTickActivitiesImpl} 计数逻辑单测。
 */
class LogCountTickActivitiesImplTest {

    private final LogCountTickActivitiesImpl activities = new LogCountTickActivitiesImpl();

    @BeforeEach
    void setUp() {
        LogCountTickActivitiesImpl.resetForTest();
    }

    @Test
    void incrementAndLog_increasesMonotonically() {
        Map<String, Object> r1 = activities.incrementAndLog(Map.of("trigger", "manual"));
        assertThat(r1.get("count")).isEqualTo(1L);
        assertThat(r1.get("message")).isEqualTo("log_count_tick ok");
        assertThat(r1.get("input")).isEqualTo(Map.of("trigger", "manual"));

        Map<String, Object> r2 = activities.incrementAndLog(null);
        assertThat(r2.get("count")).isEqualTo(2L);
        assertThat(r2.get("input")).isEqualTo(Map.of());

        Map<String, Object> r3 = activities.incrementAndLog(Map.of());
        assertThat(r3.get("count")).isEqualTo(3L);
        assertThat(LogCountTickActivitiesImpl.COUNT.get()).isEqualTo(3L);
    }
}
