package com.wshake.service.repository;

import com.easy.query.api.proxy.client.EasyEntityQuery;
import com.wshake.service.entity.SysMenu;
import com.wshake.service.entity.SysRole;
import com.wshake.service.entity.SysRoleMenu;
import com.wshake.service.entity.SysUserRole;
import com.wshake.service.entity.proxy.SysMenuProxy;
import com.wshake.service.entity.proxy.SysRoleMenuProxy;
import com.wshake.service.entity.proxy.SysRoleProxy;
import com.wshake.service.entity.proxy.SysUserRoleProxy;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 鉴权相关查询（角色码、按钮权限码）。
 *
 * @author wshake
 */
@Component
@RequiredArgsConstructor
public class AuthQueryRepository {

    private final EasyEntityQuery easyEntityQuery;

    /**
     * 查询用户已绑定角色编码（未软删且启用）。
     */
    public List<String> findRoleCodesByUserId(Long userId) {
        List<Long> roleIds = easyEntityQuery
                .queryable(SysUserRole.class)
                .where(ur -> ur.userId().eq(userId))
                .select(SysUserRoleProxy::roleId)
                .toList();
        if (roleIds.isEmpty()) {
            return List.of();
        }
        return easyEntityQuery
                .queryable(SysRole.class)
                .where(r -> {
                    r.id().in(roleIds);
                    r.isEnabled().eq(1);
                })
                .select(SysRoleProxy::code)
                .toList();
    }

    /**
     * 查询用户可访问的 BUTTON 权限码。
     *
     * <p>规则对齐 mock：角色授权菜单中 type=BUTTON 且 permission_code 非空；
     * 或 BUTTON 的父 MENU 被授权。本实现直接取角色绑定的全部 BUTTON 权限码
     * （seed 对 root 角色已绑定完整按钮集）。
     */
    public List<String> findAccessCodesByUserId(Long userId) {
        List<Long> roleIds = easyEntityQuery
                .queryable(SysUserRole.class)
                .where(ur -> ur.userId().eq(userId))
                .select(SysUserRoleProxy::roleId)
                .toList();
        if (roleIds.isEmpty()) {
            return List.of();
        }
        List<Long> menuIds = easyEntityQuery
                .queryable(SysRoleMenu.class)
                .where(rm -> rm.roleId().in(roleIds))
                .select(SysRoleMenuProxy::menuId)
                .toList();
        if (menuIds.isEmpty()) {
            return List.of();
        }
        return easyEntityQuery
                .queryable(SysMenu.class)
                .where(m -> {
                    m.id().in(menuIds);
                    m.type().eq("BUTTON");
                    m.isEnabled().eq(1);
                    m.permissionCode().isNotNull();
                    m.permissionCode().ne("");
                })
                .select(SysMenuProxy::permissionCode)
                .distinct()
                .toList();
    }
}
