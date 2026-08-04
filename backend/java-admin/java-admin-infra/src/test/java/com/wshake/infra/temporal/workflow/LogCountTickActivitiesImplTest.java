package com.wshake.infra.temporal.workflow;

import static org.assertj.core.api.Assertions.assertThat;

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
        assertThat(activities.incrementAndLog()).isEqualTo(1L);
        assertThat(activities.incrementAndLog()).isEqualTo(2L);
        assertThat(activities.incrementAndLog()).isEqualTo(3L);
        assertThat(LogCountTickActivitiesImpl.COUNT.get()).isEqualTo(3L);
    }
}
