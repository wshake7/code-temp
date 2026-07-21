import {
  createBrowserRouter,
  type RouteObject,
  type RouterProviderProps,
} from 'react-router-dom';
import { injectRedirects } from './utils/inject-redirect';
import { sortRoutes } from './utils/sort-routes';
import { transformRoutesWithHandle } from './utils/transform-meta-to-handle';
import type { GenerateMenuAndRoutesOptions, AppRoute, AppRouteObject } from './types';
import { generateRoutesByBackend, generateRoutesByFrontend } from '@/core/router/generators';
import type { AccessModeType } from '@/core/preferences';
import React from 'react';

/**
 * 从路由列表中分离出：
 * - layoutRoutes: 包含 MainLayout/AuthGuard 的根路由（path='/'）
 * - staticRoutes: 不受 AuthGuard 保护的静态路由（auth/login/error 等）
 */
function separateRoutes(routes: AppRouteObject[]) {
  const layoutRoutes: AppRouteObject[] = []; // path='/' 的布局路由
  const otherRoutes: AppRouteObject[] = []; // 其他静态路由（auth/error等）

  for (const route of routes) {
    if (route.path === '/' && route.children) {
      layoutRoutes.push(route);
    } else {
      otherRoutes.push(route);
    }
  }

  return { layoutRoutes, otherRoutes };
}

export interface AccessibleRouterResult {
  router: RouterProviderProps['router'];
  /** Routes used to build the sidebar (layout children / backend tree). */
  menuRoutes: AppRouteObject[];
}

export const createAccessibleRouter = async (
  mode: AccessModeType,
  options: GenerateMenuAndRoutesOptions,
): Promise<AccessibleRouterResult> => {
  let routes: AppRouteObject[] = [...options.routes];
  let menuRoutes: AppRouteObject[];

  // 根据模式生成路由
  switch (mode) {
    case 'backend': {
      // 后端模式：从 API 获取业务路由树，挂到静态 MainLayout 下
      if (!options.fetchMenuListAsync) {
        console.warn(
          '[Router] Backend mode requires fetchMenuListAsync, falling back to frontend mode',
        );
        routes = await generateRoutesByFrontend(
          routes,
          options.permissions ?? [],
          options.forbiddenElement,
        );
        menuRoutes =
          routes.find((route) => route.path === '/' && route.children)?.children ?? [];
      } else {
        const { layoutRoutes, otherRoutes } = separateRoutes(routes);
        const backendRoutes = await generateRoutesByBackend({
          staticRoutes: layoutRoutes,
          mode,
          fetchMenuListAsync: options.fetchMenuListAsync,
          layoutMap: options.layoutMap,
          pageMap: options.pageMap,
        });

        const layout = layoutRoutes[0];
        if (layout) {
          // Keep static index redirect children; append backend business tree.
          const staticChildren = (layout.children ?? []).filter(
            (child) => child.index || child.path === '/' || !child.path,
          );
          routes = [
            {
              ...layout,
              children: [...staticChildren, ...backendRoutes],
            },
            ...otherRoutes,
          ];
          menuRoutes = backendRoutes;
        } else {
          // No layout shell — fall back to previous behavior.
          routes = [...backendRoutes, ...otherRoutes];
          menuRoutes = backendRoutes;
        }
      }
      break;
    }
    case 'frontend':
    default: {
      // 前端模式：基于静态路由 + 权限过滤
      routes = await generateRoutesByFrontend(
        routes,
        options.permissions ?? [],
        options.forbiddenElement,
      );
      menuRoutes =
        routes.find((route) => route.path === '/' && route.children)?.children ?? [];
      break;
    }
  }

  if (options.autoInjectRedirect !== false)
    routes = injectRedirects(routes as unknown as AppRoute[]) as unknown as AppRouteObject[];
  if (options.autoSort !== false)
    routes = sortRoutes(routes as unknown as AppRoute[]) as unknown as AppRouteObject[];

  // 将 meta 转换为 handle，使 useMatches() 能获取路由元数据
  routes = transformRoutesWithHandle(routes);

  // Keep menuRoutes in sync with post-process on the same tree nodes where possible.
  // Sidebar only needs meta/path/name/children — handle transform is optional.
  if (options.autoInjectRedirect !== false) {
    menuRoutes = injectRedirects(
      menuRoutes as unknown as AppRoute[],
    ) as unknown as AppRouteObject[];
  }
  if (options.autoSort !== false) {
    menuRoutes = sortRoutes(menuRoutes as unknown as AppRoute[]) as unknown as AppRouteObject[];
  }
  menuRoutes = transformRoutesWithHandle(menuRoutes);

  return {
    router: createBrowserRouter(routes as RouteObject[], {
      future: {
        v7_relativeSplatPath: true,
      },
    }),
    menuRoutes,
  };
};

/**
 * 根据模式生成路由
 */
export async function generateRoutes(
  mode: AccessModeType,
  options: {
    routes: AppRouteObject[];
    permissions: string[];
    roles: string[];
    forbiddenElement?: React.ReactNode;
    fetchMenuListAsync?: () => Promise<unknown[]>;
    layoutMap?: Record<string, React.ComponentType<unknown>>;
    pageMap?: Record<string, React.ComponentType<unknown>>;
  },
): Promise<AppRouteObject[]> {
  const { routes, permissions, forbiddenElement, fetchMenuListAsync, layoutMap, pageMap } = options;

  switch (mode) {
    case 'backend': {
      // 后端模式：从接口获取菜单树，动态转换组件
      if (!fetchMenuListAsync) {
        throw new Error('Backend mode requires fetchMenuListAsync');
      }
      return generateRoutesByBackend({
        staticRoutes: routes,
        mode,
        fetchMenuListAsync,
        layoutMap,
        pageMap,
      });
    }
    case 'frontend': {
      // 前端模式：基于静态路由 + 权限过滤
      return generateRoutesByFrontend(routes, permissions, forbiddenElement);
    }
    default: {
      // 未知模式视为前端模式（fallback）
      return generateRoutesByFrontend(routes, permissions, forbiddenElement);
    }
  }
}
