import { defineEventHandler, readBody, setResponseStatus } from "h3";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "~/utils/cookie-utils";
import { generateAccessToken, generateRefreshToken } from "~/utils/jwt-utils";
import { ensureUserSeeds, getMockSysUserList } from "~/utils/mock-data";
import { forbiddenResponse, useResponseError, useResponseSuccess } from "~/utils/response";

export default defineEventHandler(async (event) => {
  const { password, username } = await readBody<{ password?: string; username?: string }>(event);
  if (!password || !username) {
    setResponseStatus(event, 400);
    return useResponseError("BadRequestException", "Username and password are required");
  }

  // 确保种子已初始化
  ensureUserSeeds();

  const sharedList = getMockSysUserList();
  const sysUser = sharedList.find((item) => item.username === username && item.deleted_at === 0);

  // demo$bcrypt$ 前缀占位密码：提取后缀比对明文
  if (!sysUser || !sysUser.password_hash.endsWith(password)) {
    clearRefreshTokenCookie(event);
    return forbiddenResponse(event, "Username or password is incorrect.");
  }

  const mockUser: UserInfo = {
    id: sysUser.id,
    username: sysUser.username,
    password: password,
    realName: sysUser.nickname,
    roles:
      sysUser.username === "vben" ? ["super"] : sysUser.username === "admin" ? ["admin"] : ["user"],
    homePath:
      sysUser.username === "vben"
        ? "/analytics"
        : sysUser.username === "admin"
          ? "/system/user"
          : "/analytics",
  };

  const accessToken = generateAccessToken(mockUser);
  const refreshToken = generateRefreshToken(mockUser);

  setRefreshTokenCookie(event, refreshToken);

  // 不向客户端返回 password 字段
  const { password: _password, ...safeUser } = mockUser;
  return useResponseSuccess({
    ...safeUser,
    accessToken,
  });
});
