import { defineEventHandler, setResponseStatus } from "h3";

import { ensureUserSeeds, getMockSysUserList, isAccountExpired } from "~/utils/mock-data";
import { useResponseError } from "~/utils/response";
import { revokeAccessToken, verifyAccessToken } from "~/utils/session-utils";

/**
 * 已登录账号状态校验（对齐 Java AccountStatusInterceptor）。
 *
 * - 有效会话：查 is_enabled / account_expires_at
 * - 禁用或过期：吊销会话 + HTTP 403 + code 2004
 */
export default defineEventHandler(async (event) => {
  if (event.method === "OPTIONS") return;

  const path = event.path ?? "";
  if (!path.startsWith("/api/")) return;

  const normalized = path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
  // 登录/登出等公开路径不查
  if (
    normalized === "/api/auth/login" ||
    normalized === "/api/auth/logout" ||
    normalized.startsWith("/api/auth/altcha") ||
    normalized.startsWith("/api/auth/code")
  ) {
    return;
  }

  const sessionUser = verifyAccessToken(event);
  if (!sessionUser?.id) return;

  ensureUserSeeds();
  const userId = Number(sessionUser.id);
  const row = getMockSysUserList().find((u) => u.id === userId && u.deleted_at === 0);

  if (!row) {
    revokeAccessToken(event);
    setResponseStatus(event, 403);
    return useResponseError("账号不可用", 2004);
  }

  if (row.is_enabled !== 1) {
    revokeAccessToken(event);
    setResponseStatus(event, 403);
    return useResponseError("账号已禁用", 2004);
  }

  if (isAccountExpired(row)) {
    revokeAccessToken(event);
    setResponseStatus(event, 403);
    return useResponseError("账号已过期", 2004);
  }
});
