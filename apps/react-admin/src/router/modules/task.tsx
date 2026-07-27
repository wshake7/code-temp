import type { AppRouteObject } from '@/core/router/types';
import { createLazyRoute } from '@/core/router';

/**
 * 任务调度：侧栏一级菜单，点击直接进入 /task，页内 Tab 切换任务配置 / 执行记录。
 */
export const taskRoutes: AppRouteObject[] = [
  {
    name: 'task',
    path: 'task',
    element: createLazyRoute(() => import('@/pages/app/task')),
    meta: {
      title: 'routes:task',
      icon: 'lucide:timer',
      order: 2003,
      keepAlive: true,
      // 任一 list 权限即可进入（OR）；页内 Tab 再按码分别显隐
      authority: ['task:config:list', 'task:execution:list'],
    },
  },
];

export default taskRoutes;
