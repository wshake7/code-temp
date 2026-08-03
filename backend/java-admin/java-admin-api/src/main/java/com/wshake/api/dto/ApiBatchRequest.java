package com.wshake.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Data;

/**
 * API 资源批量操作。
 *
 * @author wshake
 */
@Data
@Schema(description = "API 批量 enable|disable|delete")
public class ApiBatchRequest {

    @Schema(description = "enable | disable | delete", requiredMode = Schema.RequiredMode.REQUIRED)
    private String action;

    @Schema(description = "API ID 列表", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<Long> ids;
}
