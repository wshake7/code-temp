package com.wshake.api.vo;

import com.wshake.service.task.TaskManageModels.TaskExecutionView;
import io.github.linpeilie.annotations.AutoMapper;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 任务执行记录 VO。
 *
 * @author wshake
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@AutoMapper(target = TaskExecutionView.class)
@Schema(description = "任务执行记录")
public class TaskExecutionVO {

    private Long id;
    private Long configId;
    private String configName;
    private String workflowId;
    private String runId;
    private String workflowType;
    private String taskQueue;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime closedAt;
    private Map<String, Object> inputSummary;
    private Map<String, Object> resultSummary;
    private String failureReason;
    private LocalDateTime createdAt;
}
