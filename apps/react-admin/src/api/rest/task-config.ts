import { del, get, post, put } from './request';
import type {
  CreateTaskConfigRequest,
  PageResult,
  TaskConfig,
  TaskConfigBatchRequest,
  TaskConfigBatchResult,
  TaskConfigQuery,
  TaskConfigTriggerResult,
  UpdateTaskConfigRequest,
} from './types';

/** 分页列出任务配置（软删不可见） */
export function listTaskConfigApi(query: TaskConfigQuery = {}) {
  return get<PageResult<TaskConfig>>(
    '/system/task-config/list',
    query as Record<string, unknown>,
  );
}

/** 任务配置详情 */
export function getTaskConfigApi(id: number) {
  return get<TaskConfig>(`/system/task-config/${id}`);
}

/** 新建任务配置 */
export function createTaskConfigApi(body: CreateTaskConfigRequest) {
  return post<TaskConfig>('/system/task-config', body);
}

/** 更新任务配置 */
export function updateTaskConfigApi({ id, ...patch }: UpdateTaskConfigRequest) {
  return put<TaskConfig>(`/system/task-config/${id}`, patch);
}

/** 软删任务配置（允许存在 execution） */
export function deleteTaskConfigApi(id: number) {
  return del<unknown>(`/system/task-config/${id}`);
}

/** 批量操作：enable / disable / delete / trigger */
export function batchTaskConfigApi(body: TaskConfigBatchRequest) {
  return post<TaskConfigBatchResult>('/system/task-config/batch', body);
}

/** 手动触发（禁用配置 → 400） */
export function triggerTaskConfigApi(id: number) {
  return post<TaskConfigTriggerResult>(`/system/task-config/${id}/trigger`);
}
