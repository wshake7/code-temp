package com.wshake.service.repository;

import com.easy.query.api.proxy.client.EasyEntityQuery;
import com.wshake.service.casbin.CasbinPolicyPort.ApiPolicy;
import com.wshake.service.entity.SysApi;
import com.wshake.service.entity.SysRole;
import com.wshake.service.entity.SysRoleApi;
import com.wshake.service.entity.SysUserRole;
import com.wshake.service.entity.proxy.SysRoleProxy;
import com.wshake.service.entity.proxy.SysUserRoleProxy;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 用户-角色关联与角色 API 展开查询。
 *
 * <p>关联表无软删：解绑/重绑为硬删行再插入。
 *
 * @author wshake
 */
@Component
@RequiredArgsConstructor
public class SysUserRoleRepository {

    private final EasyEntityQuery easyEntityQuery;

    /** 用户绑定的角色 ID 列表。 */
    public List<Long> findRoleIdsByUserId(Long userId) {
        return easyEntityQuery
                .queryable(SysUserRole.class)
                .where(ur -> ur.userId().eq(userId))
                .select(SysUserRoleProxy::roleId)
                .toList();
    }

    /**
     * 批量查询用户 → 角色 ID 映射（用于列表组装）。
     */
    public Map<Long, List<Long>> findRoleIdsByUserIds(List<Long> userIds) {
        Map<Long, List<Long>> map = new LinkedHashMap<>();
        if (userIds == null || userIds.isEmpty()) {
            return map;
        }
        for (Long id : userIds) {
            map.put(id, new ArrayList<>());
        }
        List<SysUserRole> rows = easyEntityQuery
                .queryable(SysUserRole.class)
                .where(ur -> ur.userId().in(userIds))
                .toList();
        for (SysUserRole row : rows) {
            map.computeIfAbsent(row.getUserId(), k -> new ArrayList<>()).add(row.getRoleId());
        }
        return map;
    }

    /**
     * 校验角色均存在且未软删；返回合法角色 ID 列表（去重、保序）。
     *
     * @return null 表示有非法 ID；空列表表示合法但无角色
     */
    public List<Long> filterExistingRoleIds(List<Long> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            return List.of();
        }
        List<Long> distinct = roleIds.stream()
                .filter(Objects::nonNull)
                .filter(id -> id > 0)
                .distinct()
                .toList();
        if (distinct.isEmpty()) {
            return List.of();
        }
        List<Long> found = easyEntityQuery
                .queryable(SysRole.class)
                .where(r -> r.id().in(distinct))
                .select(SysRoleProxy::id)
                .toList();
        if (found.size() != distinct.size()) {
            return null;
        }
        return distinct;
    }

    /** 角色名映射（未软删）。 */
    public Map<Long, String> findRoleNamesByIds(List<Long> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            return Map.of();
        }
        return easyEntityQuery.queryable(SysRole.class).where(r -> r.id().in(roleIds)).toList().stream()
                .collect(Collectors.toMap(SysRole::getId, SysRole::getName, (a, b) -> a, LinkedHashMap::new));
    }

    /** 角色编码是否包含 root。 */
    public boolean userHasRootRole(Long userId) {
        List<Long> roleIds = findRoleIdsByUserId(userId);
        if (roleIds.isEmpty()) {
            return false;
        }
        return easyEntityQuery
                .queryable(SysRole.class)
                .where(r -> {
                    r.id().in(roleIds);
                    r.code().eq("root");
                })
                .any();
    }

    /**
     * 全量替换用户角色：硬删旧行再插入。
     */
    public void replaceUserRoles(Long userId, List<Long> roleIds) {
        easyEntityQuery
                .deletable(SysUserRole.class)
                .where(ur -> ur.userId().eq(userId))
                .allowDeleteStatement(true)
                .executeRows();
        if (roleIds == null || roleIds.isEmpty()) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        List<SysUserRole> rows = new ArrayList<>(roleIds.size());
        for (Long roleId : roleIds) {
            SysUserRole ur = new SysUserRole();
            ur.setUserId(userId);
            ur.setRoleId(roleId);
            ur.setCreatedAt(now);
            rows.add(ur);
        }
        easyEntityQuery.insertable(rows).executeRows();
    }

    /** 清除用户全部角色绑定。 */
    public void clearUserRoles(Long userId) {
        replaceUserRoles(userId, List.of());
    }

    /**
     * 按用户角色展开启用中的 API path+method（用于 Casbin 策略同步）。
     */
    public List<ApiPolicy> findApiPoliciesByUserId(Long userId) {
        List<Long> roleIds = findRoleIdsByUserId(userId);
        if (roleIds.isEmpty()) {
            return List.of();
        }
        List<Long> apiIds = easyEntityQuery
                .queryable(SysRoleApi.class)
                .where(ra -> ra.roleId().in(roleIds))
                .select(ra -> ra.apiId())
                .distinct()
                .toList();
        if (apiIds.isEmpty()) {
            return List.of();
        }
        List<SysApi> apis = easyEntityQuery
                .queryable(SysApi.class)
                .where(a -> {
                    a.id().in(apiIds);
                    a.isEnabled().eq(1);
                })
                .toList();
        List<ApiPolicy> policies = new ArrayList<>();
        for (SysApi api : apis) {
            if (api.getPath() == null || api.getMethod() == null || api.getMethod().isBlank()) {
                continue;
            }
            policies.add(new ApiPolicy(api.getPath(), api.getMethod().toUpperCase()));
        }
        return policies;
    }
}
