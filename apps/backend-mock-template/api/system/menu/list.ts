import { defineEventHandler, getQuery } from "h3";
import { ensureMenuApiSeeds, getMockSysMenuList, type SysMenu } from "~/utils/mock-data";
import { toCamelRow } from "~/utils/menu-api-camel";
import { usePageResponseSuccess, unAuthorizedResponse } from "~/utils/response";
import { verifyAccessToken } from "~/utils/session-utils";

/**
 * 菜单管理：分页列表（sys_menu）。
 * 树形菜单不分页也常见，但为与 dict 一致走分页接口；前端按 parent_id 自行组树。
 */
export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }
  ensureMenuApiSeeds();

  const query = getQuery(event);
  const { page = 1, pageSize = 20, name, type, permissionCode, status } = query;
  const shared = getMockSysMenuList();

  let filtered: SysMenu[] = shared.filter((m) => m.deleted_at === 0);
  if (name) {
    const q = String(name);
    filtered = filtered.filter((m) => m.name.includes(q));
  }
  if (type && type !== "全部") {
    filtered = filtered.filter((m) => m.type === type);
  }
  if (permissionCode) {
    const q = String(permissionCode).toLowerCase();
    filtered = filtered.filter((m) =>
      m.permission_code ? m.permission_code.toLowerCase().includes(q) : false,
    );
  }
  if (["0", "1"].includes(status as string)) {
    filtered = filtered.filter((m) => m.is_enabled === Number(status));
  }
  // 按 sort 升序、再 id 升序
  filtered.sort((a, b) => a.sort - b.sort || a.id - b.id);

  return usePageResponseSuccess(page as string, pageSize as string, filtered.map(toCamelRow));
});
