package com.wshake.api.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.wshake.api.dto.CreateRoleRequest;
import com.wshake.api.dto.RoleApiBindRequest;
import com.wshake.api.dto.RoleMenuBindRequest;
import com.wshake.api.dto.UpdateRoleRequest;
import com.wshake.api.vo.RoleApiBindItemVO;
import com.wshake.api.vo.RoleApiBindResultVO;
import com.wshake.api.vo.RoleListItemVO;
import com.wshake.api.vo.RoleMenuBindItemVO;
import com.wshake.api.vo.RoleMenuBindResultVO;
import com.wshake.common.exception.AuthException;
import com.wshake.common.result.PageData;
import com.wshake.common.result.Result;
import com.wshake.service.role.RoleManageModels.CreateRoleCommand;
import com.wshake.service.role.RoleManageModels.ParentIdChange;
import com.wshake.service.role.RoleManageModels.RoleApiBindResult;
import com.wshake.service.role.RoleManageModels.RoleApiBindView;
import com.wshake.service.role.RoleManageModels.RoleListQuery;
import com.wshake.service.role.RoleManageModels.RoleMenuBindResult;
import com.wshake.service.role.RoleManageModels.RoleMenuBindView;
import com.wshake.service.role.RoleManageModels.RoleView;
import com.wshake.service.role.RoleManageModels.UpdateRoleCommand;
import com.wshake.service.role.SysRoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
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
 * 角色管理 Controller（路径对齐前端 {@code /api/system/role/*}）。
 *
 * @author wshake
 */
@Tag(name = "角色管理", description = "分页/CRUD/软删/菜单与 API 绑定")
@RestController
@RequestMapping("/api/system/role")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public final class RoleController {

    private final SysRoleService sysRoleService;

    @GetMapping("/list")
    @Operation(summary = "分页查询角色", description = "data={items,total}；附 userCount/parentName")
    public Result<PageData<RoleListItemVO>> list(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer status) {
        requireLogin();
        PageData<RoleView> pageData =
                sysRoleService.pageRoles(RoleListQuery.of(page, pageSize, code, name, status));
        List<RoleListItemVO> items = pageData.getItems().stream().map(RoleController::toVo).toList();
        return Result.ok(PageData.of(items, pageData.getTotal()));
    }

    @GetMapping("/all")
    @Operation(summary = "全量角色", description = "用户表单角色下拉；可选 status 过滤")
    public Result<List<RoleListItemVO>> all(@RequestParam(required = false) Integer status) {
        requireLogin();
        List<RoleListItemVO> items = sysRoleService.listAll(status).stream().map(RoleController::toVo).toList();
        return Result.ok(items);
    }

    @PostMapping
    @Operation(summary = "创建角色")
    public Result<RoleListItemVO> create(@Valid @RequestBody CreateRoleRequest req) {
        requireLogin();
        RoleView view = sysRoleService.create(new CreateRoleCommand(
                req.getCode(),
                req.getName(),
                req.getParentId(),
                req.getSort(),
                req.getIsEnabled(),
                req.getRemark()));
        return Result.ok(toVo(view));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新角色", description = "code 不可改；parentId 省略不改，显式 null 清父")
    public Result<RoleListItemVO> update(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest req) {
        requireLogin();
        ParentIdChange parentChange =
                req.isParentIdPresent() ? ParentIdChange.of(req.getParentId()) : ParentIdChange.absent();
        RoleView view = sysRoleService.update(new UpdateRoleCommand(
                id, req.getName(), parentChange, req.getSort(), req.getIsEnabled(), req.getRemark()));
        return Result.ok(toVo(view));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "软删角色", description = "Root/有用户/有子角色时拒绝")
    public Result<RoleListItemVO> delete(@PathVariable Long id) {
        requireLogin();
        return Result.ok(toVo(sysRoleService.softDelete(id)));
    }

    @GetMapping("/{id}/menus")
    @Operation(summary = "角色菜单绑定列表", description = "全量菜单 + bound 标记")
    public Result<List<RoleMenuBindItemVO>> menus(@PathVariable Long id) {
        requireLogin();
        List<RoleMenuBindItemVO> items =
                sysRoleService.listMenuBinds(id).stream().map(RoleController::toMenuVo).toList();
        return Result.ok(items);
    }

    @PostMapping("/{id}/menus")
    @Operation(summary = "全量替换角色菜单绑定")
    public Result<RoleMenuBindResultVO> setMenus(
            @PathVariable Long id, @Valid @RequestBody RoleMenuBindRequest req) {
        requireLogin();
        RoleMenuBindResult result = sysRoleService.replaceMenus(id, req.getMenuIds());
        return Result.ok(new RoleMenuBindResultVO(result.roleId(), result.menuIds()));
    }

    @GetMapping("/{id}/apis")
    @Operation(summary = "角色 API 绑定列表", description = "全量接口 + bound 标记")
    public Result<List<RoleApiBindItemVO>> apis(@PathVariable Long id) {
        requireLogin();
        List<RoleApiBindItemVO> items =
                sysRoleService.listApiBinds(id).stream().map(RoleController::toApiVo).toList();
        return Result.ok(items);
    }

    @PostMapping("/{id}/apis")
    @Operation(summary = "全量替换角色 API 绑定", description = "变更后同步受影响用户的 Casbin 策略")
    public Result<RoleApiBindResultVO> setApis(
            @PathVariable Long id, @Valid @RequestBody RoleApiBindRequest req) {
        requireLogin();
        RoleApiBindResult result = sysRoleService.replaceApis(id, req.getApiIds());
        return Result.ok(new RoleApiBindResultVO(result.roleId(), result.apiIds()));
    }

    private static void requireLogin() {
        if (!StpUtil.isLogin()) {
            throw AuthException.notLogin();
        }
    }

    private static RoleListItemVO toVo(RoleView view) {
        return new RoleListItemVO(
                view.id(),
                view.code(),
                view.name(),
                view.parentId(),
                view.sort(),
                view.remark(),
                view.isEnabled(),
                view.deletedAt(),
                view.createdAt(),
                view.updatedAt(),
                view.createdBy(),
                view.updatedBy(),
                view.userCount(),
                view.parentName());
    }

    private static RoleMenuBindItemVO toMenuVo(RoleMenuBindView view) {
        return new RoleMenuBindItemVO(
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
                view.remark(),
                view.deletedAt(),
                view.createdAt(),
                view.updatedAt(),
                view.bound());
    }

    private static RoleApiBindItemVO toApiVo(RoleApiBindView view) {
        return new RoleApiBindItemVO(
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
