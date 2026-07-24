import { get } from './request';
import type { ApiLogListItem, ApiLogListQuery, PageResult } from './types';

/** 分页列出 API 调用日志（热表 / 归档） */
export function listApiLogsApi(query: ApiLogListQuery = {}) {
  return get<PageResult<ApiLogListItem>>(
    '/system/api-log/list',
    query as Record<string, unknown>,
  );
}
