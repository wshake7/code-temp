import { createElement } from 'react';
import { Navigate } from 'react-router-dom';

import type { AppRouteObject } from '@/core/router/types';

function joinPath(parentAbs: string, segment?: string): string {
  if (!segment) return parentAbs || '/';
  if (segment.startsWith('/')) return segment;
  if (!parentAbs || parentAbs === '/') return `/${segment}`.replace(/\/+/g, '/');
  return `${parentAbs}/${segment}`.replace(/\/+/g, '/');
}

/** RR6 allows absolute child only if it starts with the combined parent path. */
function isIllegalAbsoluteChild(parentAbs: string, childPath?: string): boolean {
  if (!childPath?.startsWith('/')) return false;
  if (!parentAbs || parentAbs === '/') return false;
  const prefix = parentAbs.endsWith('/') ? parentAbs : `${parentAbs}/`;
  return childPath !== parentAbs && !childPath.startsWith(prefix);
}

/**
 * React Router rejects absolute child paths that are not under the parent path
 * (e.g. `/analytics` nested under `/dashboard`).
 *
 * Keep the original tree for menus; flatten only illegal absolute children so
 * they become siblings. Directory-only parents become a redirect route when needed.
 */
export function flattenAbsoluteNestedRoutes(
  routes: AppRouteObject[],
  parentAbs = '',
): AppRouteObject[] {
  const out: AppRouteObject[] = [];

  for (const route of routes) {
    const routeAbs = joinPath(parentAbs, route.path);

    if (!route.children?.length) {
      out.push(route);
      continue;
    }

    // Fix deeper violations first (relative to this route's absolute path).
    const processedChildren = flattenAbsoluteNestedRoutes(route.children, routeAbs);

    const absoluteChildren: AppRouteObject[] = [];
    const nestedChildren: AppRouteObject[] = [];

    for (const child of processedChildren) {
      if (child.index || !isIllegalAbsoluteChild(routeAbs, child.path)) {
        nestedChildren.push(child);
      } else {
        absoluteChildren.push(child);
      }
    }

    if (absoluteChildren.length === 0) {
      out.push({ ...route, children: nestedChildren });
      continue;
    }

    const hasOwnPage = route.element !== undefined && route.element !== null;
    if (nestedChildren.length > 0 || hasOwnPage) {
      out.push({
        ...route,
        children: nestedChildren.length > 0 ? nestedChildren : undefined,
      });
    } else if (route.path) {
      const redirectTo =
        (typeof route.redirect === 'string' && route.redirect) ||
        absoluteChildren.find((child) => child.path)?.path;
      if (redirectTo) {
        out.push({
          ...route,
          children: undefined,
          redirect: redirectTo,
          element: createElement(Navigate, { to: redirectTo, replace: true }),
        });
      }
    }

    out.push(...absoluteChildren);
  }

  return out;
}

/** Flatten only the MainLayout (`path: '/'`) children used by createBrowserRouter. */
export function flattenLayoutAbsoluteChildren(routes: AppRouteObject[]): AppRouteObject[] {
  return routes.map((route) => {
    if (route.path === '/' && route.children?.length) {
      return {
        ...route,
        children: flattenAbsoluteNestedRoutes(route.children, ''),
      };
    }
    return route;
  });
}
