package com.wshake.service.log;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.easy.query.core.api.pagination.DefaultPageResult;
import com.wshake.common.result.PageData;
import com.wshake.service.entity.SysLoginLog;
import com.wshake.service.log.LogManageModels.LoginLogListQuery;
import com.wshake.service.log.LogManageModels.LoginLogView;
import com.wshake.service.repository.SysLoginLogRepository;
import io.github.linpeilie.Converter;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * {@link LoginLogService} 分页映射测试。
 *
 * @author wshake
 */
@ExtendWith(MockitoExtension.class)
class LoginLogServiceTest {

    @Mock
    private SysLoginLogRepository sysLoginLogRepository;

    @Spy
    private Converter converter = new Converter();

    @InjectMocks
    private LoginLogService loginLogService;

    @Test
    void page_hot_mapsRows() {
        SysLoginLog row = new SysLoginLog();
        row.setId(3L);
        row.setUsername("root");
        row.setSuccess(1);
        row.setReason("");
        row.setStatusCode(200);
        row.setSysUserId(1L);
        row.setLoginMethod("PASSWORD");
        row.setLoginTime(LocalDateTime.of(2026, 1, 2, 3, 4));
        row.setLoginIp("1.1.1.1");
        row.setCreatedAt(LocalDateTime.of(2026, 1, 2, 3, 4));

        when(sysLoginLogRepository.pageHot(anyInt(), anyInt(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new DefaultPageResult<>(1L, List.of(row)));

        PageData<LoginLogView> page =
                loginLogService.page(LoginLogListQuery.of(1, 20, "hot", "ro", 1, null, null, null, null));

        assertThat(page.getTotal()).isEqualTo(1L);
        assertThat(page.getItems()).hasSize(1);
        assertThat(page.getItems().get(0).username()).isEqualTo("root");
        assertThat(page.getItems().get(0).archivedAt()).isNull();
        verify(sysLoginLogRepository).pageHot(eq(1), eq(20), eq("ro"), eq(1), any(), any(), any(), any());
    }
}
