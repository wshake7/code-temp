package com.wshake.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;

/**
 * 全量替换角色菜单绑定。
 *
 * @author wshake
 */
@Data
@Schema(description = "角色菜单绑定")
public class RoleMenuBindRequest {

    @NotNull
    @Schema(description = "菜单 ID 全量列表", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<Long> menuIds;
}
