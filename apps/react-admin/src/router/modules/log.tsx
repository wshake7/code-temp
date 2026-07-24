import type { AppRouteObject } from '@/core/router/types';
import { createLazyRoute } from '@/core/router';

/**
 * 日志审计：侧栏单菜单，点击直接进入 /log，页内 Tab 切换登录日志 / API 日志。
 */
export const logRoutes: AppRouteObject[] = [
  {
    name: 'log',
    path: 'log',
    element: createLazyRoute(() => import('@/pages/app/log')),
    meta: {
      title: 'routes:log',
      icon: 'lucide:logs',
      order: 2004,
      keepAlive: true,
      // 任一 list 权限即可进入（OR）；页内 Tab 再按码分别显隐
      authority: ['log:login-log:list', 'log:api-log:list'],
    },
  },
];

export default logRoutes;
