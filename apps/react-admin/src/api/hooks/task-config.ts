import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { queryClient } from '@/core';
import {
  batchTaskConfigApi,
  createTaskConfigApi,
  deleteTaskConfigApi,
  getTaskConfigApi,
  listTaskConfigApi,
  listTaskQueuesApi,
  listTaskWorkflowTypesApi,
  triggerTaskConfigApi,
  updateTaskConfigApi,
} from '@/api/rest/task-config';
import type {
  CreateTaskConfigRequest,
  PageResult,
  TaskConfig,
  TaskConfigBatchRequest,
  TaskConfigBatchResult,
  TaskConfigQuery,
  TaskConfigTriggerResult,
  TaskSelectOption,
  UpdateTaskConfigRequest,
} from '@/api/rest/types';

export function useListTaskConfig(
  query: TaskConfigQuery = {},
  options?: UseQueryOptions<PageResult<TaskConfig>, Error>,
) {
  return useQuery({
    queryKey: ['listTaskConfig', query],
    queryFn: () => listTaskConfigApi(query),
    ...options,
  });
}

export function useListTaskWorkflowTypes(
  options?: UseQueryOptions<TaskSelectOption[], Error>,
) {
  return useQuery({
    queryKey: ['listTaskWorkflowTypes'],
    queryFn: () => listTaskWorkflowTypesApi(),
    staleTime: 60_000,
    ...options,
  });
}

export function useListTaskQueues(
  options?: UseQueryOptions<TaskSelectOption[], Error>,
) {
  return useQuery({
    queryKey: ['listTaskQueues'],
    queryFn: () => listTaskQueuesApi(),
    staleTime: 60_000,
    ...options,
  });
}

export async function fetchListTaskConfig(query: TaskConfigQuery = {}) {
  return queryClient.fetchQuery({
    queryKey: ['listTaskConfig', query],
    queryFn: () => listTaskConfigApi(query),
    retry: 0,
  });
}

export function useGetTaskConfig(
  id: number | null | undefined,
  options?: UseQueryOptions<TaskConfig, Error>,
) {
  return useQuery({
    queryKey: ['getTaskConfig', id],
    queryFn: () => getTaskConfigApi(id as number),
    enabled: typeof id === 'number',
    ...options,
  });
}

export function useCreateTaskConfig(
  options?: UseMutationOptions<TaskConfig, Error, CreateTaskConfigRequest>,
) {
  return useMutation({
    mutationFn: (body) => createTaskConfigApi(body),
    ...options,
  });
}

export function useUpdateTaskConfig(
  options?: UseMutationOptions<TaskConfig, Error, UpdateTaskConfigRequest>,
) {
  return useMutation({
    mutationFn: (req) => updateTaskConfigApi(req),
    ...options,
  });
}

export function useDeleteTaskConfig(
  options?: UseMutationOptions<unknown, Error, number>,
) {
  return useMutation({
    mutationFn: (id) => deleteTaskConfigApi(id),
    ...options,
  });
}

export function useBatchTaskConfig(
  options?: UseMutationOptions<TaskConfigBatchResult, Error, TaskConfigBatchRequest>,
) {
  return useMutation({
    mutationFn: (body) => batchTaskConfigApi(body),
    ...options,
  });
}

export function useTriggerTaskConfig(
  options?: UseMutationOptions<TaskConfigTriggerResult, Error, number>,
) {
  return useMutation({
    mutationFn: (id) => triggerTaskConfigApi(id),
    ...options,
  });
}
