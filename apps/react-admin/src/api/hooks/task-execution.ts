import {
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { queryClient } from '@/core';
import {
  getTaskExecutionApi,
  listTaskExecutionApi,
} from '@/api/rest/task-execution';
import type {
  PageResult,
  TaskExecution,
  TaskExecutionQuery,
} from '@/api/rest/types';

export function useListTaskExecution(
  query: TaskExecutionQuery = {},
  options?: UseQueryOptions<PageResult<TaskExecution>, Error>,
) {
  return useQuery({
    queryKey: ['listTaskExecution', query],
    queryFn: () => listTaskExecutionApi(query),
    ...options,
  });
}

export async function fetchListTaskExecution(query: TaskExecutionQuery = {}) {
  return queryClient.fetchQuery({
    queryKey: ['listTaskExecution', query],
    queryFn: () => listTaskExecutionApi(query),
    retry: 0,
  });
}

export function useGetTaskExecution(
  id: number | null | undefined,
  options?: UseQueryOptions<TaskExecution, Error>,
) {
  return useQuery({
    queryKey: ['getTaskExecution', id],
    queryFn: () => getTaskExecutionApi(id as number),
    enabled: typeof id === 'number',
    ...options,
  });
}
