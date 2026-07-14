import { del, get, post, put } from './request';
import type {
  BatchActionRequest,
  BatchActionResult,
  CreateUserRequest,
  PageResult,
  UpdateUserRequest,
  UserListItem,
  UserListQuery,
} from './types';

/** 分页列出用户 */
export function listUsersApi(query: UserListQuery) {
  return get<PageResult<UserListItem>>(
    '/permission/user/list',
    query as Record<string, unknown>,
  );
}

/** 创建用户 */
export function createUserApi(body: CreateUserRequest) {
  return post<UserListItem>('/permission/user', body);
}

/** 更新用户 */
export function updateUserApi({ id, data }: UpdateUserRequest) {
  return put<UserListItem>(`/permission/user/${id}`, data);
}

/** 删除用户（软删） */
export function deleteUserApi(id: number) {
  return del<unknown>(`/permission/user/${id}`);
}

/** 批量启停/删除 */
export function batchUsersApi(body: BatchActionRequest) {
  return post<BatchActionResult>('/permission/user/batch', body);
}

/** 重置密码 */
export function resetUserPasswordApi(id: number, password: string) {
  return post<{ id: number; ok: boolean }>(`/permission/user/${id}/reset-password`, {
    password,
  });
}
