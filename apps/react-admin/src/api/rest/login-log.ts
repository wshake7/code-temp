import { get } from './request';
import type { LoginLogListItem, LoginLogListQuery, PageResult } from './types';

/** 分页列出登录日志（热表 / 归档） */
export function listLoginLogsApi(query: LoginLogListQuery = {}) {
  return get<PageResult<LoginLogListItem>>(
    '/system/login-log/list',
    query as Record<string, unknown>,
  );
}
