package com.wshake.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cn.dev33.satoken.stp.StpUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.wshake.api.dto.CreateMenuRequest;
import com.wshake.api.dto.MenuApiBindRequest;
import com.wshake.api.dto.MenuBatchRequest;
import com.wshake.api.vo.MenuApiBindResultVO;
import com.wshake.api.vo.MenuBatchResultVO;
import com.wshake.api.vo.MenuListItemVO;
import com.wshake.common.exception.AuthException;
import com.wshake.common.result.Result;
import com.wshake.common.result.TreePageData;
import com.wshake.service.menu.MenuManageModels.CreateMenuCommand;
import com.wshake.service.menu.MenuManageModels.MenuApiBindResult;
import com.wshake.service.menu.MenuManageModels.MenuBatchResult;
import com.wshake.service.menu.MenuManageModels.MenuListPage;
import com.wshake.service.menu.MenuManageModels.MenuListQuery;
import com.wshake.service.menu.MenuManageModels.MenuView;
import com.wshake.service.menu.SysMenuService;
import io.github.linpeilie.Converter;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.MockedStatic;

/**
 * {@link MenuController} 契约与鉴权测试。
 */
class MenuControllerTest {

    private final SysMenuService sysMenuService = mock(SysMenuService.class);
    private final Converter converter = new Converter();
    private final MenuController controller = new MenuController(sysMenuService, converter);
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void list_whenNotLogin_throwsAuth() {
        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(false);
            assertThatThrownBy(() -> controller.list(1, 20, null, null, null, null))
                    .isInstanceOf(AuthException.class);
        }
    }

    @Test
    void list_whenLogin_returnsTreePage() {
        when(sysMenuService.pageMenus(ArgumentMatchers.any(MenuListQuery.class)))
                .thenReturn(new MenuListPage(List.of(sampleView(1L, "系统")), 1L, 3L));

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);
            Result<TreePageData<MenuListItemVO>> result = controller.list(1, 20, null, null, null, null);
            assertThat(result.getCode()).isEqualTo(0);
            assertThat(result.getData().getTotal()).isEqualTo(1L);
            assertThat(result.getData().getItemTotal()).isEqualTo(3L);
            assertThat(result.getData().getItems().get(0).getName()).isEqualTo("系统");
        }
    }

    @Test
    void create_whenLogin_mapsBody() {
        when(sysMenuService.create(ArgumentMatchers.any(CreateMenuCommand.class)))
                .thenReturn(sampleView(10L, "用户"));
        CreateMenuRequest req = new CreateMenuRequest();
        req.setName("用户");
        req.setType("MENU");
        req.setPath("/system/user");

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);
            Result<MenuListItemVO> result = controller.create(req);
            assertThat(result.getCode()).isEqualTo(0);
            ArgumentCaptor<CreateMenuCommand> cap = ArgumentCaptor.forClass(CreateMenuCommand.class);
            verify(sysMenuService).create(cap.capture());
            assertThat(cap.getValue().path()).isEqualTo("/system/user");
        }
    }

    @Test
    void update_parentIdNull_present() {
        when(sysMenuService.update(ArgumentMatchers.any())).thenReturn(sampleView(2L, "X"));
        ObjectNode body = mapper.createObjectNode();
        body.putNull("parentId");
        body.put("name", "X");

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);
            Result<MenuListItemVO> result = controller.update(2L, body);
            assertThat(result.getCode()).isEqualTo(0);
            ArgumentCaptor<com.wshake.service.menu.MenuManageModels.UpdateMenuCommand> cap =
                    ArgumentCaptor.forClass(com.wshake.service.menu.MenuManageModels.UpdateMenuCommand.class);
            verify(sysMenuService).update(cap.capture());
            assertThat(cap.getValue().parentId().present()).isTrue();
            assertThat(cap.getValue().parentId().value()).isNull();
        }
    }

    @Test
    void batch_whenLogin_returnsAffected() {
        when(sysMenuService.batch(ArgumentMatchers.any()))
                .thenReturn(new MenuBatchResult("enable", 2, List.of(1L, 2L)));
        MenuBatchRequest req = new MenuBatchRequest();
        req.setAction("enable");
        req.setIds(List.of(1L, 2L));

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);
            Result<MenuBatchResultVO> result = controller.batch(req);
            assertThat(result.getData().getAffected()).isEqualTo(2);
        }
    }

    @Test
    void setMenuApis_whenLogin_returnsIds() {
        when(sysMenuService.setMenuApis(ArgumentMatchers.eq(5L), ArgumentMatchers.anyList()))
                .thenReturn(new MenuApiBindResult(5L, List.of(9L)));
        MenuApiBindRequest req = new MenuApiBindRequest();
        req.setApiIds(List.of(9L));

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);
            Result<MenuApiBindResultVO> result = controller.setMenuApis(5L, req);
            assertThat(result.getData().getMenuId()).isEqualTo(5L);
            assertThat(result.getData().getApiIds()).isEqualTo(List.of(9L));
        }
    }

    @Test
    void nameExists_whenLogin_returnsBoolean() {
        when(sysMenuService.nameExists("dup", null)).thenReturn(true);
        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);
            assertThat(controller.nameExists("dup", null).getData()).isTrue();
        }
    }

    private static MenuView sampleView(Long id, String name) {
        LocalDateTime now = LocalDateTime.of(2026, 1, 1, 0, 0);
        return new MenuView(
                id,
                null,
                name,
                "DIR",
                null,
                null,
                "",
                "",
                null,
                "/" + id + "/",
                null,
                0,
                0,
                1,
                0L,
                "",
                now,
                now,
                0L,
                0L);
    }
}
