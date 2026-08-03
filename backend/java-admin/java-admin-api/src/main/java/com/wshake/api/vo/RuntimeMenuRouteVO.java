package com.wshake.api.vo;

import com.wshake.service.menu.MenuManageModels.RuntimeMenuRoute;
import io.github.linpeilie.annotations.AutoMapper;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 动态路由节点（对齐前端 MenuItem）。
 *
 * @author wshake
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@AutoMapper(target = RuntimeMenuRoute.class)
@Schema(description = "动态菜单路由")
public class RuntimeMenuRouteVO {

    private String name;
    private String path;
    private String component;
    private String redirect;
    private Map<String, Object> meta;
    private List<RuntimeMenuRouteVO> children;
}
