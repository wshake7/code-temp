package com.wshake.service.entity;

import com.easy.query.core.annotation.Column;
import com.easy.query.core.annotation.EntityProxy;
import com.easy.query.core.annotation.Table;
import com.easy.query.core.proxy.ProxyEntityAvailable;
import com.wshake.service.entity.proxy.TemporalTaskExecutionProxy;
import java.time.LocalDateTime;
import lombok.Data;

/**
 * Temporal 执行记录镜像（对齐 schema {@code temporal_task_execution}）。
 *
 * <p>启动时 insert {@code RUNNING}，结束后 update 终态（status / result / failure / closedAt）；
 * 无软删、无 {@code updated_at}，故不继承 {@link BaseEntity}。
 *
 * @author wshake
 */
@Data
@Table("temporal_task_execution")
@EntityProxy
public class TemporalTaskExecution implements ProxyEntityAvailable<TemporalTaskExecution, TemporalTaskExecutionProxy> {

    @Column(primaryKey = true, generatedKey = true)
    private Long id;

    /** 软外键 → temporal_task_config.id；配置软删后可悬空。 */
    private Long configId;

    private String workflowId;

    private String runId;

    private String workflowType;

    private String taskQueue;

    /**
     * RUNNING / COMPLETED / FAILED / CANCELLED / TERMINATED / TIMED_OUT / CONTINUED_AS_NEW。
     */
    private String status;

    private LocalDateTime startedAt;

    /** 关闭时间；null=仍在运行。 */
    private LocalDateTime closedAt;

    /** 输入摘要 JSON。 */
    private String inputSummary;

    /** 结果摘要 JSON。 */
    private String resultSummary;

    private String failureReason;

    private LocalDateTime createdAt;
}
