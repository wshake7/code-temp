package com.wshake.infra.request;

import static org.assertj.core.api.Assertions.assertThat;

import com.wshake.common.constant.SecurityHeaders;
import com.wshake.common.request.RequestContext;
import com.wshake.service.support.geo.IpLocationResolver;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/**
 * RequestContextFilter：open/fill/close 生命周期。
 *
 * @author wshake
 */
class RequestContextFilterTest {

    private final RequestContextFilter filter = new RequestContextFilter(new IpLocationResolver(null, null));

    @AfterEach
    void clearRequestContext() {
        RequestContext.close();
    }

    @Test
    void filter_fillsRequestIdUriAndClearsAfter() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/user/info");
        req.addHeader(SecurityHeaders.REQUEST_ID, "nid-9");
        req.addHeader("X-Forwarded-For", "10.0.0.8, 10.0.0.1");
        MockHttpServletResponse resp = new MockHttpServletResponse();

        AtomicReference<String> seenId = new AtomicReference<>();
        AtomicReference<String> seenUri = new AtomicReference<>();
        AtomicReference<String> seenIp = new AtomicReference<>();
        AtomicReference<String> seenLocation = new AtomicReference<>();

        filter.doFilter(req, resp, (r, s) -> {
            seenId.set(RequestContext.requestIdOrNull());
            seenUri.set(RequestContext.requestUriOrNull());
            seenIp.set(RequestContext.clientIpOrNull());
            seenLocation.set(RequestContext.locationOrNull());
        });

        assertThat(seenId.get()).isEqualTo("nid-9");
        assertThat(seenUri.get()).isEqualTo("/api/user/info");
        assertThat(seenIp.get()).isEqualTo("10.0.0.8");
        assertThat(seenLocation.get()).isEqualTo("内网");
        // finally 已清理
        assertThat(RequestContext.get()).isNull();
    }

    @Test
    void filter_skipsUnknownInXff_andUsesNextValidIp() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/auth/login");
        req.addHeader("X-Forwarded-For", "unknown, 203.0.113.8");
        req.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse resp = new MockHttpServletResponse();

        AtomicReference<String> seenIp = new AtomicReference<>();
        filter.doFilter(req, resp, (r, s) -> seenIp.set(RequestContext.clientIpOrNull()));

        assertThat(seenIp.get()).isEqualTo("203.0.113.8");
        assertThat(RequestContext.get()).isNull();
    }

    @Test
    void filter_fallsBackToXRealIp_whenXffAbsent() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/user/info");
        req.addHeader("X-Real-IP", "198.51.100.9");
        req.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse resp = new MockHttpServletResponse();

        AtomicReference<String> seenIp = new AtomicReference<>();
        filter.doFilter(req, resp, (r, s) -> seenIp.set(RequestContext.clientIpOrNull()));

        assertThat(seenIp.get()).isEqualTo("198.51.100.9");
    }
}
