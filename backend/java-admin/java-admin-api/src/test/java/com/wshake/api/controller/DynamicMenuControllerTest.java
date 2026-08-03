package com.wshake.api.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import cn.dev33.satoken.stp.StpUtil;
import com.wshake.api.vo.RuntimeMenuRouteVO;
import com.wshake.common.exception.AuthException;
import com.wshake.common.result.Result;
import com.wshake.service.menu.MenuManageModels.RuntimeMenuRoute;
import com.wshake.service.menu.SysMenuService;
import io.github.linpeilie.Converter;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

/**
 * {@link DynamicMenuController} 动态路由契约测试。
 */
class DynamicMenuControllerTest {

    private final SysMenuService sysMenuService = mock(SysMenuService.class);
    private final Converter converter = new Converter();
    private final DynamicMenuController controller = new DynamicMenuController(sysMenuService, converter);

    @Test
    void all_whenNotLogin_throws() {
        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(false);
            assertThatThrownBy(controller::all).isInstanceOf(AuthException.class);
        }
    }

    @Test
    void all_whenLogin_returnsRoutesForUser() {
        when(sysMenuService.listRuntimeMenusForUser(7L))
                .thenReturn(List.of(new RuntimeMenuRoute(
                        "System", "/system", null, "/system/user", Map.of("title", "系统"), List.of())));

        try (MockedStatic<StpUtil> stp = mockStatic(StpUtil.class)) {
            stp.when(StpUtil::isLogin).thenReturn(true);
            stp.when(StpUtil::getLoginId).thenReturn(7L);

            Result<List<RuntimeMenuRouteVO>> result = controller.all();
            assertThat(result.getCode()).isEqualTo(0);
            assertThat(result.getData()).hasSize(1);
            assertThat(result.getData().get(0).getPath()).isEqualTo("/system");
            assertThat(result.getData().get(0).getMeta()).containsEntry("title", "系统");
        }
    }
}
