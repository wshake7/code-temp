import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  batchUsersApi,
  createUserApi,
  deleteUserApi,
  listUsersApi,
  resetUserPasswordApi,
  updateUserApi,
} from '@/api/rest/user';
import type {
  BatchActionRequest,
  BatchActionResult,
  CreateUserRequest,
  PageResult,
  UpdateUserRequest,
  UserListItem,
  UserListQuery,
} from '@/api/rest/types';

export function useListUsers(
  query: UserListQuery,
  options?: UseQueryOptions<PageResult<UserListItem>, Error>,
) {
  return useQuery({
    queryKey: ['listUsers', query],
    queryFn: () => listUsersApi(query),
    ...options,
  });
}

export function useCreateUser(
  options?: UseMutationOptions<UserListItem, Error, CreateUserRequest>,
) {
  return useMutation({
    mutationFn: (data) => createUserApi(data),
    ...options,
  });
}

export function useUpdateUser(
  options?: UseMutationOptions<UserListItem, Error, UpdateUserRequest>,
) {
  return useMutation({
    mutationFn: (req) => updateUserApi(req),
    ...options,
  });
}

export function useDeleteUser(options?: UseMutationOptions<unknown, Error, number>) {
  return useMutation({
    mutationFn: (id) => deleteUserApi(id),
    ...options,
  });
}

export function useBatchUsers(
  options?: UseMutationOptions<BatchActionResult, Error, BatchActionRequest>,
) {
  return useMutation({
    mutationFn: (body) => batchUsersApi(body),
    ...options,
  });
}

export function useResetUserPassword(
  options?: UseMutationOptions<
    { id: number; ok: boolean },
    Error,
    { id: number; password: string }
  >,
) {
  return useMutation({
    mutationFn: ({ id, password }) => resetUserPasswordApi(id, password),
    ...options,
  });
}
