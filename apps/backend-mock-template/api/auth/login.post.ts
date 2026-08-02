import { defineEventHandler, getHeader, getRequestIP, readBody, setResponseStatus } from "h3";
import { createSession } from "~/utils/session-utils";
import { verifyAltchaPayload } from "~/utils/altcha";
import {
  appendLoginLog,
  ensureUserSeeds,
  getMockSysUserList,
  getUserRoleCodes,
} from "~/utils/mock-data";
import { forbiddenResponse, useResponseError, useResponseSuccess } from "~/utils/response";

function clientMeta(event: Parameters<typeof getHeader>[0]) {
  const userAgent = getHeader(event, "user-agent") ?? "";
  const loginIp =
    getRequestIP(event, { xForwardedFor: true }) ??
    getHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ??
    "127.0.0.1";
  return { userAgent, loginIp };
}

export default defineEventHandler(async (event) => {
  ensureUserSeeds();

  const { password, username, altcha } = await readBody<{
    password?: string;
    username?: string;
    altcha?: string;
  }>(event);
  const { userAgent, loginIp } = clientMeta(event);

  if (!password || !username) {
    appendLoginLog({
      username: username ?? "",
      success: 0,
      reason: "Username and password are required",
      statusCode: 400,
      loginIp,
      userAgent,
    });
    setResponseStatus(event, 400);
    return useResponseError("Username and password are required", 1001);
  }

  // ALTCHA PoW 人机校验：未通过直接拒绝，不计入账号密码失败日志。
  const altchaOk = await verifyAltchaPayload(altcha ?? "");
  if (!altchaOk) {
    appendLoginLog({
      username,
      success: 0,
      reason: "ALTCHA verification failed",
      statusCode: 403,
      loginIp,
      userAgent,
    });
    return forbiddenResponse(event, "ALTCHA verification failed.");
  }

  const sharedList = getMockSysUserList();
  const sysUser = sharedList.find((item) => item.username === username && item.deleted_at === 0);

  // demo$bcrypt$ 前缀占位密码：提取后缀比对明文
  if (!sysUser || !sysUser.password_hash.endsWith(password)) {
    appendLoginLog({
      username,
      success: 0,
      reason: "Username or password is incorrect.",
      statusCode: 401,
      loginIp,
      userAgent,
    });
    setResponseStatus(event, 401);
    // 与 java-admin AUTH_INVALID_CREDENTIALS(2002) 对齐
    return useResponseError("Username or password is incorrect.", 2002);
  }

  appendLoginLog({
    username: sysUser.username,
    success: 1,
    reason: "",
    statusCode: 200,
    sysUserId: sysUser.id,
    loginIp,
    userAgent,
  });

  const roles = getUserRoleCodes(sysUser.id);

  const accessToken = createSession({
    id: sysUser.id,
    username: sysUser.username,
  });

  return useResponseSuccess({
    id: sysUser.id,
    username: sysUser.username,
    realName: sysUser.nickname,
    roles,
    homePath: "/analytics",
    accessToken,
  });
});
