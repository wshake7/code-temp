package com.wshake.service.log;

import com.easy.query.core.api.pagination.EasyPageResult;
import com.wshake.common.result.PageData;
import com.wshake.service.entity.ApiLog;
import com.wshake.service.entity.ApiLogArchive;
import com.wshake.service.log.LogManageModels.ApiLogListQuery;
import com.wshake.service.log.LogManageModels.ApiLogView;
import com.wshake.service.repository.ApiLogRepository;
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
            return PageData.of(rows.stream().map(this::toView).toList(), page.getTotal());
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
        return PageData.of(rows.stream().map(this::toView).toList(), page.getTotal());
    }

    private ApiLogView toView(ApiLog row) {
        return new ApiLogView(
                row.getId(),
                nullToEmpty(row.getMethod()),
                nullToEmpty(row.getModule()),
                nullToEmpty(row.getPath()),
                row.getStatusCode(),
                row.getSuccess(),
                nullToEmpty(row.getReason()),
                row.getCostTime() == null ? 0L : row.getCostTime(),
                nullToEmpty(row.getRequestId()),
                row.getSysUserId(),
                nullToEmpty(row.getUsername()),
                nullToEmpty(row.getRequestUri()),
                nullToEmpty(row.getRequestQuery()),
                nullToEmpty(row.getRequestBody()),
                nullToEmpty(row.getRequestHeader()),
                nullToEmpty(row.getReferer()),
                nullToEmpty(row.getResponse()),
                nullToEmpty(row.getBeforeChange()),
                nullToEmpty(row.getAfterChange()),
                nullToEmpty(row.getFormatChange()),
                nullToEmpty(row.getClientId()),
                nullToEmpty(row.getClientName()),
                nullToEmpty(row.getClientIp()),
                nullToEmpty(row.getUserAgent()),
                nullToEmpty(row.getBrowserName()),
                nullToEmpty(row.getBrowserVersion()),
                nullToEmpty(row.getOsName()),
                nullToEmpty(row.getOsVersion()),
                nullToEmpty(row.getLocation()),
                row.getCreatedAt(),
                null);
    }

    private ApiLogView toView(ApiLogArchive row) {
        return new ApiLogView(
                row.getId(),
                nullToEmpty(row.getMethod()),
                nullToEmpty(row.getModule()),
                nullToEmpty(row.getPath()),
                row.getStatusCode(),
                row.getSuccess(),
                nullToEmpty(row.getReason()),
                row.getCostTime() == null ? 0L : row.getCostTime(),
                nullToEmpty(row.getRequestId()),
                row.getSysUserId(),
                nullToEmpty(row.getUsername()),
                nullToEmpty(row.getRequestUri()),
                nullToEmpty(row.getRequestQuery()),
                nullToEmpty(row.getRequestBody()),
                nullToEmpty(row.getRequestHeader()),
                nullToEmpty(row.getReferer()),
                nullToEmpty(row.getResponse()),
                nullToEmpty(row.getBeforeChange()),
                nullToEmpty(row.getAfterChange()),
                nullToEmpty(row.getFormatChange()),
                nullToEmpty(row.getClientId()),
                nullToEmpty(row.getClientName()),
                nullToEmpty(row.getClientIp()),
                nullToEmpty(row.getUserAgent()),
                nullToEmpty(row.getBrowserName()),
                nullToEmpty(row.getBrowserVersion()),
                nullToEmpty(row.getOsName()),
                nullToEmpty(row.getOsVersion()),
                nullToEmpty(row.getLocation()),
                row.getCreatedAt(),
                row.getArchivedAt());
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
