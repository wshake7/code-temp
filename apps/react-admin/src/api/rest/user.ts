import { del, get, post, put } from './request';
import type {
  CreateUserRequest,
  PageResult,
  ResetPasswordRequest,
  ToggleUserStatusRequest,
  UpdateUserRequest,
  UserListItem,
  UserListQuery,
} from './types';

/** 分页列出用户 */
export function listUsersApi(query: UserListQuery) {
  return get<PageResult<UserListItem>>(
    '/system/user/list',
    query as Record<string, unknown>,
  );
}

/** 创建用户 */
export function createUserApi(body: CreateUserRequest) {
  return post<UserListItem>('/system/user', body);
}

/** 更新用户（username/password 不可改） */
export function updateUserApi({ id, data }: UpdateUserRequest) {
  return put<UserListItem>(`/system/user/${id}`, data);
}

/** 软删用户 + 清 sys_user_role */
export function deleteUserApi(id: number) {
  return del<unknown>(`/system/user/${id}`);
}

/** 切换用户启停状态 */
export function toggleUserStatusApi({ id, status }: ToggleUserStatusRequest) {
  return put<UserListItem>(`/system/user/${id}/status`, { status });
}

/** 重置用户密码 */
export function resetUserPasswordApi({ id, password }: ResetPasswordRequest) {
  return post<{ id: number }>(`/system/user/${id}/password`, { password });
}