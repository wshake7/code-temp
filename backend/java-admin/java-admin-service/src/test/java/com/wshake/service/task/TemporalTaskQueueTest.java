package com.wshake.service.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.wshake.common.exception.BizException;
import org.junit.jupiter.api.Test;

/**
 * {@link TemporalTaskQueue} 业务/系统队列边界单测。
 */
class TemporalTaskQueueTest {

    @Test
    void all_containsOnlyBusinessQueues() {
        assertThat(TemporalTaskQueue.ALL).containsExactly(TemporalTaskQueue.DEMO);
        assertThat(TemporalTaskQueue.ALL).doesNotContain(TemporalTaskQueue.SYSTEM);
    }

    @Test
    void requireCode_acceptsDemo_rejectsSystemAndUnknown() {
        assertThat(TemporalTaskQueue.requireCode("demo")).isEqualTo(TemporalTaskQueue.DEMO);
        assertThat(TemporalTaskQueue.requireCode(" DEMO ")).isEqualTo(TemporalTaskQueue.DEMO);

        assertThatThrownBy(() -> TemporalTaskQueue.requireCode(TemporalTaskQueue.SYSTEM))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("unknown taskQueue");
        assertThatThrownBy(() -> TemporalTaskQueue.requireCode("reports"))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("unknown taskQueue");
    }

    @Test
    void isKnown_onlyBusinessQueues() {
        assertThat(TemporalTaskQueue.isKnown("demo")).isTrue();
        assertThat(TemporalTaskQueue.isKnown(TemporalTaskQueue.SYSTEM)).isFalse();
        assertThat(TemporalTaskQueue.isKnown(null)).isFalse();
    }
}
