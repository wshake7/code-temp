package com.wshake.api.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 按菜单聚合 API IDs 的结果。
 *
 * @author wshake
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "按菜单聚合 API 结果")
public class ApisByMenusResultVO {

    @Schema(description = "请求的菜单 ID 列表")
    private List<Long> menuIds;

    @Schema(description = "聚合得到的 API ID 列表")
    private List<Long> apiIds;
}
