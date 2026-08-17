package com.wshake.infra.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import org.junit.jupiter.api.Test;

/**
 * {@link HttpClientProperties} 启动期校验。
 */
class HttpClientPropertiesTest {

    @Test
    void defaults_pass() {
        HttpClientProperties props = new HttpClientProperties();
        props.validate();
        assertThat(props.getConnectTimeout()).isEqualTo(Duration.ofSeconds(5));
        assertThat(props.getReadTimeout()).isEqualTo(Duration.ofSeconds(30));
        assertThat(props.getWriteTimeout()).isEqualTo(Duration.ofSeconds(10));
        assertThat(props.getCallTimeout()).isEqualTo(Duration.ZERO);
        assertThat(props.getPool().getMaxIdleConnections()).isEqualTo(5);
        assertThat(props.getPool().getKeepAlive()).isEqualTo(Duration.ofMinutes(5));
    }

    @Test
    void zeroCallTimeout_isAllowed() {
        HttpClientProperties props = new HttpClientProperties();
        props.setCallTimeout(Duration.ZERO);
        props.validate();
    }

    @Test
    void negativeConnectTimeout_fails() {
        HttpClientProperties props = new HttpClientProperties();
        props.setConnectTimeout(Duration.ofSeconds(-1));
        assertThatThrownBy(props::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("connect-timeout");
    }

    @Test
    void nonPositiveKeepAlive_fails() {
        HttpClientProperties props = new HttpClientProperties();
        props.getPool().setKeepAlive(Duration.ZERO);
        assertThatThrownBy(props::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("keep-alive");
    }

    @Test
    void nonPositiveMaxIdle_fails() {
        HttpClientProperties props = new HttpClientProperties();
        props.getPool().setMaxIdleConnections(0);
        assertThatThrownBy(props::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("max-idle-connections");
    }
}
