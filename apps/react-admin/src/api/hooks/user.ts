import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { queryClient } from '@/core';
import {
  createUserApi,
  deleteUserApi,
  listUsersApi,
  resetUserPasswordApi,
  toggleUserStatusApi,
  updateUserApi,
} from '@/api/rest/user';
import type {
  CreateUserRequest,
  PageResult,
  ResetPasswordRequest,
  ToggleUserStatusRequest,
  UpdateUserRequest,
  UserListItem,
  UserListQuery,
} from '@/api/rest/types';

// =========================================
// 列表查询
// =========================================
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

export async function fetchListUsers(query: UserListQuery) {
  return queryClient.fetchQuery({
    queryKey: ['listUsers', query],
    queryFn: () => listUsersApi(query),
    retry: 0,
  });
}

// =========================================
// 新建 / 更新 / 删除
// =========================================
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

export function useDeleteUser(
  options?: UseMutationOptions<unknown, Error, number>,
) {
  return useMutation({
    mutationFn: (id) => deleteUserApi(id),
    ...options,
  });
}

// =========================================
// 启停 / 重置密码
// =========================================
export function useToggleUserStatus(
  options?: UseMutationOptions<UserListItem, Error, ToggleUserStatusRequest>,
) {
  return useMutation({
    mutationFn: (req) => toggleUserStatusApi(req),
    ...options,
  });
}

export function useResetUserPassword(
  options?: UseMutationOptions<{ id: number }, Error, ResetPasswordRequest>,
) {
  return useMutation({
    mutationFn: (req) => resetUserPasswordApi(req),
    ...options,
  });
}