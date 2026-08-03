package com.wshake.api.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 手动触发任务结果。
 *
 * @author wshake
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "手动触发结果")
public class TaskTriggerResultVO {

    private TaskConfigVO config;
    private TaskExecutionVO execution;
}
