import { del, get, post, put } from './request';
import type {
  ApiBatchRequest,
  ApiListQuery,
  ApiSyncResult,
  CreateApiRequest,
  PageResult,
  SysApi,
  UpdateApiRequest,
} from './types';

/** 分页列出接口（sys_api） */
export function listApisApi(query: ApiListQuery) {
  return get<PageResult<SysApi>>('/permission/api/list', query as Record<string, unknown>);
}

/** 全量接口 */
export function listAllApisApi() {
  return get<SysApi[]>('/permission/api/all');
}

/** 去重分组列表（供分组下拉） */
export function listApiGroupsApi() {
  return get<string[]>('/permission/api/groups');
}

/** 新建接口 */
export function createApiApi(body: CreateApiRequest) {
  return post<SysApi>('/permission/api', body);
}

/** 更新接口 */
export function updateApiApi({ id, data }: UpdateApiRequest) {
  return put<SysApi>(`/permission/api/${id}`, data);
}

/** 删除接口 */
export function deleteApiApi(id: number) {
  return del<unknown>(`/permission/api/${id}`);
}

/** 批量操作接口 */
export function batchApiApi(body: ApiBatchRequest) {
  return post<{ action: string; affected: number; ids: number[] }>(
    '/permission/api/batch',
    body,
  );
}

/** 同步接口（按后端路由清单 upsert） */
export function syncApisApi() {
  return post<ApiSyncResult>('/permission/api/sync');
}