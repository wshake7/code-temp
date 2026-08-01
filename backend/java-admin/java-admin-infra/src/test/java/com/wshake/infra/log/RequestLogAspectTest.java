package com.wshake.infra.log;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/**
 * {@link RequestLogAspect} 参数序列化与 HTTP 行组装单测。
 *
 * <p>验证：含 HttpServletRequest 的 args 能打出业务 DTO；password 脱敏；
 * 不再回退为 {@code [Ljava.lang.Object;@hash}；HTTP method/uri/query 格式正确。
 *
 * @author wshake
 */
class RequestLogAspectTest {

    private RequestLogAspect aspect;

    @BeforeEach
    void setUp() {
        aspect = new RequestLogAspect(new ObjectMapper());
    }

    @Test
    void formatHttpLine_null_returnsDash() {
        assertThat(RequestLogAspect.formatHttpLine(null)).isEqualTo("-");
    }

    @Test
    void formatHttpLine_withoutQuery_isMethodAndUri() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        assertThat(RequestLogAspect.formatHttpLine(request)).isEqualTo("POST /api/auth/login");
    }

    @Test
    void formatHttpLine_withQuery_appendsQueryString() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/users");
        request.setQueryString("page=1&size=10");
        assertThat(RequestLogAspect.formatHttpLine(request)).isEqualTo("GET /api/users?page=1&size=10");
    }

    @Test
    void safeToJson_loginStyleArgs_includesDtoAndSkipsServletRequest() {
        LoginLike req = new LoginLike();
        req.setUsername("root");
        req.setPassword("123456");
        req.setAltcha("altcha-payload");

        Object[] args = new Object[] {req, new MockHttpServletRequest("POST", "/api/auth/login")};

        String json = aspect.safeToJson(args);

        assertThat(json).doesNotContain("Ljava.lang.Object");
        assertThat(json).contains("\"username\":\"root\"");
        assertThat(json).contains("\"altcha\":\"altcha-payload\"");
        assertThat(json).contains("\"password\":\"***\"");
        assertThat(json).doesNotContain("123456");
        assertThat(json).doesNotContain("MockHttpServletRequest");
    }

    @Test
    void safeToJson_skipsServletResponse() {
        LoginLike req = new LoginLike();
        req.setUsername("u");
        req.setPassword("secret");

        String json = aspect.safeToJson(new Object[] {req, new MockHttpServletResponse()});

        assertThat(json).contains("\"username\":\"u\"");
        assertThat(json).contains("\"password\":\"***\"");
        assertThat(json).doesNotContain("secret");
    }

    @Test
    void safeToJson_null_returnsNullLiteral() {
        assertThat(aspect.safeToJson(null)).isEqualTo("null");
    }

    @Test
    void safeToJson_plainPojo_serializesAsJson() {
        LoginLike req = new LoginLike();
        req.setUsername("alice");
        req.setPassword("p@ss");

        String json = aspect.safeToJson(req);

        assertThat(json).contains("\"username\":\"alice\"");
        assertThat(json).contains("\"password\":\"***\"");
        assertThat(json).doesNotContain("p@ss");
    }

    @Test
    void safeToJson_unserializableArg_usesTypePlaceholderNotArrayHash() {
        Object bad = new Unserializable();
        String json = aspect.safeToJson(new Object[] {bad});

        assertThat(json).doesNotContain("Ljava.lang.Object");
        assertThat(json).contains("Unserializable");
    }

    @Test
    void safeToJson_longPayload_isTruncated() {
        LoginLike req = new LoginLike();
        req.setUsername("x".repeat(600));
        req.setPassword("hidden");

        String json = aspect.safeToJson(new Object[] {req});

        assertThat(json).endsWith("...(truncated)");
        assertThat(json.length()).isLessThanOrEqualTo(500 + "...(truncated)".length());
    }

    @Data
    private static class LoginLike {
        private String username;
        private String password;
        private String altcha;
    }

    /** Jackson 无法序列化：无默认属性且带自引用。 */
    private static final class Unserializable {
        @SuppressWarnings("unused")
        private final Object self = this;
    }
}
