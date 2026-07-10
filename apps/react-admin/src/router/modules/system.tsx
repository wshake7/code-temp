import type { AppRouteObject } from '@/core/router/types';
import UserPage from '@/pages/app/system/user';
import DictPage from '@/pages/app/system/dict';
import I18nPage from '@/pages/app/system/i18n';
import MenuPage from '@/pages/app/system/menu';
import ApiPage from '@/pages/app/system/api';

/**
 * 系统管理路由配置
 * user / dict / i18n / menu / api 已上线；其余模块保留目录结构以便后续补充。
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
        name: 'dict',
        path: 'dict',
        element: <DictPage />,
        meta: {
          title: 'routes:dict',
          icon: 'lucide:book-marked',
          order: 2,
        },
      },
      {
        name: 'i18n',
        path: 'i18n',
        element: <I18nPage />,
        meta: {
          title: 'routes:i18n',
          icon: 'lucide:languages',
          order: 3,
        },
      },
      {
        name: 'menu',
        path: 'menu',
        element: <MenuPage />,
        meta: {
          title: 'routes:menus',
          icon: 'lucide:menu',
          order: 4,
        },
      },
      {
        name: 'api',
        path: 'api',
        element: <ApiPage />,
        meta: {
          title: 'routes:apis',
          icon: 'lucide:terminal',
          order: 5,
        },
      },
    ],
  },
];

export default systemRoutes;