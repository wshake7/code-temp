package com.wshake.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import com.wshake.service.role.RoleManageModels.RoleApiBindResult;
import com.wshake.service.role.RoleManageModels.RoleApiBindView;
import com.wshake.service.role.RoleManageModels.RoleListQuery;
import com.wshake.service.role.RoleManageModels.RoleMenuBindResult;
import com.wshake.service.role.RoleManageModels.RoleMenuBindView;
import com.wshake.service.role.RoleManageModels.RoleView;
import com.wshake.service.role.RoleManageModels.UpdateRoleCommand;
import com.wshake.service.role.SysRoleService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.MockedStatic;

/**
 * {@link RoleController} 契约：鉴权失败 + Result 形状。
 */
class RoleControllerTest {

    private final SysRoleService sysRoleService = mock(SysRoleService.class);
    private final RoleController controller = new RoleController(sysRoleService);

    @Test
    void list_whenNotLogin_throwsAuthNotLogin() {
        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(false);
            assertThatThrownBy(() -> controller.list(1, 20, null, null, null))
                    .isInstanceOf(AuthException.class)
                    .extracting(ex -> ((AuthException) ex).getCode())
                    .isEqualTo(2001);
        }
    }

    @Test
    void list_whenLogin_returnsItemsTotal() {
        when(sysRoleService.pageRoles(ArgumentMatchers.any(RoleListQuery.class)))
                .thenReturn(PageData.of(List.of(sampleRole(1L, "root")), 1L));

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);

            Result<PageData<RoleListItemVO>> result = controller.list(1, 20, "ro", null, 1);

            assertThat(result.getCode()).isEqualTo(0);
            assertThat(result.getData().getTotal()).isEqualTo(1L);
            assertThat(result.getData().getItems()).hasSize(1);
            assertThat(result.getData().getItems().get(0).getCode()).isEqualTo("root");
            assertThat(result.getData().getItems().get(0).getUserCount()).isEqualTo(1L);
        }
    }

    @Test
    void create_whenLogin_mapsBody() {
        when(sysRoleService.create(ArgumentMatchers.any(CreateRoleCommand.class)))
                .thenReturn(sampleRole(10L, "ops"));
        CreateRoleRequest req = new CreateRoleRequest();
        req.setCode("ops");
        req.setName("运维");
        req.setSort(1);

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);

            Result<RoleListItemVO> result = controller.create(req);

            assertThat(result.getCode()).isEqualTo(0);
            assertThat(result.getData().getCode()).isEqualTo("ops");
            ArgumentCaptor<CreateRoleCommand> cap = ArgumentCaptor.forClass(CreateRoleCommand.class);
            verify(sysRoleService).create(cap.capture());
            assertThat(cap.getValue().code()).isEqualTo("ops");
            assertThat(cap.getValue().name()).isEqualTo("运维");
        }
    }

    @Test
    void update_whenParentIdOmitted_usesAbsent() {
        when(sysRoleService.update(ArgumentMatchers.any(UpdateRoleCommand.class)))
                .thenReturn(sampleRole(2L, "ops"));
        UpdateRoleRequest req = new UpdateRoleRequest();
        req.setName("运维2");
        // 不调用 setParentId → parentIdPresent=false

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);

            controller.update(2L, req);

            ArgumentCaptor<UpdateRoleCommand> cap = ArgumentCaptor.forClass(UpdateRoleCommand.class);
            verify(sysRoleService).update(cap.capture());
            assertThat(cap.getValue().parentId().present()).isFalse();
            assertThat(cap.getValue().name()).isEqualTo("运维2");
        }
    }

    @Test
    void update_whenParentIdExplicitNull_usesPresentNull() {
        when(sysRoleService.update(ArgumentMatchers.any(UpdateRoleCommand.class)))
                .thenReturn(sampleRole(2L, "ops"));
        UpdateRoleRequest req = new UpdateRoleRequest();
        req.setParentId(null);

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);

            controller.update(2L, req);

            ArgumentCaptor<UpdateRoleCommand> cap = ArgumentCaptor.forClass(UpdateRoleCommand.class);
            verify(sysRoleService).update(cap.capture());
            assertThat(cap.getValue().parentId().present()).isTrue();
            assertThat(cap.getValue().parentId().value()).isNull();
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
    void setApis_whenLogin_returnsRoleIdAndApiIds() {
        when(sysRoleService.replaceApis(ArgumentMatchers.eq(2L), ArgumentMatchers.eq(List.of(10L, 11L))))
                .thenReturn(new RoleApiBindResult(2L, List.of(10L, 11L)));
        RoleApiBindRequest req = new RoleApiBindRequest();
        req.setApiIds(List.of(10L, 11L));

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);

            Result<RoleApiBindResultVO> result = controller.setApis(2L, req);

            assertThat(result.getCode()).isEqualTo(0);
            assertThat(result.getData().getRoleId()).isEqualTo(2L);
            assertThat(result.getData().getApiIds()).isEqualTo(List.of(10L, 11L));
        }
    }

    @Test
    void setMenus_whenLogin_returnsRoleIdAndMenuIds() {
        when(sysRoleService.replaceMenus(ArgumentMatchers.eq(2L), ArgumentMatchers.eq(List.of(1L))))
                .thenReturn(new RoleMenuBindResult(2L, List.of(1L)));
        RoleMenuBindRequest req = new RoleMenuBindRequest();
        req.setMenuIds(List.of(1L));

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);

            Result<RoleMenuBindResultVO> result = controller.setMenus(2L, req);

            assertThat(result.getCode()).isEqualTo(0);
            assertThat(result.getData().getRoleId()).isEqualTo(2L);
        }
    }

    @Test
    void menus_whenLogin_mapsBoundFlag() {
        when(sysRoleService.listMenuBinds(2L))
                .thenReturn(List.of(new RoleMenuBindView(
                        1L,
                        null,
                        "系统",
                        "DIR",
                        "/system",
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        0,
                        0,
                        1,
                        "",
                        0L,
                        LocalDateTime.of(2026, 1, 1, 0, 0),
                        LocalDateTime.of(2026, 1, 1, 0, 0),
                        true)));

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);

            Result<List<RoleMenuBindItemVO>> result = controller.menus(2L);

            assertThat(result.getData()).hasSize(1);
            assertThat(result.getData().get(0).isBound()).isTrue();
            assertThat(result.getData().get(0).getName()).isEqualTo("系统");
        }
    }

    @Test
    void apis_whenLogin_mapsBoundFlag() {
        when(sysRoleService.listApiBinds(2L))
                .thenReturn(List.of(new RoleApiBindView(
                        10L, "List", "GET", "/api/x", "p", "g", 1, false)));

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);

            Result<List<RoleApiBindItemVO>> result = controller.apis(2L);

            assertThat(result.getData().get(0).isBound()).isFalse();
            assertThat(result.getData().get(0).getMethod()).isEqualTo("GET");
        }
    }

    private static RoleView sampleRole(Long id, String code) {
        LocalDateTime now = LocalDateTime.of(2026, 1, 1, 12, 0);
        return new RoleView(
                id, code, "Name", null, 0, "", 1, 0L, now, now, 0L, 0L, 1L, null);
    }
}
