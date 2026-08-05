package com.wshake.service.log;

import com.easy.query.core.api.pagination.EasyPageResult;
import com.wshake.common.result.PageData;
import com.wshake.service.entity.SysLoginLog;
import com.wshake.service.entity.SysLoginLogArchive;
import com.wshake.service.log.LogManageModels.LoginLogListQuery;
import com.wshake.service.log.LogManageModels.LoginLogView;
import com.wshake.service.repository.SysLoginLogRepository;
import io.github.linpeilie.Converter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 登录日志查询 Service（只读分页；写入由 {@link com.wshake.service.auth.LoginLogger} 负责）。
 *
 * @author wshake
 */
@Service
@RequiredArgsConstructor
public class LoginLogService {

    private final SysLoginLogRepository sysLoginLogRepository;
    private final Converter converter;

    public PageData<LoginLogView> page(LoginLogListQuery query) {
        if (query.archive()) {
            EasyPageResult<SysLoginLogArchive> page = sysLoginLogRepository.pageArchive(
                    query.page(),
                    query.pageSize(),
                    query.username(),
                    query.success(),
                    query.loginMethod(),
                    query.loginIp(),
                    query.loginTimeFrom(),
                    query.loginTimeTo());
            List<SysLoginLogArchive> rows = page.getData() == null ? List.of() : page.getData();
            return PageData.of(converter.convert(rows, LoginLogView.class), page.getTotal());
        }

        EasyPageResult<SysLoginLog> page = sysLoginLogRepository.pageHot(
                query.page(),
                query.pageSize(),
                query.username(),
                query.success(),
                query.loginMethod(),
                query.loginIp(),
                query.loginTimeFrom(),
                query.loginTimeTo());
        List<SysLoginLog> rows = page.getData() == null ? List.of() : page.getData();
        return PageData.of(converter.convert(rows, LoginLogView.class), page.getTotal());
    }
}
