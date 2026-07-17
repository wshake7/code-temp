import { defineEventHandler } from "h3";
import {
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie,
  setRefreshTokenCookie,
} from "~/utils/cookie-utils";
import { generateAccessToken, verifyRefreshToken } from "~/utils/jwt-utils";
import { ensureUserSeeds, getMockSysUserList } from "~/utils/mock-data";
import { forbiddenResponse, useResponseSuccess } from "~/utils/response";

export default defineEventHandler(async (event) => {
  const refreshToken = getRefreshTokenFromCookie(event);
  if (!refreshToken) {
    return forbiddenResponse(event);
  }

  clearRefreshTokenCookie(event);

  const userinfo = verifyRefreshToken(refreshToken);
  if (!userinfo) {
    return forbiddenResponse(event);
  }

  ensureUserSeeds();
  const sysUser = getMockSysUserList().find(
    (item) => item.username === userinfo.username && item.deleted_at === 0,
  );
  if (!sysUser) {
    return forbiddenResponse(event);
  }

  const mockUser: import("~/utils/mock-data").UserInfo = {
    id: sysUser.id,
    username: sysUser.username,
    password: "",
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

  setRefreshTokenCookie(event, refreshToken);

  return useResponseSuccess({ accessToken });
});
