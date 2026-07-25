import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { queryClient } from '@/core';
import {
  batchMenuApi,
  createMenuApi,
  deleteMenuApi,
  getApisByMenusApi,
  getMenuApisApi,
  listAllMenusApi,
  listMenusApi,
  setMenuApisApi,
  updateMenuApi,
} from '@/api/rest/menu';
import type {
  CreateMenuRequest,
  MenuBatchRequest,
  MenuBindApiItem,
  MenuListQuery,
  PageResult,
  SysMenu,
  UpdateMenuRequest,
} from '@/api/rest/types';

// =========================================
// 列表查询
// =========================================
export function useListMenus(
  query: MenuListQuery,
  options?: UseQueryOptions<PageResult<SysMenu>, Error>,
) {
  return useQuery({
    queryKey: ['listMenus', query],
    queryFn: () => listMenusApi(query),
    ...options,
  });
}

export async function fetchListMenus(query: MenuListQuery) {
  return queryClient.fetchQuery({
    queryKey: ['listMenus', query],
    queryFn: () => listMenusApi(query),
    retry: 0,
  });
}

/** 全量菜单（父菜单下拉/组树用） */
export function useAllMenus(
  options?: UseQueryOptions<SysMenu[], Error>,
) {
  return useQuery({
    queryKey: ['allMenus'],
    queryFn: () => listAllMenusApi(),
    ...options,
  });
}

// =========================================
// 新建 / 更新 / 删除
// =========================================
export function useCreateMenu(
  options?: UseMutationOptions<SysMenu, Error, CreateMenuRequest>,
) {
  return useMutation({
    mutationFn: (data) => createMenuApi(data),
    ...options,
  });
}

export function useUpdateMenu(
  options?: UseMutationOptions<SysMenu, Error, UpdateMenuRequest>,
) {
  return useMutation({
    mutationFn: (req) => updateMenuApi(req),
    ...options,
  });
}

export function useDeleteMenu(
  options?: UseMutationOptions<unknown, Error, number>,
) {
  return useMutation({
    mutationFn: (id) => deleteMenuApi(id),
    ...options,
  });
}

export function useBatchMenu(
  options?: UseMutationOptions<
    { action: string; affected: number; ids: number[] },
    Error,
    MenuBatchRequest
  >,
) {
  return useMutation({
    mutationFn: (body) => batchMenuApi(body),
    ...options,
  });
}

// =========================================
// 菜单-接口绑定
// =========================================
export function useMenuApis(
  id: number | null,
  options?: UseQueryOptions<MenuBindApiItem[], Error>,
) {
  return useQuery({
    queryKey: ['menuApis', id],
    queryFn: () => getMenuApisApi(id as number),
    enabled: id !== null && id !== undefined,
    ...options,
  });
}

export function useSetMenuApis(
  options?: UseMutationOptions<
    { menuId: number; apiIds: number[] },
    Error,
    { id: number; apiIds: number[] }
  >,
) {
  return useMutation({
    mutationFn: ({ id, apiIds }) => setMenuApisApi(id, apiIds),
    ...options,
  });
}

/** 按菜单聚合已绑定接口 ID（角色授权带出用） */
export function useApisByMenus(
  options?: UseMutationOptions<
    { menuIds: number[]; apiIds: number[] },
    Error,
    number[]
  >,
) {
  return useMutation({
    mutationFn: (menuIds) => getApisByMenusApi(menuIds),
    ...options,
  });
}