import { defineEventHandler, getQuery } from "h3";
import { ensureMenuApiSeeds, getMockSysApiList, type SysApi } from "~/utils/mock-data";
import { toCamelRow } from "~/utils/menu-api-camel";
import { usePageResponseSuccess, unAuthorizedResponse } from "~/utils/response";
import { verifyAccessToken } from "~/utils/session-utils";

/** 接口管理：分页列表（sys_api） */
export default defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }
  ensureMenuApiSeeds();

  const query = getQuery(event);
  const { page = 1, pageSize = 20, name, path, method, group, status } = query;
  const shared = getMockSysApiList();

  let filtered: SysApi[] = shared.filter((a) => a.deleted_at === 0);
  if (name) {
    const q = String(name).toLowerCase();
    filtered = filtered.filter((a) => a.name.toLowerCase().includes(q));
  }
  if (path) {
    const q = String(path).toLowerCase();
    filtered = filtered.filter((a) => a.path.toLowerCase().includes(q));
  }
  if (method && method !== "全部") {
    filtered = filtered.filter((a) => a.method === String(method).toUpperCase());
  }
  if (group && group !== "全部") {
    filtered = filtered.filter((a) => a.api_group === String(group));
  }
  if (["0", "1"].includes(status as string)) {
    filtered = filtered.filter((a) => a.is_enabled === Number(status));
  }
  filtered.sort((a, b) => a.id - b.id);

  return usePageResponseSuccess(page as string, pageSize as string, filtered.map(toCamelRow));
});
