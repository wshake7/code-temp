package com.wshake.infra.log;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wshake.common.request.RequestContext;
import com.wshake.service.log.ApiLogWriter;
import com.wshake.service.log.LogManageModels.ApiLogWriteCommand;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * {@link RequestLogAspect} 写入 api_log 可观察性测试。
 *
 * @author wshake
 */
class RequestLogAspectApiLogTest {

    private ApiLogWriter apiLogWriter;
    private RequestLogAspect aspect;

    @BeforeEach
    void setUp() {
        apiLogWriter = mock(ApiLogWriter.class);
        aspect = new RequestLogAspect(new ObjectMapper(), apiLogWriter);
        RequestContext.open();
        RequestContext.setRequestId("req-test-1");
        RequestContext.setClientIp("10.0.0.8");
        RequestContext.setLocation("内网");
        RequestContext.setUserId(11L);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/system/user/list");
        request.setQueryString("page=1");
        request.addHeader("User-Agent", "JUnit/1.0");
        request.addHeader("Authorization", "Bearer secret-token");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }

    @AfterEach
    void tearDown() {
        RequestContext.close();
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void around_success_recordsApiLogWithMaskedHeaderAndCost() throws Throwable {
        ProceedingJoinPoint pjp = mock(ProceedingJoinPoint.class);
        Signature signature = mock(Signature.class);
        org.mockito.Mockito.when(pjp.getSignature()).thenReturn(signature);
        org.mockito.Mockito.when(signature.toShortString()).thenReturn("UserController.list(..)");
        org.mockito.Mockito.when(pjp.getArgs()).thenReturn(new Object[] {});
        org.mockito.Mockito.when(pjp.proceed()).thenReturn(java.util.Map.of("code", 0));

        aspect.around(pjp);

        ArgumentCaptor<ApiLogWriteCommand> cap = ArgumentCaptor.forClass(ApiLogWriteCommand.class);
        verify(apiLogWriter).record(cap.capture());
        ApiLogWriteCommand cmd = cap.getValue();
        assertThat(cmd.method()).isEqualTo("GET");
        assertThat(cmd.path()).isEqualTo("/api/system/user/list");
        assertThat(cmd.module()).isEqualTo("user");
        assertThat(cmd.statusCode()).isEqualTo(200);
        assertThat(cmd.success()).isTrue();
        assertThat(cmd.requestId()).isEqualTo("req-test-1");
        assertThat(cmd.sysUserId()).isEqualTo(11L);
        assertThat(cmd.clientIp()).isEqualTo("10.0.0.8");
        assertThat(cmd.costTimeMs()).isGreaterThanOrEqualTo(0L);
        assertThat(cmd.requestHeader()).contains("***");
        assertThat(cmd.requestHeader()).doesNotContain("secret-token");
        assertThat(cmd.response()).contains("code");
    }

    @Test
    void resolveModule_systemAndTopLevel() {
        assertThat(RequestLogAspect.resolveModule("/api/system/login-log/list")).isEqualTo("login-log");
        assertThat(RequestLogAspect.resolveModule("/api/auth/login")).isEqualTo("auth");
        assertThat(RequestLogAspect.resolveModule("/api/menu/all")).isEqualTo("menu");
        assertThat(RequestLogAspect.resolveModule("")).isEqualTo("");
    }
}
