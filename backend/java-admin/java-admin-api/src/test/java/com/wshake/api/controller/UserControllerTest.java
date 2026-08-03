package com.wshake.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cn.dev33.satoken.stp.StpUtil;
import com.wshake.api.dto.CreateUserRequest;
import com.wshake.api.dto.ResetPasswordRequest;
import com.wshake.api.dto.ToggleUserStatusRequest;
import com.wshake.api.dto.UpdateUserRequest;
import com.wshake.api.vo.IdOnlyVO;
import com.wshake.api.vo.UserListItemVO;
import com.wshake.common.exception.AuthException;
import com.wshake.common.result.PageData;
import com.wshake.common.result.Result;
import com.wshake.service.user.SysUserService;
import com.wshake.service.user.UserManageModels.CreateUserCommand;
import com.wshake.service.user.UserManageModels.UpdateUserCommand;
import com.wshake.service.user.UserManageModels.UserListQuery;
import com.wshake.service.user.UserManageModels.UserView;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.MockedStatic;

/**
 * {@link UserController} 行为测试（standalone）。
 *
 * <p>主 seam：HTTP 契约形状 + 未登录鉴权失败；业务细节由 SysUserService 单测覆盖。
 */
class UserControllerTest {

    private final SysUserService sysUserService = mock(SysUserService.class);
    private final UserController controller = new UserController(sysUserService);

    @Test
    void list_whenNotLogin_throwsAuthNotLogin() {
        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(false);
            assertThatThrownBy(() -> controller.list(1, 20, null, null, null, null))
                    .isInstanceOf(AuthException.class)
                    .extracting(ex -> ((AuthException) ex).getCode())
                    .isEqualTo(2001);
        }
    }

    @Test
    void list_whenLogin_returnsItemsTotal() {
        UserView view = sampleView(2L, "alice");
        when(sysUserService.pageUsers(ArgumentMatchers.any(UserListQuery.class)))
                .thenReturn(PageData.of(List.of(view), 1L));

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);

            Result<PageData<UserListItemVO>> result = controller.list(1, 20, "ali", null, 1, null);

            assertThat(result.getCode()).isEqualTo(0);
            assertThat(result.getData().getTotal()).isEqualTo(1L);
            assertThat(result.getData().getItems()).hasSize(1);
            assertThat(result.getData().getItems().get(0).getUsername()).isEqualTo("alice");
            assertThat(result.getData().getItems().get(0).getRoleIds()).containsExactly(10L);
            // 不回显密码字段：VO 无 passwordHash 属性
            assertThat(result.getData().getItems().get(0)).hasNoNullFieldsOrPropertiesExcept("languageCode", "lastLoginAt");
        }
    }

    @Test
    void create_whenLogin_mapsBodyAndReturnsUser() {
        when(sysUserService.create(ArgumentMatchers.any(CreateUserCommand.class))).thenReturn(sampleView(3L, "bob"));

        CreateUserRequest req = new CreateUserRequest();
        req.setUsername("bob");
        req.setPassword("secret");
        req.setNickname("Bob");
        req.setRoleIds(List.of(10L));

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);

            Result<UserListItemVO> result = controller.create(req);

            assertThat(result.getCode()).isEqualTo(0);
            assertThat(result.getData().getUsername()).isEqualTo("bob");
            ArgumentCaptor<CreateUserCommand> cap = ArgumentCaptor.forClass(CreateUserCommand.class);
            verify(sysUserService).create(cap.capture());
            assertThat(cap.getValue().password()).isEqualTo("secret");
            assertThat(cap.getValue().roleIds()).containsExactly(10L);
        }
    }

    @Test
    void update_whenLogin_forwardsRoleIds() {
        when(sysUserService.update(ArgumentMatchers.any(UpdateUserCommand.class))).thenReturn(sampleView(2L, "alice"));
        UpdateUserRequest req = new UpdateUserRequest();
        req.setNickname("Alice2");
        req.setRoleIds(List.of(11L));

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);

            Result<UserListItemVO> result = controller.update(2L, req);

            assertThat(result.getCode()).isEqualTo(0);
            ArgumentCaptor<UpdateUserCommand> cap = ArgumentCaptor.forClass(UpdateUserCommand.class);
            verify(sysUserService).update(cap.capture());
            assertThat(cap.getValue().id()).isEqualTo(2L);
            assertThat(cap.getValue().nickname()).isEqualTo("Alice2");
            assertThat(cap.getValue().roleIds()).containsExactly(11L);
        }
    }

    @Test
    void delete_whenNotLogin_throwsAuth() {
        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(false);
            assertThatThrownBy(() -> controller.delete(1L)).isInstanceOf(AuthException.class);
        }
    }

    @Test
    void toggleStatus_whenLogin_usesStatusField() {
        when(sysUserService.toggleStatus(ArgumentMatchers.eq(2L), ArgumentMatchers.eq(0)))
                .thenReturn(sampleView(2L, "alice"));
        ToggleUserStatusRequest req = new ToggleUserStatusRequest();
        req.setStatus(0);

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);
            Result<UserListItemVO> result = controller.toggleStatus(2L, req);
            assertThat(result.getCode()).isEqualTo(0);
            verify(sysUserService).toggleStatus(2L, 0);
        }
    }

    @Test
    void resetPassword_whenLogin_returnsIdOnly() {
        when(sysUserService.resetPassword(ArgumentMatchers.eq(2L), ArgumentMatchers.eq("new-pass")))
                .thenReturn(2L);
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setPassword("new-pass");

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);
            Result<IdOnlyVO> result = controller.resetPassword(2L, req);
            assertThat(result.getData().getId()).isEqualTo(2L);
        }
    }

    private static UserView sampleView(Long id, String username) {
        LocalDateTime now = LocalDateTime.of(2026, 1, 1, 12, 0);
        return new UserView(
                id,
                username,
                "Nick",
                "a@b.c",
                "138",
                "",
                "zh-CN",
                null,
                "",
                "",
                1,
                0L,
                now,
                now,
                List.of(10L),
                List.of("Admin"));
    }
}
