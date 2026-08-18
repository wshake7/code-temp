package com.wshake.infra.log;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wshake.common.constant.MdcKeys;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.util.function.Consumer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.parallel.Isolated;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.boot.logging.LoggingInitializationContext;
import org.springframework.boot.logging.LoggingSystem;
import org.springframework.mock.env.MockEnvironment;

/**
 * 验证 logback-spring.xml：dev 纯文本，prod/test 为 Logstash JSON。
 *
 * @author wshake
 */
@Isolated
class LogbackProfileFormatTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @AfterEach
    void restoreLogging() {
        LoggingSystem.get(getClass().getClassLoader()).cleanUp();
        MDC.clear();
    }

    @Test
    void prodProfile_consoleIsLogstashJsonWithMdc() throws Exception {
        MDC.put(MdcKeys.TRACE_ID, "trace-probe");
        MDC.put(MdcKeys.USER_ID, "42");
        JsonNode json = parseJsonLine(captureConsole("prod", "json-format-probe"));
        assertThat(json.path("@timestamp").asText()).isNotBlank();
        assertThat(json.path("level").asText()).isEqualTo("INFO");
        assertThat(json.path("message").asText()).isEqualTo("json-format-probe");
        assertThat(json.path("logger_name").asText()).contains("LogFormatProbe");
        assertThat(json.path("traceId").asText()).isEqualTo("trace-probe");
        assertThat(json.path("userId").asText()).isEqualTo("42");
    }

    @Test
    void prodProfile_fluentKeyValuesAreJsonFields() throws Exception {
        String out = captureConsole(
                "prod",
                logger -> logger.atInfo()
                        .addKeyValue("logType", "HTTP")
                        .addKeyValue("handler", "Foo.bar()")
                        .addKeyValue("costMs", 12)
                        .log());
        JsonNode json = parseJsonLine(out);
        assertThat(json.path("message").asText()).isEmpty();
        assertThat(json.path("logType").asText()).isEqualTo("HTTP");
        assertThat(json.path("handler").asText()).isEqualTo("Foo.bar()");
        assertThat(json.path("costMs").asInt()).isEqualTo(12);
    }

    @Test
    void testProfile_consoleIsLogstashJson() throws Exception {
        JsonNode json = parseJsonLine(captureConsole("test", "json-format-probe-test"));
        assertThat(json.path("message").asText()).isEqualTo("json-format-probe-test");
        assertThat(json.path("level").asText()).isEqualTo("INFO");
        assertThat(json.path("@timestamp").asText()).isNotBlank();
    }

    @Test
    void devProfile_consoleIsPlainText() {
        String out = captureConsole("dev", "plain-format-probe");
        assertThat(out).contains("plain-format-probe");
        assertThat(out).containsPattern("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}");
        assertThat(out).doesNotContain("\"@timestamp\"");
    }

    private JsonNode parseJsonLine(String out) throws Exception {
        String line = out.lines()
                .map(String::trim)
                .filter(s -> s.startsWith("{") && s.contains("LogFormatProbe"))
                .findFirst()
                .orElseThrow(() -> new AssertionError("未找到 JSON 日志行: " + out));
        return MAPPER.readTree(line);
    }

    private String captureConsole(String profile, String message) {
        return captureConsole(profile, logger -> logger.info(message));
    }

    private String captureConsole(String profile, Consumer<Logger> action) {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles(profile);
        env.setProperty("spring.application.name", "java-admin-log-probe");
        PrintStream original = System.out;
        ByteArrayOutputStream buf = new ByteArrayOutputStream();
        PrintStream capture = new PrintStream(buf, true, StandardCharsets.UTF_8);
        System.setOut(capture);
        LoggingSystem system = LoggingSystem.get(getClass().getClassLoader());
        try {
            system.beforeInitialize();
            system.initialize(new LoggingInitializationContext(env), null, null);
            action.accept(LoggerFactory.getLogger("com.wshake.infra.log.LogFormatProbe"));
            capture.flush();
            return buf.toString(StandardCharsets.UTF_8);
        } finally {
            System.setOut(original);
        }
    }
}
