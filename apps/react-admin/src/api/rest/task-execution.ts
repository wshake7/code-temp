import { get } from './request';
import type { PageResult, TaskExecution, TaskExecutionQuery } from './types';

/** 分页列出执行记录（无删除接口） */
export function listTaskExecutionApi(query: TaskExecutionQuery = {}) {
  return get<PageResult<TaskExecution>>(
    '/system/task-execution/list',
    query as Record<string, unknown>,
  );
}

/** 执行记录详情（含 failureReason） */
export function getTaskExecutionApi(id: number) {
  return get<TaskExecution>(`/system/task-execution/${id}`);
}
