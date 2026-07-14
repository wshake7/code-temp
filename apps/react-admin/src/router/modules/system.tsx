import type { AppRouteObject } from '@/core/router/types';
import DictPage from '@/pages/app/system/dict';
import I18nPage from '@/pages/app/system/i18n';
import { Navigate } from 'react-router-dom';

/**
 * 系统配置：字典 / 国际化
 * 用户、菜单、接口已归入权限管理；保留旧 path redirect
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
        name: 'system-user-redirect',
        path: 'user',
        element: <Navigate to="/permission/user" replace />,
        meta: {
          title: 'routes:users',
          hideInMenu: true,
        },
      },
      {
        name: 'system-menu-redirect',
        path: 'menu',
        element: <Navigate to="/permission/menu" replace />,
        meta: {
          title: 'routes:menus',
          hideInMenu: true,
        },
      },
      {
        name: 'system-api-redirect',
        path: 'api',
        element: <Navigate to="/permission/api" replace />,
        meta: {
          title: 'routes:apis',
          hideInMenu: true,
        },
      },
      {
        name: 'dict',
        path: 'dict',
        element: <DictPage />,
        meta: {
          title: 'routes:dict',
          icon: 'lucide:book-marked',
          order: 1,
        },
      },
      {
        name: 'i18n',
        path: 'i18n',
        element: <I18nPage />,
        meta: {
          title: 'routes:i18n',
          icon: 'lucide:languages',
          order: 2,
        },
      },
    ],
  },
];

export default systemRoutes;
