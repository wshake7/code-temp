package com.wshake.infra.http;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import mockwebserver3.MockResponse;
import mockwebserver3.MockWebServer;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

/**
 * 验证共享 {@link OkHttpClient} 装配与一次真实 GET。
 */
class HttpClientConfigurationTest {

    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withUserConfiguration(HttpClientConfiguration.class)
            .withPropertyValues("spring.main.web-application-type=none");

    @Test
    void registersSingletonClientWithDefaultTimeouts() {
        runner.run(ctx -> {
            assertThat(ctx).hasNotFailed();
            assertThat(ctx).hasSingleBean(OkHttpClient.class);
            OkHttpClient client = ctx.getBean(OkHttpClient.class);
            assertThat(client.connectTimeoutMillis()).isEqualTo(5_000);
            assertThat(client.readTimeoutMillis()).isEqualTo(30_000);
            assertThat(client.writeTimeoutMillis()).isEqualTo(10_000);
            assertThat(client.callTimeoutMillis()).isZero();
        });
    }

    @Test
    void bindsCustomTimeouts() {
        runner.withPropertyValues("app.http.connect-timeout=2s", "app.http.read-timeout=15s")
                .run(ctx -> {
                    assertThat(ctx).hasNotFailed();
                    OkHttpClient client = ctx.getBean(OkHttpClient.class);
                    assertThat(client.connectTimeoutMillis()).isEqualTo(2_000);
                    assertThat(client.readTimeoutMillis()).isEqualTo(15_000);
                });
    }

    @Test
    void invalidTimeout_failsContext() {
        runner.withPropertyValues("app.http.connect-timeout=-1s")
                .run(ctx -> assertThat(ctx).hasFailed());
    }

    @Test
    void get_againstMockWebServer() throws IOException {
        try (MockWebServer server = new MockWebServer()) {
            server.start();
            server.enqueue(new MockResponse.Builder().body("pong").build());
            runner.run(ctx -> {
                assertThat(ctx).hasNotFailed();
                OkHttpClient client = ctx.getBean(OkHttpClient.class);
                Request request = new Request.Builder().url(server.url("/ping")).build();
                try (Response response = client.newCall(request).execute()) {
                    assertThat(response.isSuccessful()).isTrue();
                    assertThat(response.body()).isNotNull();
                    assertThat(response.body().string()).isEqualTo("pong");
                }
            });
        }
    }
}
