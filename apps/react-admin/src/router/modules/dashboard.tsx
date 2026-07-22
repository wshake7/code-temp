import type { AppRouteObject } from '@/core/router/types';
import React from 'react';
import AnalyticsPage from '@/pages/app/dashboard/analytics';
import WorkspacePage from '@/pages/app/dashboard/workspace';

/**
 * 与 Vue web-antdv-next dashboard 模块对齐：
 * 概览 (Dashboard) → 分析页 /analytics + 工作台 /workspace
 */
export const dashboardRoutes: AppRouteObject[] = [
  {
    name: 'Dashboard',
    path: 'dashboard',
    meta: {
      title: 'page.dashboard.title',
      icon: 'lucide:layout-dashboard',
      order: -1,
      hideInMenu: false,
    },
    children: [
      {
        name: 'Analytics',
        path: '/analytics',
        element: <AnalyticsPage />,
        meta: {
          title: 'page.dashboard.analytics',
          icon: 'lucide:area-chart',
          order: 1,
          affixTab: true,
          hideInMenu: false,
        },
      },
      {
        name: 'Workspace',
        path: '/workspace',
        element: <WorkspacePage />,
        meta: {
          title: 'page.dashboard.workspace',
          icon: 'carbon:workspace',
          order: 2,
          hideInMenu: false,
        },
      },
    ],
  },
];

export default dashboardRoutes;
