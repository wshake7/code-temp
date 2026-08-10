import type { AppRouteObject } from '@/core/router/types';
import UserPage from '@/pages/app/system/user';
import DictPage from '@/pages/app/system/dict';
import I18nPage from '@/pages/app/system/i18n';
import MenuPage from '@/pages/app/system/menu';
import ApiPage from '@/pages/app/system/api';
import RolePage from '@/pages/app/system/role';
import BlacklistPage from '@/pages/app/system/blacklist';

/**
 * 系统管理路由配置
 * user / dict / i18n / menu / api / blacklist 已上线。
 * path 对齐 seed：/system/blacklist；权限码 system:blacklist:*
 */
export const systemRoutes: AppRouteObject[] = [
  {
    name: 'system',
    path: 'system',
    meta: {
      title: 'routes:system',
      icon: 'lucide:settings',
      order: 2005,
      keepAlive: true,
    },
    children: [
      {
        name: 'user',
        path: 'user',
        element: <UserPage />,
        meta: {
          title: 'routes:users',
          icon: 'lucide:user-cog',
          order: 1,
        },
      },
      {
        name: 'roles',
        path: 'roles', // 相对路径，最终为 /system/roles
        element: <RolePage />,
        meta: {
          title: 'routes:roles',
          icon: 'lucide:shield-user', // Iconify 格式
          order: 2,
          // permission: 'sys:platform_admin', // 平台管理员或租户管理员权限（开发阶段暂时注释）
        },
      },
      {
        name: 'dict',
        path: 'dict',
        element: <DictPage />,
        meta: {
          title: 'routes:dict',
          icon: 'lucide:book-marked',
          order: 3,
        },
      },
      {
        name: 'i18n',
        path: 'i18n',
        element: <I18nPage />,
        meta: {
          title: 'routes:i18n',
          icon: 'lucide:languages',
          order: 4,
        },
      },
      {
        name: 'menu',
        path: 'menu',
        element: <MenuPage />,
        meta: {
          title: 'routes:menus',
          icon: 'lucide:menu',
          order: 5,
        },
      },
      {
        name: 'api',
        path: 'api',
        element: <ApiPage />,
        meta: {
          title: 'routes:apis',
          icon: 'lucide:terminal',
          order: 6,
        },
      },
      {
        name: 'blacklist',
        path: 'blacklist', // 最终 /system/blacklist，对齐 seed component /system/blacklist/index
        element: <BlacklistPage />,
        meta: {
          title: 'routes:system.blacklist.title',
          icon: 'lucide:shield-ban',
          order: 7,
        },
      },
    ],
  },
];

export default systemRoutes;
