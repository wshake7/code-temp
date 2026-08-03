package com.wshake.service.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.easy.query.core.api.pagination.EasyPageResult;
import com.wshake.common.exception.BizException;
import com.wshake.common.result.PageData;
import com.wshake.service.casbin.CasbinPolicyPort;
import com.wshake.service.casbin.CasbinPolicyPort.ApiPolicy;
import com.wshake.service.entity.SysUser;
import com.wshake.service.repository.SysUserRepository;
import com.wshake.service.repository.SysUserRoleRepository;
import com.wshake.service.user.UserManageModels.CreateUserCommand;
import com.wshake.service.user.UserManageModels.UpdateUserCommand;
import com.wshake.service.user.UserManageModels.UserListQuery;
import com.wshake.service.user.UserManageModels.UserView;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * {@link SysUserService} 业务行为：密码哈希、角色校验、Casbin 同步触发。
 */
class SysUserServiceTest {

    private final SysUserRepository userRepo = mock(SysUserRepository.class);
    private final SysUserRoleRepository roleRepo = mock(SysUserRoleRepository.class);
    private final CasbinPolicyPort casbin = mock(CasbinPolicyPort.class);
    private SysUserService service;

    @BeforeEach
    void setUp() {
        service = new SysUserService(userRepo, roleRepo, casbin);
    }

    @Test
    void create_encodesPasswordAndSyncsCasbin() {
        when(userRepo.existsByUsername("alice")).thenReturn(false);
        when(roleRepo.filterExistingRoleIds(List.of(10L))).thenReturn(List.of(10L));
        doAnswer(inv -> {
                    SysUser u = inv.getArgument(0);
                    u.setId(100L);
                    return null;
                })
                .when(userRepo)
                .insert(any(SysUser.class));
        when(roleRepo.userHasRootRole(100L)).thenReturn(false);
        when(roleRepo.findApiPoliciesByUserId(100L))
                .thenReturn(List.of(new ApiPolicy("/api/system/user/list", "GET")));
        when(userRepo.findById(100L)).thenReturn(user(100L, "alice", "$2a$10$hashed"));
        when(roleRepo.findRoleIdsByUserId(100L)).thenReturn(List.of(10L));
        when(roleRepo.findRoleNamesByIds(List.of(10L))).thenReturn(Map.of(10L, "Admin"));

        UserView view = service.create(new CreateUserCommand(
                "alice", "plain-secret", "Alice", null, null, null, null, 1, null, List.of(10L)));

        assertThat(view.id()).isEqualTo(100L);
        assertThat(view.username()).isEqualTo("alice");
        ArgumentCaptor<SysUser> cap = ArgumentCaptor.forClass(SysUser.class);
        verify(userRepo).insert(cap.capture());
        assertThat(cap.getValue().getPasswordHash()).isNotEqualTo("plain-secret");
        assertThat(new BCryptPasswordEncoder().matches("plain-secret", cap.getValue().getPasswordHash()))
                .isTrue();
        verify(roleRepo).replaceUserRoles(100L, List.of(10L));
        verify(casbin)
                .replaceUserPolicies(
                        eq("100"),
                        eq(List.of(new ApiPolicy("/api/system/user/list", "GET"))),
                        eq(false));
    }

    @Test
    void create_duplicateUsername_throws() {
        when(userRepo.existsByUsername("alice")).thenReturn(true);
        assertThatThrownBy(() -> service.create(new CreateUserCommand(
                        "alice", "x", "A", null, null, null, null, 1, null, List.of())))
                .isInstanceOf(BizException.class)
                .hasMessageContaining("已存在");
        verify(userRepo, never()).insert(any());
    }

    @Test
    void update_withoutRoleIds_doesNotSyncCasbin() {
        when(userRepo.findById(2L)).thenReturn(user(2L, "alice", "hash"));
        when(userRepo.update(any())).thenReturn(1L);
        when(roleRepo.findRoleIdsByUserId(2L)).thenReturn(List.of(10L));
        when(roleRepo.findRoleNamesByIds(List.of(10L))).thenReturn(Map.of(10L, "Admin"));

        service.update(new UpdateUserCommand(2L, "Alice2", null, null, null, null, null, null, null));

        verify(roleRepo, never()).replaceUserRoles(any(), anyList());
        verify(casbin, never()).replaceUserPolicies(anyString(), anyList(), anyBoolean());
    }

