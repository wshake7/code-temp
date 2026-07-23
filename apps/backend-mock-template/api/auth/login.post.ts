import { defineEventHandler, getHeader, getRequestIP, readBody, setResponseStatus } from "h3";
import { createSession } from "~/utils/session-utils";
import { appendLoginLog, ensureUserSeeds, getMockSysUserList } from "~/utils/mock-data";
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

  const { password, username } = await readBody<{ password?: string; username?: string }>(event);
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
    return useResponseError("BadRequestException", "Username and password are required");
  }

  const sharedList = getMockSysUserList();
  const sysUser = sharedList.find((item) => item.username === username && item.deleted_at === 0);

  // demo$bcrypt$ 前缀占位密码：提取后缀比对明文
  if (!sysUser || !sysUser.password_hash.endsWith(password)) {
    appendLoginLog({
      username,
      success: 0,
      reason: "Username or password is incorrect.",
      statusCode: 403,
      loginIp,
      userAgent,
    });
    return forbiddenResponse(event, "Username or password is incorrect.");
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

  const roles =
    sysUser.username === "vben" ? ["super"] : sysUser.username === "admin" ? ["admin"] : ["user"];
  const homePath =
    sysUser.username === "vben"
      ? "/analytics"
      : sysUser.username === "admin"
        ? "/system/user"
        : "/analytics";

  const accessToken = createSession({
    id: sysUser.id,
    username: sysUser.username,
  });

  return useResponseSuccess({
    id: sysUser.id,
    username: sysUser.username,
    realName: sysUser.nickname,
    roles,
    homePath,
    accessToken,
  });
});
