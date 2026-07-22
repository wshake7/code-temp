import type { AppRouteObject } from '@/core/router/types';
import { createLazyRoute } from '@/core/router';

/**
 * 日志审计管理路由
 * 登录日志已实现；其余子页暂用 ComingSoon，避免缺页。
 */
export const logRoutes: AppRouteObject[] = [
  {
    name: 'log',
    path: 'log',
    meta: {
      title: 'routes:log',
      icon: 'lucide:logs',
      order: 2004,
      keepAlive: true,
    },
    children: [
      {
        name: 'login-log',
        path: 'login-log',
        element: createLazyRoute(() => import('@/pages/app/log/login-log')),
        meta: {
          title: 'routes:login-log',
          icon: 'lucide:user-lock',
        },
      },
      {
        name: 'api-audit-log',
        path: 'api-audit-logs',
        element: createLazyRoute(() => import('@/pages/core/error/ComingSoon')),
        meta: {
          title: 'routes:api-audit-log',
          icon: 'lucide:file-clock',
        },
      },
      {
        name: 'operation-audit-log',
        path: 'operation-audit-logs',
        element: createLazyRoute(() => import('@/pages/core/error/ComingSoon')),
        meta: {
          title: 'routes:operation-audit-log',
          icon: 'lucide:shield-ellipsis',
        },
      },
      {
        name: 'data-access-audit-log',
        path: 'data-access-audit-logs',
        element: createLazyRoute(() => import('@/pages/core/error/ComingSoon')),
        meta: {
          title: 'routes:data-access-audit-log',
          icon: 'lucide:shield-check',
        },
      },
      {
        name: 'permission-audit-log',
        path: 'permission-audit-logs',
        element: createLazyRoute(() => import('@/pages/core/error/ComingSoon')),
        meta: {
          title: 'routes:permission-audit-log',
          icon: 'lucide:shield-alert',
        },
      },
    ],
  },
];

export default logRoutes;
