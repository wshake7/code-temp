import type { AppRouteObject } from '@/core/router/types';
import UserPage from '@/pages/app/permission/user';
import RolePage from '@/pages/app/permission/role';
import MenuPage from '@/pages/app/permission/menu';
import ApiPage from '@/pages/app/permission/api';

/**
 * 权限管理路由 — 对齐 Open Design「权限管理」分组：
 * 用户 / 角色 / 菜单 / 接口
 */
export const permissionRoutes: AppRouteObject[] = [
  {
    name: 'permission',
    path: 'permission',
    meta: {
      title: 'routes:permission',
      icon: 'lucide:shield-check',
      order: 2002,
      keepAlive: true,
    },
    children: [
      {
        name: 'permission-user',
        path: 'user',
        element: <UserPage />,
        meta: {
          title: 'routes:users',
          icon: 'lucide:user-cog',
          order: 1,
        },
      },
      {
        name: 'permission-role',
        path: 'role',
        element: <RolePage />,
        meta: {
          title: 'routes:roles',
          icon: 'lucide:shield-user',
          order: 2,
        },
      },
      {
        name: 'permission-menu',
        path: 'menu',
        element: <MenuPage />,
        meta: {
          title: 'routes:menus',
          icon: 'lucide:menu',
          order: 3,
        },
      },
      {
        name: 'permission-api',
        path: 'api',
        element: <ApiPage />,
        meta: {
          title: 'routes:apis',
          icon: 'lucide:terminal',
          order: 4,
        },
      },
    ],
  },
];

export default permissionRoutes;
