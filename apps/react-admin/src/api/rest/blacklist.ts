import { del, get, post, put } from './request';
import type {
  Blacklist,
  BlacklistBatchRequest,
  BlacklistBatchResult,
  BlacklistQuery,
  CreateBlacklistRequest,
  PageResult,
  UpdateBlacklistRequest,
} from './types';

/** 分页列出访问黑名单（软删不可见） */
export function listBlacklistApi(query: BlacklistQuery = {}) {
  return get<PageResult<Blacklist>>(
    '/system/blacklist/list',
    query as Record<string, unknown>,
  );
}

/** 全量黑名单（支持与 list 相同过滤项） */
export function listAllBlacklistApi(params?: Omit<BlacklistQuery, 'page' | 'pageSize'>) {
  return get<Blacklist[]>(
    '/system/blacklist/all',
    (params ?? {}) as Record<string, unknown>,
  );
}

/** 黑名单详情 */
export function getBlacklistApi(id: number) {
  return get<Blacklist>(`/system/blacklist/${id}`);
}

/** 新建黑名单 */
export function createBlacklistApi(body: CreateBlacklistRequest) {
  return post<Blacklist>('/system/blacklist', body);
}

/** 更新黑名单 */
export function updateBlacklistApi({ id, ...patch }: UpdateBlacklistRequest) {
  return put<Blacklist>(`/system/blacklist/${id}`, patch);
}

/** 软删黑名单 */
export function deleteBlacklistApi(id: number) {
  return del<Blacklist>(`/system/blacklist/${id}`);
}

/** 批量操作：enable / disable / delete */
export function batchBlacklistApi(body: BlacklistBatchRequest) {
  return post<BlacklistBatchResult>('/system/blacklist/batch', body);
}
