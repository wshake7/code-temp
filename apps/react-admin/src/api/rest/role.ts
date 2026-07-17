import { del, get, post, put } from './request';
import type {
  CreateRoleRequest,
  PageResult,
  RoleApiBindItem,
  RoleListQuery,
  RoleMenuBindItem,
  RoleOption,
  SysRole,
  UpdateRoleRequest,
} from './types';

/** 分页列出角色 */
export function listRolesApi(query: RoleListQuery) {
  return get<PageResult<SysRole>>(
    '/system/role/list',
    query as Record<string, unknown>,
  );
}

/** 全量角色（用户表单的角色下拉用，按 sort/id 升序） */
export function listAllRolesApi(params?: { status?: 0 | 1 }) {
  return get<RoleOption[]>(
    '/system/role/all',
    (params ?? {}) as Record<string, unknown>,
  );
}

/** 创建角色 */
export function createRoleApi(body: CreateRoleRequest) {
  return post<SysRole>('/system/role', body);
}

/** 更新角色（code 不可改） */
export function updateRoleApi({ id, data }: UpdateRoleRequest) {
  return put<SysRole>(`/system/role/${id}`, data);
}

/** 软删角色（有关联用户或子角色时后端 400 拒绝） */
export function deleteRoleApi(id: number) {
  return del<unknown>(`/system/role/${id}`);
}

/** 读取角色可授权菜单（带 bound 标记） */
export function getRoleMenusApi(id: number) {
  return get<RoleMenuBindItem[]>(`/system/role/${id}/menus`);
}

/** 全量替换角色菜单授权 */
export function setRoleMenusApi(id: number, menuIds: number[]) {
  return post<{ roleId: number; menuIds: number[] }>(
    `/system/role/${id}/menus`,
    { menuIds },
  );
}

/** 读取角色可授权接口（带 bound 标记） */
export function getRoleApisApi(id: number) {
  return get<RoleApiBindItem[]>(`/system/role/${id}/apis`);
}

/** 全量替换角色接口授权 */
export function setRoleApisApi(id: number, apiIds: number[]) {
  return post<{ roleId: number; apiIds: number[] }>(
    `/system/role/${id}/apis`,
    { apiIds },
  );
}