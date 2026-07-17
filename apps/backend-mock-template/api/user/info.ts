import { eventHandler } from "h3";
import { verifyAccessToken } from "~/utils/jwt-utils";
import { ensureUserSeeds, getMockSysUserList } from "~/utils/mock-data";
import { unAuthorizedResponse, useResponseSuccess } from "~/utils/response";

export default eventHandler((event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  ensureUserSeeds();
  const sysUser = getMockSysUserList().find(
    (item) => item.username === userinfo.username && item.deleted_at === 0,
  );
  if (!sysUser) {
    return unAuthorizedResponse(event);
  }

  // 返回与原 MOCK_USERS 格式兼容的用户信息
  const roles =
    sysUser.username === "vben" ? ["super"] : sysUser.username === "admin" ? ["admin"] : ["user"];
  const homePath =
    sysUser.username === "vben"
      ? "/analytics"
      : sysUser.username === "admin"
        ? "/system/user"
        : "/analytics";

  return useResponseSuccess({
    id: sysUser.id,
    username: sysUser.username,
    realName: sysUser.nickname,
    roles,
    homePath,
  });
});
