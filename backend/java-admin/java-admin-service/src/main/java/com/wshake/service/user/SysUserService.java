package com.wshake.service.user;

import com.easy.query.core.api.pagination.EasyPageResult;
import com.wshake.common.exception.BizException;
import com.wshake.common.result.PageData;
import com.wshake.common.result.ResultCode;
import com.wshake.service.casbin.CasbinPolicyPort;
import com.wshake.service.casbin.CasbinPolicyPort.ApiPolicy;
import com.wshake.service.entity.SysUser;
import com.wshake.service.repository.SysUserRepository;
import com.wshake.service.repository.SysUserRoleRepository;
import com.wshake.service.user.UserManageModels.CreateUserCommand;
import com.wshake.service.user.UserManageModels.UpdateUserCommand;
import com.wshake.service.user.UserManageModels.UserListQuery;
import com.wshake.service.user.UserManageModels.UserView;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 系统用户 Service：分页查询、CRUD/软删、启停、重置密码、角色分配与 Casbin 同步。
 *
 * @author wshake
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SysUserService {

    private static final BCryptPasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();

    private final SysUserRepository sysUserRepository;
    private final SysUserRoleRepository sysUserRoleRepository;
    private final CasbinPolicyPort casbinPolicyPort;

    /** 根据主键查询用户；找不到返回 {@code null}。 */
    public SysUser findById(Long id) {
        return sysUserRepository.findById(id);
    }

    /** 根据用户名查询用户；找不到返回 {@code null}。 */
    public SysUser findByUsername(String username) {
        return sysUserRepository.findByUsername(username);
    }

    /**
     * 分页列表（含 roleIds / roleNames；不回显 passwordHash）。
     */
    public PageData<UserView> pageUsers(UserListQuery query) {
        EasyPageResult<SysUser> page = sysUserRepository.page(query);
        List<SysUser> rows = page.getData() == null ? List.of() : page.getData();
        List<Long> userIds = rows.stream().map(SysUser::getId).toList();
        Map<Long, List<Long>> roleMap = sysUserRoleRepository.findRoleIdsByUserIds(userIds);
        List<Long> allRoleIds = roleMap.values().stream().flatMap(List::stream).distinct().toList();
        Map<Long, String> roleNames = sysUserRoleRepository.findRoleNamesByIds(allRoleIds);

        List<UserView> items = new ArrayList<>(rows.size());
        for (SysUser u : rows) {
            List<Long> roleIds = roleMap.getOrDefault(u.getId(), List.of());
            items.add(toView(u, roleIds, roleNames));
        }
        return PageData.of(items, page.getTotal());
    }

    /**
     * 创建用户；密码 BCrypt 存储；写 sys_user_role 并同步 Casbin。
     */
    public UserView create(CreateUserCommand cmd) {
        String username = requireNonBlank(cmd.username(), "username");
        String password = requireNonBlank(cmd.password(), "password");
        String nickname = requireNonBlank(cmd.nickname(), "nickname");
        if (sysUserRepository.existsByUsername(username)) {
            throw BizException.of(ResultCode.PARAM_INVALID, "用户名 " + username + " 已存在");
        }
        List<Long> roleIds = validateRoleIds(cmd.roleIds());

        SysUser user = new SysUser();
        user.setUsername(username);
        user.setPasswordHash(PASSWORD_ENCODER.encode(password));
        user.setNickname(nickname);
        user.setEmail(nullToEmpty(cmd.email()));
        user.setPhone(nullToEmpty(cmd.phone()));
        user.setAvatar(nullToEmpty(cmd.avatar()));
        user.setLanguageCode(blankToNull(cmd.languageCode()));
        user.setLastLoginIp("");
        user.setRemark(nullToEmpty(cmd.remark()));
        user.setIsEnabled(cmd.isEnabled() == null ? 1 : (cmd.isEnabled() == 0 ? 0 : 1));

        sysUserRepository.insert(user);
        sysUserRoleRepository.replaceUserRoles(user.getId(), roleIds);
        syncCasbinForUser(user.getId());

        return loadView(user.getId());
    }

    /**
     * 更新用户基本信息；若提供 roleIds 则替换并同步 Casbin。
     * username/password 不可通过本接口修改。
     */
    public UserView update(UpdateUserCommand cmd) {
        SysUser user = requireUser(cmd.id());
        if (cmd.nickname() != null) {
            String nickname = cmd.nickname().trim();
            if (nickname.isEmpty()) {
                throw BizException.of(ResultCode.PARAM_INVALID, "nickname 不能为空");
            }
            user.setNickname(nickname);
        }
        if (cmd.email() != null) {
            user.setEmail(cmd.email().trim());
        }
        if (cmd.phone() != null) {
            user.setPhone(cmd.phone().trim());
        }
        if (cmd.avatar() != null) {
            user.setAvatar(cmd.avatar().trim());
        }
        if (cmd.languageCode() != null) {
            user.setLanguageCode(blankToNull(cmd.languageCode()));
        }
        if (cmd.isEnabled() != null) {
            user.setIsEnabled(cmd.isEnabled() == 0 ? 0 : 1);
        }
        if (cmd.remark() != null) {
            user.setRemark(cmd.remark().trim());
        }
        sysUserRepository.update(user);

        if (cmd.roleIds() != null) {
            List<Long> roleIds = validateRoleIds(cmd.roleIds());
            sysUserRoleRepository.replaceUserRoles(user.getId(), roleIds);
            syncCasbinForUser(user.getId());
        }
        return loadView(user.getId());
    }

    /**
     * 软删用户；清空 sys_user_role 与该用户 Casbin 策略。
     */
    public UserView softDelete(Long id) {
        SysUser user = requireUser(id);
        List<Long> roleIds = sysUserRoleRepository.findRoleIdsByUserId(id);
        Map<Long, String> roleNameMap = sysUserRoleRepository.findRoleNamesByIds(roleIds);

        sysUserRoleRepository.clearUserRoles(id);
        casbinPolicyPort.replaceUserPolicies(String.valueOf(id), List.of(), false);
        long rows = sysUserRepository.softDeleteById(id);
        if (rows == 0) {
            throw BizException.of(ResultCode.PARAM_INVALID, "用户 " + id + " 不存在");
        }
        // 逻辑删除时间由 EQ 写入；响应快照使用当前毫秒，避免仍回 0
        long deletedAt = System.currentTimeMillis();
        user.setDeletedAt(deletedAt);
        return toView(user, roleIds, roleNameMap);
    }

    /**
     * 启停账号：status 0|1。
     */
    public UserView toggleStatus(Long id, int status) {
        if (status != 0 && status != 1) {
            throw BizException.of(ResultCode.PARAM_INVALID, "status 必须为 0 或 1");
        }
        requireUser(id);
        long rows = sysUserRepository.updateIsEnabled(id, status);
        if (rows == 0) {
            throw BizException.of(ResultCode.PARAM_INVALID, "用户 " + id + " 不存在");
        }
        return loadView(id);
    }

    /**
     * 重置密码（BCrypt）；不回显 hash。
     */
    public Long resetPassword(Long id, String password) {
        String pwd = requireNonBlank(password, "password");
        requireUser(id);
        long rows = sysUserRepository.updatePasswordHash(id, PASSWORD_ENCODER.encode(pwd));
        if (rows == 0) {
            throw BizException.of(ResultCode.PARAM_INVALID, "用户 " + id + " 不存在");
        }
        return id;
    }

    /**
     * 按用户角色重算 Casbin p 策略；拥有 root 角色时保留通配。
     */
    public void syncCasbinForUser(Long userId) {
        boolean keepWildcard = sysUserRoleRepository.userHasRootRole(userId);
        List<ApiPolicy> policies =
                keepWildcard ? List.of() : sysUserRoleRepository.findApiPoliciesByUserId(userId);
        casbinPolicyPort.replaceUserPolicies(String.valueOf(userId), policies, keepWildcard);
        log.info(
                "[USER] casbin synced userId={} keepWildcard={} policyCount={}",
                userId,
                keepWildcard,
                policies.size());
    }

    private UserView loadView(Long userId) {
        SysUser user = requireUser(userId);
        List<Long> roleIds = sysUserRoleRepository.findRoleIdsByUserId(userId);
        Map<Long, String> roleNames = sysUserRoleRepository.findRoleNamesByIds(roleIds);
        return toView(user, roleIds, roleNames);
    }

    private SysUser requireUser(Long id) {
        if (id == null) {
            throw BizException.of(ResultCode.PARAM_INVALID, "id 不能为空");
        }
        SysUser user = sysUserRepository.findById(id);
        if (user == null) {
            throw BizException.of(ResultCode.PARAM_INVALID, "用户 " + id + " 不存在");
        }
        return user;
    }

    private List<Long> validateRoleIds(List<Long> roleIds) {
        List<Long> filtered = sysUserRoleRepository.filterExistingRoleIds(roleIds);
        if (filtered == null) {
            throw BizException.of(ResultCode.PARAM_INVALID, "角色不存在");
        }
        return filtered;
    }

    private static UserView toView(SysUser u, List<Long> roleIds, Map<Long, String> roleNameMap) {
        List<Long> ids = roleIds == null ? List.of() : List.copyOf(roleIds);
        List<String> names = new ArrayList<>();
        for (Long rid : ids) {
            String name = roleNameMap.get(rid);
            if (name != null && !name.isBlank()) {
                names.add(name);
            }
        }
        return new UserView(
                u.getId(),
                u.getUsername(),
                u.getNickname(),
                nullToEmpty(u.getEmail()),
                nullToEmpty(u.getPhone()),
                nullToEmpty(u.getAvatar()),
                u.getLanguageCode(),
                u.getLastLoginAt(),
                nullToEmpty(u.getLastLoginIp()),
                nullToEmpty(u.getRemark()),
                u.getIsEnabled() == null ? 0 : u.getIsEnabled(),
                u.getDeletedAt() == null ? 0L : u.getDeletedAt(),
                u.getCreatedAt(),
                u.getUpdatedAt(),
                ids,
                names);
    }

    private static String requireNonBlank(String value, String field) {
        if (value == null || value.trim().isEmpty()) {
            throw BizException.of(ResultCode.PARAM_INVALID, field + " 不能为空");
        }
        return value.trim();
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    private static String blankToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
