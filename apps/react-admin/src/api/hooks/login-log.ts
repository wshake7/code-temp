import {
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { queryClient } from '@/core';
import { listLoginLogsApi } from '@/api/rest/login-log';
import type {
  LoginLogListItem,
  LoginLogListQuery,
  PageResult,
} from '@/api/rest/types';

export function useListLoginLogs(
  query: LoginLogListQuery,
  options?: UseQueryOptions<PageResult<LoginLogListItem>, Error>,
) {
  return useQuery({
    queryKey: ['listLoginLogs', query],
    queryFn: () => listLoginLogsApi(query),
    ...options,
  });
}

export async function fetchListLoginLogs(query: LoginLogListQuery = {}) {
  return queryClient.fetchQuery({
    queryKey: ['listLoginLogs', query],
    queryFn: () => listLoginLogsApi(query),
    retry: 0,
  });
}
