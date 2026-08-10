/**
 * 从 mock/REST 错误体中提取可读文案。
 * 拦截器 throw 的是 response.data：`{ code, message, error }`，
 * 业务明细通常在 `error` / `message` 字段。
 */
export function getApiErrorMessage(err: unknown, fallback = '未知错误'): string {
  if (err && typeof err === 'object') {
    const body = err as { error?: unknown; message?: unknown };
    if (typeof body.error === 'string' && body.error.trim()) {
      return body.error.trim();
    }
    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message.trim();
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}
