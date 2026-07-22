/**
 * @deprecated 请使用 `@/api/hooks/login-log`
 * 保留 re-export 以免旧 import 直接炸裂。
 */
export { fetchListLoginLogs as fetchListLoginAuditLogs, useListLoginLogs } from './login-log';
