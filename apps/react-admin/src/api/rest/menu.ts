import { del, get, post, put } from './request';
import type {
  CreateMenuRequest,
  MenuBatchRequest,
  MenuBindApiItem,
  MenuListQuery,
  PageResult,
  SysMenu,
  UpdateMenuRequest,
} from './types';

/** 登录后路由元（与「菜单管理 CRUD」无关，保留给路由系统使用） */
export function getAllMenusApi() {
  return get<import('./types').MenuItem[]>('/menu/all');
}

/** 分页列出菜单（sys_menu） */
export function listMenusApi(query: MenuListQuery) {
  return get<PageResult<SysMenu>>('/system/menu/list', query as Record<string, unknown>);
}

/** 全量菜单（供父菜单下拉与前端组树） */
export function listAllMenusApi(params?: { type?: string; status?: 0 | 1 }) {
  return get<SysMenu[]>('/system/menu/all', (params ?? {}) as Record<string, unknown>);
}

/** 新建菜单 */
export function createMenuApi(body: CreateMenuRequest) {
  return post<SysMenu>('/system/menu', body);
}

/** 更新菜单 */
export function updateMenuApi({ id, data }: UpdateMenuRequest) {
  return put<SysMenu>(`/system/menu/${id}`, data);
}

/** 删除菜单 */
export function deleteMenuApi(id: number) {
  return del<unknown>(`/system/menu/${id}`);
}

/** 批量操作菜单 */
export function batchMenuApi(body: MenuBatchRequest) {
  return post<{ action: string; affected: number; ids: number[] }>(
    '/system/menu/batch',
    body,
  );
}

/** 读取某菜单已绑定接口（带 bound 标记） */
export function getMenuApisApi(id: number) {
  return get<MenuBindApiItem[]>(`/system/menu/${id}/apis`);
}

/** 全量替换某菜单的接口绑定 */
export function setMenuApisApi(id: number, apiIds: number[]) {
  return post<{ menuId: number; apiIds: number[] }>(`/system/menu/${id}/apis`, {
    apiIds,
  });
}