package com.wshake.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 更新菜单请求（字段 null 表示不改；parentId/metadata 支持显式 null）。
 *
 * @author wshake
 */
@Data
@Schema(description = "更新菜单")
public class UpdateMenuRequest {

    @Schema(description = "父菜单 ID；显式 null 置为根")
    private Long parentId;

    /** 请求体是否包含 parentId 字段（Jackson 缺省与 null 无法区分时由控制器用 JsonNode 辅助；默认 absent）。 */
    @Schema(hidden = true)
    private boolean parentIdPresent;

    @Size(max = 64)
    private String name;

    @Size(max = 16)
    private String type;

    @Size(max = 255)
    private String path;

    @Size(max = 255)
    private String component;

    @Size(max = 64)
    private String icon;

    @Size(max = 255)
    private String redirect;

    @Size(max = 128)
    private String permissionCode;

    private String metadata;

    @Schema(hidden = true)
    private boolean metadataPresent;

    private Integer sort;

    private Integer isHidden;

    private Integer isEnabled;

    @Size(max = 512)
    private String remark;
}
