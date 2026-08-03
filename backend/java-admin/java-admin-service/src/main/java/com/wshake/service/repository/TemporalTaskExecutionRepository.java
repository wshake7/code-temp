package com.wshake.service.repository;

import com.easy.query.api.proxy.client.EasyEntityQuery;
import com.easy.query.core.api.pagination.EasyPageResult;
import com.wshake.service.entity.TemporalTaskExecution;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 任务执行记录 Repository（只增 + 分页/详情查询）。
 *
 * @author wshake
 */
@Component
@RequiredArgsConstructor
public class TemporalTaskExecutionRepository {

    private final EasyEntityQuery easyEntityQuery;

    public TemporalTaskExecution findById(Long id) {
        return easyEntityQuery
                .queryable(TemporalTaskExecution.class)
                .where(t -> t.id().eq(id))
                .firstOrNull();
    }

    public EasyPageResult<TemporalTaskExecution> page(
            int page,
            int pageSize,
            Long configId,
            String status,
            LocalDateTime startedAtFrom,
            LocalDateTime startedAtTo) {
        return easyEntityQuery
                .queryable(TemporalTaskExecution.class)
                .where(t -> {
                    t.configId().eq(configId != null, configId);
                    t.status().eq(status != null, status);
                    t.startedAt().ge(startedAtFrom != null, startedAtFrom);
                    t.startedAt().le(startedAtTo != null, startedAtTo);
                })
                .orderBy(t -> {
                    t.startedAt().desc();
                    t.id().desc();
                })
                .toPageResult(page, pageSize);
    }

    public void insert(TemporalTaskExecution row) {
        easyEntityQuery.insertable(row).executeRows(true);
    }
}
