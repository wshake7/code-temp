package com.wshake.service.log;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.wshake.service.entity.ApiLog;
import com.wshake.service.entity.SysUser;
import com.wshake.service.log.LogManageModels.ApiLogWriteCommand;
import com.wshake.service.repository.ApiLogRepository;
import com.wshake.service.repository.SysUserRepository;
import com.wshake.service.support.geo.IpLocationResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * {@link ApiLogWriter} 单元测试（同步 Executor，断言字段填充与用户名回填）。
 *
 * @author wshake
 */
@ExtendWith(MockitoExtension.class)
class ApiLogWriterTest {

    private static final String CHROME_WINDOWS_UA =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

    @Mock
    private ApiLogRepository apiLogRepository;

    @Mock
    private SysUserRepository sysUserRepository;

    private ApiLogWriter writer;

    @BeforeEach
    void init() {
        IpLocationResolver resolver = new IpLocationResolver(null, null);
        writer = new ApiLogWriter(apiLogRepository, sysUserRepository, resolver, Runnable::run);
    }

    @Test
    void record_fillsKeyFieldsAndResolvesUsername() {
        SysUser user = new SysUser();
        user.setId(7L);
        user.setUsername("alice");
        when(sysUserRepository.findById(7L)).thenReturn(user);

        writer.record(new ApiLogWriteCommand(
                "GET",
                "/api/system/user/list",
                "user",
                200,
                true,
                "",
                42L,
                "req-abc",
                7L,
                "",
                "/api/system/user/list?page=1",
                "page=1",
                "[{\"q\":1}]",
                "{\"authorization\":\"***\"}",
                "http://localhost/",
                "{\"code\":0}",
                "web-admin",
                "",
                "127.0.0.1",
                CHROME_WINDOWS_UA));

        ArgumentCaptor<ApiLog> cap = ArgumentCaptor.forClass(ApiLog.class);
        verify(apiLogRepository).insert(cap.capture());
        ApiLog row = cap.getValue();
        assertThat(row.getMethod()).isEqualTo("GET");
        assertThat(row.getPath()).isEqualTo("/api/system/user/list");
        assertThat(row.getModule()).isEqualTo("user");
        assertThat(row.getStatusCode()).isEqualTo(200);
        assertThat(row.getSuccess()).isEqualTo(1);
        assertThat(row.getCostTime()).isEqualTo(42L);
        assertThat(row.getRequestId()).isEqualTo("req-abc");
        assertThat(row.getSysUserId()).isEqualTo(7L);
        assertThat(row.getUsername()).isEqualTo("alice");
        assertThat(row.getClientIp()).isEqualTo("127.0.0.1");
        assertThat(row.getBrowserName()).isEqualTo("Chrome");
        assertThat(row.getOsName()).isEqualTo("Windows");
        assertThat(row.getLocation()).isEqualTo("本机");
        assertThat(row.getRequestBody()).contains("q");
        assertThat(row.getResponse()).contains("code");
    }

    @Test
    void record_failure_setsSuccessZeroAndReason() {
        writer.record(new ApiLogWriteCommand(
                "POST",
                "/api/system/user",
                "user",
                500,
                false,
                "boom",
                9L,
                "",
                null,
                "",
                "/api/system/user",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "192.168.0.1",
                ""));

        ArgumentCaptor<ApiLog> cap = ArgumentCaptor.forClass(ApiLog.class);
        verify(apiLogRepository).insert(cap.capture());
        ApiLog row = cap.getValue();
        assertThat(row.getSuccess()).isEqualTo(0);
        assertThat(row.getStatusCode()).isEqualTo(500);
        assertThat(row.getReason()).isEqualTo("boom");
        assertThat(row.getRequestId()).startsWith("req-");
        assertThat(row.getLocation()).isEqualTo("内网");
    }
}
