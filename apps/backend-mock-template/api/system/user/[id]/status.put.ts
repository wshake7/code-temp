import { defineEventHandler, getRouterParam, readBody, setResponseStatus } from "h3";
import { ensureUserSeeds, toggleUserStatus } from "~/utils/mock-data";
import { toUserCamelRow } from "~/utils/user-role-camel";
import { useResponseError, useResponseSuccess, unAuthorizedResponse } from "~/utils/response";
import { verifyAccessToken } from "~/utils/session-utils";

/** 切换用户启停状态：{ status: 0|1 }。 */
export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }
  ensureUserSeeds();

  const idStr = getRouterParam(event, "id");
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    setResponseStatus(event, 400);
    return useResponseError("BadRequest", "id must be a number");
  }

  const raw = ((await readBody(event)) ?? {}) as Record<string, unknown>;
  const status = raw.status ?? raw.isEnabled;
  if (!["0", "1", 0, 1].includes(status as number | string)) {
    setResponseStatus(event, 400);
    return useResponseError("BadRequest", "status must be 0 or 1");
  }
  const isEnabled: 0 | 1 = Number(status) ? 1 : 0;

  const row = toggleUserStatus(id, isEnabled);
  if (!row) {
    setResponseStatus(event, 404);
    return useResponseError("NotFound", `user ${id} not found`);
  }
  return useResponseSuccess(toUserCamelRow(row));
});
