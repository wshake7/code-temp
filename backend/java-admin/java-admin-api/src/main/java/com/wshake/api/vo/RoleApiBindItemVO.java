package com.wshake.api.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 角色可授权接口项（带 bound）。
 *
 * @author wshake
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "角色 API 绑定项")
public class RoleApiBindItemVO {

    private Long id;
    private String name;
    private String method;
    private String path;
    private String permissionCode;
    private String apiGroup;
    private Integer isEnabled;
    private boolean bound;
}
