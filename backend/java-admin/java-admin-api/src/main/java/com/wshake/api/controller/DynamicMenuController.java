package com.wshake.api.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.wshake.api.vo.RuntimeMenuRouteVO;
import com.wshake.common.exception.AuthException;
import com.wshake.common.result.Result;
import com.wshake.service.menu.MenuManageModels.RuntimeMenuRoute;
import com.wshake.service.menu.SysMenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 登录用户动态菜单路由（{@code GET /api/menu/all}）。
 *
 * @author wshake
 */
@Tag(name = "动态菜单", description = "按当前用户角色过滤的侧栏路由树")
@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public final class DynamicMenuController {

    private final SysMenuService sysMenuService;

    @GetMapping("/all")
    @Operation(summary = "当前用户动态菜单", description = "user→role_menu→祖先补全→DIR/MENU 投影")
    public Result<List<RuntimeMenuRouteVO>> all() {
        if (!StpUtil.isLogin()) {
            throw AuthException.notLogin();
        }
        Object loginId = StpUtil.getLoginId();
        Long userId = loginId instanceof Number n ? n.longValue() : Long.parseLong(String.valueOf(loginId));
        List<RuntimeMenuRouteVO> routes =
                sysMenuService.listRuntimeMenusForUser(userId).stream().map(DynamicMenuController::toVo).toList();
        return Result.ok(routes);
    }

    private static RuntimeMenuRouteVO toVo(RuntimeMenuRoute route) {
        List<RuntimeMenuRouteVO> children = null;
        if (route.children() != null && !route.children().isEmpty()) {
            children = route.children().stream().map(DynamicMenuController::toVo).toList();
        }
        return new RuntimeMenuRouteVO(
                route.name(), route.path(), route.component(), route.redirect(), route.meta(), children);
    }
}
