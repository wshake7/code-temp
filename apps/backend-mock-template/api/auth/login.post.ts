import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { createSession } from "~/utils/session-utils";
import { ensureUserSeeds, getMockSysUserList } from "~/utils/mock-data";
import { forbiddenResponse, useResponseError, useResponseSuccess } from "~/utils/response";

export default defineEventHandler(async (event) => {
  const { password, username } = await readBody<{ password?: string; username?: string }>(event);
  if (!password || !username) {
    setResponseStatus(event, 400);
    return useResponseError("BadRequestException", "Username and password are required");
  }

  ensureUserSeeds();

  const sharedList = getMockSysUserList();
  const sysUser = sharedList.find((item) => item.username === username && item.deleted_at === 0);

  // demo$bcrypt$ 前缀占位密码：提取后缀比对明文
  if (!sysUser || !sysUser.password_hash.endsWith(password)) {
    return forbiddenResponse(event, "Username or password is incorrect.");
  }

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
