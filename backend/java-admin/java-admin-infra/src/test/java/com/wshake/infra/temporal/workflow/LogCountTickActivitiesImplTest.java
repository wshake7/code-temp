package com.wshake.infra.temporal.workflow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.wshake.common.exception.BizException;
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
    void incrementAndLog_increasesThenFailsForRetryDemo() {
        // 当前实现故意失败以联调 Activity 重试镜像；count 在抛错前已递增
        assertThatThrownBy(() -> activities.incrementAndLog(Map.of("trigger", "manual")))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("log_count_tick demo fail");
        assertThat(LogCountTickActivitiesImpl.COUNT.get()).isEqualTo(1L);

        assertThatThrownBy(() -> activities.incrementAndLog(null)).isInstanceOf(BizException.class);
        assertThat(LogCountTickActivitiesImpl.COUNT.get()).isEqualTo(2L);
    }

    @Test
    void successResult_buildsBusinessMap() {
        Map<String, Object> result =
                LogCountTickActivitiesImpl.successResult(9L, Map.of("trigger", "manual"));
        assertThat(result.get("count")).isEqualTo(9L);
        assertThat(result.get("message")).isEqualTo("log_count_tick ok");
        assertThat(result.get("input")).isEqualTo(Map.of("trigger", "manual"));
    }
}
