package com.wshake.service.repository;

import com.easy.query.api.proxy.client.EasyEntityQuery;
import com.easy.query.core.api.pagination.EasyPageResult;
import com.wshake.service.entity.TemporalTaskExecution;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 任务执行记录 Repository（insert + 终态 update + 分页/详情查询）。
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
                    // PENDING 的 startedAt 为 null，按创建时间保证「最新派发优先」
                    t.createdAt().desc();
                    t.id().desc();
                })
                .toPageResult(page, pageSize);
    }

    public void insert(TemporalTaskExecution row) {
        easyEntityQuery.insertable(row).executeRows(true);
    }

    /**
     * 将 PENDING 记录推进为 RUNNING：写入 child 真实 workflowId/runId，并设置 startedAt。
     *
     * @return 影响行数
     */
    public long markRunning(Long id, String workflowId, String runId, LocalDateTime startedAt) {
        return easyEntityQuery
                .updatable(TemporalTaskExecution.class)
                .setColumns(t -> {
                    t.status().set("RUNNING");
                    t.workflowId().set(workflowId);
                    t.runId().set(runId);
                    t.startedAt().set(startedAt);
                })
                .where(t -> t.id().eq(id))
                .executeRows();
    }

    /**
     * 将执行记录更新为终态。
     *
     * @return 影响行数
     */
    public long complete(Long id, String status, String resultSummary, String failureReason, LocalDateTime closedAt) {
        return easyEntityQuery
                .updatable(TemporalTaskExecution.class)
                .setColumns(t -> {
                    t.status().set(status);
                    t.resultSummary().set(resultSummary);
                    t.failureReason().set(failureReason);
                    t.closedAt().set(closedAt);
                })
                .where(t -> t.id().eq(id))
                .executeRows();
    }
}
