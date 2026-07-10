import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { queryClient } from '@/core';
import {
  batchApiApi,
  createApiApi,
  deleteApiApi,
  listAllApisApi,
  listApiGroupsApi,
  listApisApi,
  syncApisApi,
  updateApiApi,
} from '@/api/rest/api';
import type {
  ApiBatchRequest,
  ApiListQuery,
  ApiSyncResult,
  CreateApiRequest,
  PageResult,
  SysApi,
  UpdateApiRequest,
} from '@/api/rest/types';

// =========================================
// 列表查询
// =========================================
export function useListApis(
  query: ApiListQuery,
  options?: UseQueryOptions<PageResult<SysApi>, Error>,
) {
  return useQuery({
    queryKey: ['listApis', query],
    queryFn: () => listApisApi(query),
    ...options,
  });
}

export async function fetchListApis(query: ApiListQuery) {
  return queryClient.fetchQuery({
    queryKey: ['listApis', query],
    queryFn: () => listApisApi(query),
    retry: 0,
  });
}

/** 全量接口 */
export function useAllApis(options?: UseQueryOptions<SysApi[], Error>) {
  return useQuery({
    queryKey: ['allApis'],
    queryFn: () => listAllApisApi(),
    ...options,
  });
}

/** 去重分组列表 */
export function useApiGroups(options?: UseQueryOptions<string[], Error>) {
  return useQuery({
    queryKey: ['apiGroups'],
    queryFn: () => listApiGroupsApi(),
    ...options,
  });
}

// =========================================
// 新建 / 更新 / 删除 / 批量
// =========================================
export function useCreateApi(
  options?: UseMutationOptions<SysApi, Error, CreateApiRequest>,
) {
  return useMutation({
    mutationFn: (data) => createApiApi(data),
    ...options,
  });
}

export function useUpdateApi(
  options?: UseMutationOptions<SysApi, Error, UpdateApiRequest>,
) {
  return useMutation({
    mutationFn: (req) => updateApiApi(req),
    ...options,
  });
}

export function useDeleteApi(
  options?: UseMutationOptions<unknown, Error, number>,
) {
  return useMutation({
    mutationFn: (id) => deleteApiApi(id),
    ...options,
  });
}

export function useBatchApi(
  options?: UseMutationOptions<
    { action: string; affected: number; ids: number[] },
    Error,
    ApiBatchRequest
  >,
) {
  return useMutation({
    mutationFn: (body) => batchApiApi(body),
    ...options,
  });
}

/** 同步接口 */
export function useSyncApisApi(
  options?: UseMutationOptions<ApiSyncResult, Error, void>,
) {
  return useMutation({
    mutationFn: () => syncApisApi(),
    ...options,
  });
}