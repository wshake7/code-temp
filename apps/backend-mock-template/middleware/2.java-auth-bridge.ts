import { defineEventHandler } from "h3";

import { ensureTokenAdopted, extractBearerToken } from "~/utils/session-utils";

/**
 * hybrid（mock + java）鉴权桥：
 * 登录走 java 时 token 不在 mock 内存会话中。
 * 在业务 handler 之前，用 java `/api/user/info` 内省并登记到本地 session，
 * 使 `/api/menu/all` 等 mock 接口的 `verifyAccessToken` 能通过。
 *
 * 关闭：环境变量 `AUTH_JAVA_INTROSPECT_URL=`（空字符串）。
 */
export default defineEventHandler(async (event) => {
  if (event.method === "OPTIONS") return;
  const path = event.path ?? "";
  if (!path.startsWith("/api/")) return;

  // 登录/挑战等公开接口通常无 Bearer；有 token 时才内省
  const token = extractBearerToken(event);
  if (!token) return;

  await ensureTokenAdopted(token);
});
