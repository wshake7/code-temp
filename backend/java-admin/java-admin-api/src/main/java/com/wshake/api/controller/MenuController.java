package com.wshake.api.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.wshake.api.dto.ApisByMenusRequest;
import com.wshake.api.dto.CreateMenuRequest;
import com.wshake.api.dto.MenuApiBindRequest;
import com.wshake.api.dto.MenuBatchRequest;
import com.wshake.api.dto.UpdateMenuRequest;
import com.wshake.api.vo.MenuApiBindItemVO;
import com.wshake.api.vo.MenuListItemVO;
import com.wshake.common.exception.AuthException;
import com.wshake.common.result.Result;
import com.wshake.common.result.TreePageData;
import com.wshake.service.menu.MenuManageModels.CreateMenuCommand;
import com.wshake.service.menu.MenuManageModels.MenuApiBindResult;
import com.wshake.service.menu.MenuManageModels.MenuApiBindView;
import com.wshake.service.menu.MenuManageModels.MenuBatchCommand;
import com.wshake.service.menu.MenuManageModels.MenuBatchResult;
import com.wshake.service.menu.MenuManageModels.MenuListPage;
import com.wshake.service.menu.MenuManageModels.MenuListQuery;
import com.wshake.service.menu.MenuManageModels.MenuView;
import com.wshake.service.menu.MenuManageModels.MetadataChange;
import com.wshake.service.menu.MenuManageModels.ParentIdChange;
import com.wshake.service.menu.MenuManageModels.UpdateMenuCommand;
import com.wshake.service.menu.SysMenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 菜单管理 Controller（路径对齐前端 {@code /api/system/menu/*}）。
 *
 * @author wshake
 */
@Tag(name = "菜单管理", description = "树形 CRUD/软删/batch/menu-api 绑定/name-path 校验")
@RestController
@RequestMapping("/api/system/menu")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public final class MenuController {

    private final SysMenuService sysMenuService;

    @GetMapping("/list")
    @Operation(summary = "分页查询菜单", description = "按根节点分页；data={items,total,itemTotal}")
    public Result<TreePageData<MenuListItemVO>> list(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String permissionCode,
            @RequestParam(required = false) Integer status) {
        requireLogin();
        MenuListPage pageData =
                sysMenuService.pageMenus(MenuListQuery.of(page, pageSize, name, type, permissionCode, status));
        List<MenuListItemVO> items = pageData.items().stream().map(MenuController::toVo).toList();
        return Result.ok(TreePageData.of(items, pageData.total(), pageData.itemTotal()));
    }

    @GetMapping("/all")
    @Operation(summary = "全量菜单", description = "供父菜单下拉与前端组树")
    public Result<List<MenuListItemVO>> all(
            @RequestParam(required = false) String type, @RequestParam(required = false) Integer status) {
        requireLogin();
        String typeFilter = type == null || "全部".equals(type) ? null : type;
        List<MenuListItemVO> items =
                sysMenuService.listAll(typeFilter, status).stream().map(MenuController::toVo).toList();
        return Result.ok(items);
    }

    @PostMapping
    @Operation(summary = "创建菜单")
    public Result<MenuListItemVO> create(@Valid @RequestBody CreateMenuRequest req) {
        requireLogin();
        MenuView view = sysMenuService.create(new CreateMenuCommand(
                req.getParentId(),
                req.getName(),
                req.getType(),
                req.getPath(),
                req.getComponent(),
                req.getIcon(),
                req.getRedirect(),
                req.getPermissionCode(),
                req.getMetadata(),
                req.getSort(),
                req.getIsHidden(),
                req.getIsEnabled(),
                req.getRemark()));
        return Result.ok(toVo(view));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新菜单")
    public Result<MenuListItemVO> update(@PathVariable Long id, @RequestBody JsonNode body) {
        requireLogin();
        UpdateMenuRequest req = parseUpdate(body);
        UpdateMenuCommand cmd = new UpdateMenuCommand(
                id,
                req.isParentIdPresent() ? ParentIdChange.of(req.getParentId()) : ParentIdChange.absent(),
                req.getName(),
                req.getType(),
                req.getPath(),
                req.getComponent(),
                req.getIcon(),
                req.getRedirect(),
                req.getPermissionCode(),
                req.isMetadataPresent() ? MetadataChange.of(req.getMetadata()) : MetadataChange.absent(),
                req.getSort(),
                req.getIsHidden(),
                req.getIsEnabled(),
                req.getRemark());
        return Result.ok(toVo(sysMenuService.update(cmd)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "软删菜单")
    public Result<MenuListItemVO> delete(@PathVariable Long id) {
        requireLogin();
        return Result.ok(toVo(sysMenuService.softDelete(id)));
    }

    @PostMapping("/batch")
    @Operation(summary = "批量 enable|disable|delete")
    public Result<Map<String, Object>> batch(@RequestBody MenuBatchRequest req) {
        requireLogin();
        MenuBatchResult result =
                sysMenuService.batch(new MenuBatchCommand(req.getAction(), req.getIds()));
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("action", result.action());
        data.put("affected", result.affected());
        data.put("ids", result.ids());
        return Result.ok(data);
    }

    @GetMapping("/{id}/apis")
    @Operation(summary = "读取菜单已绑定 API（含 bound 标记）")
    public Result<List<MenuApiBindItemVO>> menuApis(@PathVariable Long id) {
        requireLogin();
        List<MenuApiBindItemVO> items =
                sysMenuService.listMenuApis(id).stream().map(MenuController::toApiVo).toList();
        return Result.ok(items);
    }

    @PostMapping("/{id}/apis")
    @Operation(summary = "全量替换菜单-API 绑定")
    public Result<Map<String, Object>> setMenuApis(
            @PathVariable Long id, @RequestBody MenuApiBindRequest req) {
        requireLogin();
        MenuApiBindResult result = sysMenuService.setMenuApis(id, req.getApiIds());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("menuId", result.menuId());
        data.put("apiIds", result.apiIds());
        return Result.ok(data);
    }

    @PostMapping("/apis-by-menus")
    @Operation(summary = "按菜单聚合 API IDs")
    public Result<Map<String, Object>> apisByMenus(@RequestBody ApisByMenusRequest req) {
        requireLogin();
        var result = sysMenuService.apisByMenus(req.getMenuIds());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("menuIds", result.menuIds());
        data.put("apiIds", result.apiIds());
        return Result.ok(data);
    }

    @GetMapping("/name-exists")
    @Operation(summary = "菜单名是否已存在", description = "true=冲突")
    public Result<Boolean> nameExists(
            @RequestParam(required = false) String name, @RequestParam(required = false) Long id) {
        requireLogin();
        return Result.ok(sysMenuService.nameExists(name, id));
    }

    @GetMapping("/path-exists")
    @Operation(summary = "路由 path 是否已存在", description = "true=冲突")
    public Result<Boolean> pathExists(
            @RequestParam(required = false) String path, @RequestParam(required = false) Long id) {
        requireLogin();
        return Result.ok(sysMenuService.pathExists(path, id));
    }

    private static UpdateMenuRequest parseUpdate(JsonNode body) {
        UpdateMenuRequest req = new UpdateMenuRequest();
        if (body == null || body.isNull()) {
            return req;
        }
        if (body.has("parentId") || body.has("parent_id")) {
            req.setParentIdPresent(true);
            JsonNode n = body.has("parentId") ? body.get("parentId") : body.get("parent_id");
            req.setParentId(n == null || n.isNull() ? null : n.asLong());
        }
        if (body.has("name")) {
            req.setName(textOrNull(body.get("name")));
        }
        if (body.has("type")) {
            req.setType(textOrNull(body.get("type")));
        }
        if (body.has("path")) {
            req.setPath(textOrNull(body.get("path")));
        }
        if (body.has("component")) {
            req.setComponent(textOrNull(body.get("component")));
        }
        if (body.has("icon")) {
            req.setIcon(textOrNull(body.get("icon")));
        }
        if (body.has("redirect")) {
            req.setRedirect(textOrNull(body.get("redirect")));
        }
        if (body.has("permissionCode") || body.has("permission_code")) {
            JsonNode n = body.has("permissionCode") ? body.get("permissionCode") : body.get("permission_code");
            req.setPermissionCode(n == null || n.isNull() ? null : n.asText());
        }
        if (body.has("metadata")) {
            req.setMetadataPresent(true);
            JsonNode n = body.get("metadata");
            if (n == null || n.isNull()) {
                req.setMetadata(null);
            } else if (n.isTextual()) {
                req.setMetadata(n.asText());
            } else {
                req.setMetadata(n.toString());
            }
        }
        if (body.has("sort") && !body.get("sort").isNull()) {
            req.setSort(body.get("sort").asInt());
        }
        if (body.has("isHidden") || body.has("is_hidden")) {
            JsonNode n = body.has("isHidden") ? body.get("isHidden") : body.get("is_hidden");
            if (n != null && !n.isNull()) {
                req.setIsHidden(n.asInt());
            }
        }
        if (body.has("isEnabled") || body.has("is_enabled")) {
            JsonNode n = body.has("isEnabled") ? body.get("isEnabled") : body.get("is_enabled");
            if (n != null && !n.isNull()) {
                req.setIsEnabled(n.asInt());
            }
        }
        if (body.has("remark")) {
            req.setRemark(textOrNull(body.get("remark")));
        }
        return req;
    }

    private static String textOrNull(JsonNode n) {
        if (n == null || n.isNull()) {
            return null;
        }
        return n.asText();
    }

    private static void requireLogin() {
        if (!StpUtil.isLogin()) {
            throw AuthException.notLogin();
        }
    }

    private static MenuListItemVO toVo(MenuView view) {
        return new MenuListItemVO(
                view.id(),
                view.parentId(),
                view.name(),
                view.type(),
                view.path(),
                view.component(),
                view.icon(),
                view.redirect(),
                view.permissionCode(),
                view.treePath(),
                view.metadata(),
                view.sort(),
                view.isHidden(),
                view.isEnabled(),
                view.deletedAt(),
                view.remark(),
                view.createdAt(),
                view.updatedAt(),
                view.createdBy(),
                view.updatedBy());
    }

    private static MenuApiBindItemVO toApiVo(MenuApiBindView view) {
        return new MenuApiBindItemVO(
                view.id(),
                view.name(),
                view.method(),
                view.path(),
                view.permissionCode(),
                view.apiGroup(),
                view.isEnabled(),
                view.bound());
    }
}
