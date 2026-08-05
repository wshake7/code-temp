package com.wshake.service.log;

import com.easy.query.core.api.pagination.EasyPageResult;
import com.wshake.common.result.PageData;
import com.wshake.service.entity.ApiLog;
import com.wshake.service.entity.ApiLogArchive;
import com.wshake.service.log.LogManageModels.ApiLogListQuery;
import com.wshake.service.log.LogManageModels.ApiLogView;
import com.wshake.service.repository.ApiLogRepository;
import io.github.linpeilie.Converter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * API 调用日志查询 Service（只读分页；写入由 {@link ApiLogWriter} 负责）。
 *
 * @author wshake
 */
@Service
@RequiredArgsConstructor
public class ApiLogService {

    private final ApiLogRepository apiLogRepository;
    private final Converter converter;

    public PageData<ApiLogView> page(ApiLogListQuery query) {
        if (query.archive()) {
            EasyPageResult<ApiLogArchive> page = apiLogRepository.pageArchive(
                    query.page(),
                    query.pageSize(),
                    query.method(),
                    query.module(),
                    query.path(),
                    query.success(),
                    query.statusCode(),
                    query.username(),
                    query.clientIp(),
                    query.requestId(),
                    query.createdAtFrom(),
                    query.createdAtTo());
            List<ApiLogArchive> rows = page.getData() == null ? List.of() : page.getData();
            return PageData.of(converter.convert(rows, ApiLogView.class), page.getTotal());
        }

        EasyPageResult<ApiLog> page = apiLogRepository.pageHot(
                query.page(),
                query.pageSize(),
                query.method(),
                query.module(),
                query.path(),
                query.success(),
                query.statusCode(),
                query.username(),
                query.clientIp(),
                query.requestId(),
                query.createdAtFrom(),
                query.createdAtTo());
        List<ApiLog> rows = page.getData() == null ? List.of() : page.getData();
        return PageData.of(converter.convert(rows, ApiLogView.class), page.getTotal());
    }
}
