package com.wshake.service.user;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户管理领域模型（service 层，不绑 HTTP 注解）。
 *
 * @author wshake
 */
public final class UserManageModels {

    private UserManageModels() {}

    /** 列表筛选条件。 */
    public record UserListQuery(
            int page, int pageSize, String username, String nickname, Integer status, Long roleId) {

        public static UserListQuery of(
                Integer page, Integer pageSize, String username, String nickname, Integer status, Long roleId) {
            int p = page == null || page < 1 ? 1 : page;
            int ps = pageSize == null || pageSize < 1 ? 20 : Math.min(pageSize, 200);
            return new UserListQuery(p, ps, trimToNull(username), trimToNull(nickname), status, roleId);
        }

        private static String trimToNull(String s) {
            if (s == null) {
                return null;
            }
            String t = s.trim();
            return t.isEmpty() ? null : t;
        }
    }

    /** 创建命令。 */
    public record CreateUserCommand(
            String username,
            String password,
            String nickname,
            String email,
            String phone,
            String avatar,
            String languageCode,
            Integer isEnabled,
            String remark,
            List<Long> roleIds) {}

    /** 更新命令（username/password 不可改）。 */
    public record UpdateUserCommand(
            Long id,
            String nickname,
            String email,
            String phone,
            String avatar,
            String languageCode,
            Integer isEnabled,
            String remark,
            /** null=不改角色；非 null（可为空列表）=全量替换。 */
            List<Long> roleIds) {}

    /** 对外用户视图（无 passwordHash）。 */
    public record UserView(
            Long id,
            String username,
            String nickname,
            String email,
            String phone,
            String avatar,
            String languageCode,
            LocalDateTime lastLoginAt,
            String lastLoginIp,
            String remark,
            Integer isEnabled,
            Long deletedAt,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            List<Long> roleIds,
            List<String> roleNames) {}
}
