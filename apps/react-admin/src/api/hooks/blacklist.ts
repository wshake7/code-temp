import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { queryClient } from '@/core';
import {
  batchBlacklistApi,
  createBlacklistApi,
  deleteBlacklistApi,
  getBlacklistApi,
  listAllBlacklistApi,
  listBlacklistApi,
  updateBlacklistApi,
} from '@/api/rest/blacklist';
import type {
  Blacklist,
  BlacklistBatchRequest,
  BlacklistBatchResult,
  BlacklistQuery,
  CreateBlacklistRequest,
  PageResult,
  UpdateBlacklistRequest,
} from '@/api/rest/types';

export function useListBlacklist(
  query: BlacklistQuery = {},
  options?: UseQueryOptions<PageResult<Blacklist>, Error>,
) {
  return useQuery({
    queryKey: ['listBlacklist', query],
    queryFn: () => listBlacklistApi(query),
    ...options,
  });
}

export async function fetchListBlacklist(query: BlacklistQuery = {}) {
  return queryClient.fetchQuery({
    queryKey: ['listBlacklist', query],
    queryFn: () => listBlacklistApi(query),
    retry: 0,
  });
}

export function useListAllBlacklist(
  params?: Omit<BlacklistQuery, 'page' | 'pageSize'>,
  options?: UseQueryOptions<Blacklist[], Error>,
) {
  return useQuery({
    queryKey: ['listAllBlacklist', params],
    queryFn: () => listAllBlacklistApi(params),
    ...options,
  });
}

export function useGetBlacklist(
  id: number | null | undefined,
  options?: UseQueryOptions<Blacklist, Error>,
) {
  return useQuery({
    queryKey: ['getBlacklist', id],
    queryFn: () => getBlacklistApi(id as number),
    enabled: typeof id === 'number',
    ...options,
  });
}

export function useCreateBlacklist(
  options?: UseMutationOptions<Blacklist, Error, CreateBlacklistRequest>,
) {
  return useMutation({
    mutationFn: (body) => createBlacklistApi(body),
    ...options,
  });
}

export function useUpdateBlacklist(
  options?: UseMutationOptions<Blacklist, Error, UpdateBlacklistRequest>,
) {
  return useMutation({
    mutationFn: (req) => updateBlacklistApi(req),
    ...options,
  });
}

export function useDeleteBlacklist(
  options?: UseMutationOptions<Blacklist, Error, number>,
) {
  return useMutation({
    mutationFn: (id) => deleteBlacklistApi(id),
    ...options,
  });
}

export function useBatchBlacklist(
  options?: UseMutationOptions<BlacklistBatchResult, Error, BlacklistBatchRequest>,
) {
  return useMutation({
    mutationFn: (body) => batchBlacklistApi(body),
    ...options,
  });
}