    @Test
    void update_withRoleIds_replacesAndSyncs_rootKeepsWildcard() {
        when(userRepo.findById(1L)).thenReturn(user(1L, "root", "hash"));
        when(userRepo.update(any())).thenReturn(1L);
        when(roleRepo.filterExistingRoleIds(List.of(1L))).thenReturn(List.of(1L));
        when(roleRepo.userHasRootRole(1L)).thenReturn(true);
        when(roleRepo.findRoleIdsByUserId(1L)).thenReturn(List.of(1L));
        when(roleRepo.findRoleNamesByIds(List.of(1L))).thenReturn(Map.of(1L, "Root"));

        service.update(new UpdateUserCommand(1L, null, null, null, null, null, null, null, List.of(1L)));

        verify(roleRepo).replaceUserRoles(1L, List.of(1L));
        verify(casbin).replaceUserPolicies(eq("1"), eq(List.of()), eq(true));
        verify(roleRepo, never()).findApiPoliciesByUserId(any());
    }

    @Test
    void softDelete_clearsRolesAndCasbin() {
        when(userRepo.findById(2L)).thenReturn(user(2L, "alice", "hash"));
        when(roleRepo.findRoleIdsByUserId(2L)).thenReturn(List.of(10L));
        when(roleRepo.findRoleNamesByIds(List.of(10L))).thenReturn(Map.of(10L, "Admin"));
        when(userRepo.softDeleteById(2L)).thenReturn(1L);

        UserView view = service.softDelete(2L);

        assertThat(view.username()).isEqualTo("alice");
        verify(roleRepo).clearUserRoles(2L);
        verify(casbin).replaceUserPolicies("2", List.of(), false);
        verify(userRepo).softDeleteById(2L);
    }

    @Test
    void resetPassword_encodesAndDoesNotReturnHash() {
        when(userRepo.findById(2L)).thenReturn(user(2L, "alice", "old"));
        when(userRepo.updatePasswordHash(eq(2L), anyString())).thenReturn(1L);

        Long id = service.resetPassword(2L, "new-pass");
        assertThat(id).isEqualTo(2L);

        ArgumentCaptor<String> hashCap = ArgumentCaptor.forClass(String.class);
        verify(userRepo).updatePasswordHash(eq(2L), hashCap.capture());
        assertThat(hashCap.getValue()).isNotEqualTo("new-pass");
        assertThat(new BCryptPasswordEncoder().matches("new-pass", hashCap.getValue())).isTrue();
    }

    @Test
    void pageUsers_mapsRoleNames() {
        SysUser u = user(2L, "alice", "hash");
        EasyPageResult<SysUser> page = new EasyPageResult<>() {
            @Override
            public List<SysUser> getData() {
                return List.of(u);
            }

            @Override
            public long getTotal() {
                return 1L;
            }
        };
        when(userRepo.page(any(UserListQuery.class))).thenReturn(page);
        when(roleRepo.findRoleIdsByUserIds(List.of(2L))).thenReturn(Map.of(2L, List.of(10L)));
        when(roleRepo.findRoleNamesByIds(List.of(10L))).thenReturn(Map.of(10L, "Admin"));

        PageData<UserView> result = service.pageUsers(UserListQuery.of(1, 20, null, null, null, null));

        assertThat(result.getTotal()).isEqualTo(1L);
        assertThat(result.getItems().get(0).roleNames()).containsExactly("Admin");
        assertThat(result.getItems().get(0).roleIds()).containsExactly(10L);
    }

    @Test
    void toggleStatus_invalid_throws() {
        assertThatThrownBy(() -> service.toggleStatus(1L, 2)).isInstanceOf(BizException.class);
    }

    private static SysUser user(Long id, String username, String hash) {
        SysUser u = new SysUser();
        u.setId(id);
        u.setUsername(username);
        u.setPasswordHash(hash);
        u.setNickname("Nick");
        u.setEmail("");
        u.setPhone("");
        u.setAvatar("");
        u.setLastLoginIp("");
        u.setRemark("");
        u.setIsEnabled(1);
        u.setDeletedAt(0L);
        return u;
    }
}
