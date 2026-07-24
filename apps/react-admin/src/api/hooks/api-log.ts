import {
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { queryClient } from '@/core';
import { listApiLogsApi } from '@/api/rest/api-log';
import type {
  ApiLogListItem,
  ApiLogListQuery,
  PageResult,
} from '@/api/rest/types';

export function useListApiLogs(
  query: ApiLogListQuery,
  options?: UseQueryOptions<PageResult<ApiLogListItem>, Error>,
) {
  return useQuery({
    queryKey: ['listApiLogs', query],
    queryFn: () => listApiLogsApi(query),
    ...options,
  });
}

export async function fetchListApiLogs(query: ApiLogListQuery = {}) {
  return queryClient.fetchQuery({
    queryKey: ['listApiLogs', query],
    queryFn: () => listApiLogsApi(query),
    retry: 0,
  });
}
