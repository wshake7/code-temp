/**
 * RBAC 业务 mock 数据 — sys_user / sys_role / sys_user_role / sys_role_menu / sys_role_api。
 *
 * v2/v5: 字段对齐 backend/db/schema.sql；snake 内部存储，handler 出口转 camel
 * （见 utils/user-role-camel.ts）。
 *
 * 与 mock-auth.ts 的 MOCK_USERS（auth 登录用）分离：用户管理页走 mockSysUserList 种子。
 *
 * 依赖：buildSysRoleApiSeeds 需要 sys_api 种子先就绪，故单向依赖 mock-menu-api
 * （调用其导出的 buildSysApiSeeds）。
 */

import { placeholderHash } from "./shared";
import { buildSysApiSeeds, getMockSysApiList } from "./menu-api";

// ============================================================
// RBAC 业务 — sys_user / sys_role / sys_user_role / sys_role_menu / sys_role_api
// v2/v5: 字段对齐 backend/db/schema.sql；snake 内部存储，handler 出口转 camel。
// 与上面 MOCK_USERS（auth 登录用）分离：用户管理页走 mockSysUserList 种子。
// ============================================================

export interface SysUser {
  id: number;
  username: string;
  /** 密码哈希（demo 占位，不真实加密） */
  password_hash: string;
  nickname: string;
  email: string;
  phone: string;
  /** 头像 URL */
  avatar: string;
  /** 用户默认语言（软外键 → i18n_locale.code） */
  language_code: null | string;
  last_login_at: null | string;
  last_login_ip: string;
  remark: string;
  is_enabled: 0 | 1;
  /** 软删时间戳（毫秒）；0=未删 */
  deleted_at: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
}

export interface SysRole {
  id: number;
  /** 角色编码（创建后不可改） */
  code: string;
  name: string;
  /** 父角色 ID（自引用，支持层级继承） */
  parent_id: null | number;
  sort: number;
  remark: string;
  is_enabled: 0 | 1;
  deleted_at: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
}

/** 用户-角色关联（sys_user_role），复合主键 (user_id, role_id) */
export interface SysUserRole {
  user_id: number;
  role_id: number;
  created_at: string;
  created_by: number;
}

/** 角色-菜单授权（sys_role_menu），复合主键 (role_id, menu_id) */
export interface SysRoleMenu {
  role_id: number;
  menu_id: number;
  created_at: string;
  created_by: number;
}

/** 角色-接口授权（sys_role_api），复合主键 (role_id, api_id) */
export interface SysRoleApi {
  role_id: number;
  api_id: number;
  created_at: string;
  created_by: number;
}

/** 共享可变用户列表（sys_user） */
const mockSysUserList: SysUser[] = [];
export function getMockSysUserList() {
  return mockSysUserList;
}

/** 共享可变角色列表（sys_role） */
const mockSysRoleList: SysRole[] = [];
export function getMockSysRoleList() {
  return mockSysRoleList;
}

/** 共享可变 用户-角色 关联列表 */
const mockSysUserRoleList: SysUserRole[] = [];
export function getMockSysUserRoleList() {
  return mockSysUserRoleList;
}

/** 共享可变 角色-菜单 关联列表 */
const mockSysRoleMenuList: SysRoleMenu[] = [];
export function getMockSysRoleMenuList() {
  return mockSysRoleMenuList;
}

/** 共享可变 角色-接口 关联列表 */
const mockSysRoleApiList: SysRoleApi[] = [];
export function getMockSysRoleApiList() {
  return mockSysRoleApiList;
}

// ─── ID 生成 ───────────────────────────────────────────────
let sysUserIdSeq = 0;
function nextSysUserId(): number {
  sysUserIdSeq += 1;
  return sysUserIdSeq;
}
let sysRoleIdSeq = 0;
function nextSysRoleId(): number {
  sysRoleIdSeq += 1;
  return sysRoleIdSeq;
}

// ─── 用户纯函数 ─────────────────────────────────────────────

/** 创建用户；同时写 sys_user_role 关联。返回新建行（camel 化由 handler 完成）。 */
export function createSysUser(input: {
  username: string;
  password: string;
  nickname: string;
  email?: string;
  phone?: string;
  avatar?: string;
  languageCode?: null | string;
  isEnabled?: 0 | 1;
  remark?: string;
  roleIds?: number[];
}): SysUser {
  const id = nextSysUserId();
  const now = new Date().toISOString();
  const row: SysUser = {
    id,
    username: input.username,
    password_hash: placeholderHash(input.password),
    nickname: input.nickname,
    email: input.email ?? "",
    phone: input.phone ?? "",
    avatar: input.avatar ?? "",
    language_code: input.languageCode ?? null,
    last_login_at: null,
    last_login_ip: "",
    remark: input.remark ?? "",
    is_enabled: (input.isEnabled ?? 1) as 0 | 1,
    deleted_at: 0,
    created_at: now,
    updated_at: now,
    created_by: 0,
    updated_by: 0,
  };
  mockSysUserList.push(row);
  // 写用户-角色关联
  setUserRolesInternal(id, input.roleIds ?? []);
  return row;
}

/** 更新用户基本信息（不含密码、不含角色）。返回更新后行或 undefined。 */
export function updateSysUser(
  id: number,
  patch: Partial<{
    nickname: string;
    email: string;
    phone: string;
    avatar: string;
    languageCode: null | string;
    isEnabled: 0 | 1;
    remark: string;
  }>,
): SysUser | undefined {
  const idx = mockSysUserList.findIndex((u) => u.id === id && u.deleted_at === 0);
  if (idx < 0) return undefined;
  const before = mockSysUserList[idx];
  const next: SysUser = {
    ...before,
    ...(patch.nickname !== undefined ? { nickname: patch.nickname } : {}),
    ...(patch.email !== undefined ? { email: patch.email } : {}),
    ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
    ...(patch.avatar !== undefined ? { avatar: patch.avatar } : {}),
    ...(patch.languageCode !== undefined ? { language_code: patch.languageCode } : {}),
    ...(patch.isEnabled !== undefined ? { is_enabled: patch.isEnabled } : {}),
    ...(patch.remark !== undefined ? { remark: patch.remark } : {}),
    updated_at: new Date().toISOString(),
  };
  mockSysUserList[idx] = next;
  return next;
}

/** 软删用户；同时清 sys_user_role 关联。返回软删后行或 undefined。 */
export function softDeleteUser(id: number): SysUser | undefined {
  const idx = mockSysUserList.findIndex((u) => u.id === id && u.deleted_at === 0);
  if (idx < 0) return undefined;
  clearUserRoles(id);
  mockSysUserList[idx] = { ...mockSysUserList[idx], deleted_at: Date.now() };
  return mockSysUserList[idx];
}

/** 重置密码：写占位哈希。返回更新后行或 undefined。 */
export function resetUserPassword(id: number, password: string): SysUser | undefined {
  const idx = mockSysUserList.findIndex((u) => u.id === id && u.deleted_at === 0);
  if (idx < 0) return undefined;
  mockSysUserList[idx] = {
    ...mockSysUserList[idx],
    password_hash: placeholderHash(password),
    updated_at: new Date().toISOString(),
  };
  return mockSysUserList[idx];
}

/** 切换启停状态。返回更新后行或 undefined。 */
export function toggleUserStatus(id: number, isEnabled: 0 | 1): SysUser | undefined {
  return updateSysUser(id, { isEnabled });
}

/** 读取某用户的角色 ID 列表 */
export function getUserRoleIds(userId: number): number[] {
  return mockSysUserRoleList.filter((r) => r.user_id === userId).map((r) => r.role_id);
}

/** 全量替换某用户的角色（内部用，不带时间戳语义）。 */
function setUserRolesInternal(userId: number, roleIds: number[]): void {
  for (let i = mockSysUserRoleList.length - 1; i >= 0; i--) {
    if (mockSysUserRoleList[i].user_id === userId) {
      mockSysUserRoleList.splice(i, 1);
    }
  }
  const now = new Date().toISOString();
  for (const rid of roleIds) {
    mockSysUserRoleList.push({ user_id: userId, role_id: rid, created_at: now, created_by: 0 });
  }
}

/** 全量替换某用户的角色（对外，handler 用）。 */
export function setUserRoles(userId: number, roleIds: number[]): void {
  setUserRolesInternal(userId, roleIds);
}

/** 清除某用户的全部角色关联（用户软删时调用）。 */
export function clearUserRoles(userId: number): void {
  for (let i = mockSysUserRoleList.length - 1; i >= 0; i--) {
    if (mockSysUserRoleList[i].user_id === userId) {
      mockSysUserRoleList.splice(i, 1);
    }
  }
}

/** 统计某角色下的用户数（未软删用户）。 */
export function countUsersByRole(roleId: number): number {
  const userIds = new Set(
    mockSysUserRoleList.filter((r) => r.role_id === roleId).map((r) => r.user_id),
  );
  return mockSysUserList.filter((u) => userIds.has(u.id) && u.deleted_at === 0).length;
}

/** username 唯一校验（软删感知：(username, deleted_at) 唯一）。 */
export function isUsernameTaken(username: string, excludeId?: number): boolean {
  return mockSysUserList.some(
    (u) =>
      u.deleted_at === 0 &&
      u.username === username &&
      (excludeId === undefined || u.id !== excludeId),
  );
}

// ─── 角色纯函数 ─────────────────────────────────────────────

/** 创建角色。返回新建行。 */
export function createSysRole(input: {
  code: string;
  name: string;
  parentId?: null | number;
  sort?: number;
  isEnabled?: 0 | 1;
  remark?: string;
}): SysRole {
  const id = nextSysRoleId();
  const now = new Date().toISOString();
  const row: SysRole = {
    id,
    code: input.code,
    name: input.name,
    parent_id: input.parentId ?? null,
    sort: input.sort ?? 0,
    remark: input.remark ?? "",
    is_enabled: (input.isEnabled ?? 1) as 0 | 1,
    deleted_at: 0,
    created_at: now,
    updated_at: now,
    created_by: 0,
    updated_by: 0,
  };
  mockSysRoleList.push(row);
  return row;
}

/** 更新角色（code 不可改）。parentId 变更时做成环检测。返回更新后行或 undefined。 */
export function updateSysRole(
  id: number,
  patch: Partial<{
    name: string;
    parentId: null | number;
    sort: number;
    isEnabled: 0 | 1;
    remark: string;
  }>,
): { ok: true; row: SysRole } | { ok: false; reason: string } {
  const idx = mockSysRoleList.findIndex((r) => r.id === id && r.deleted_at === 0);
  if (idx < 0) return { ok: false, reason: `role ${id} not found` };

  // parentId 成环检测：新父不能是自己，也不能是自己的后代
  if (patch.parentId !== undefined) {
    let pid = patch.parentId;
    if (pid === id) return { ok: false, reason: "parentId 不能是自己" };
    if (pid !== null) {
      // 沿父链向上找，若遇到自己则成环
      const visited = new Set<number>();
      let cur: null | number = pid;
      while (cur !== null && !visited.has(cur)) {
        visited.add(cur);
        if (cur === id) return { ok: false, reason: "不能将角色移到自身后代下（成环）" };
        const parent = mockSysRoleList.find((r) => r.id === cur && r.deleted_at === 0);
        cur = parent?.parent_id ?? null;
      }
    }
  }

  const before = mockSysRoleList[idx];
  const next: SysRole = {
    ...before,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.parentId !== undefined ? { parent_id: patch.parentId } : {}),
    ...(patch.sort !== undefined ? { sort: patch.sort } : {}),
    ...(patch.isEnabled !== undefined ? { is_enabled: patch.isEnabled } : {}),
    ...(patch.remark !== undefined ? { remark: patch.remark } : {}),
    updated_at: new Date().toISOString(),
  };
  mockSysRoleList[idx] = next;
  return { ok: true, row: next };
}

/** 角色是否有子角色（未软删）。 */
export function hasRoleChildren(id: number): boolean {
  return mockSysRoleList.some((r) => r.parent_id === id && r.deleted_at === 0);
}

/** 角色是否有关联用户（未软删用户）。 */
export function hasRoleUsers(id: number): boolean {
  const userIds = new Set(
    mockSysUserRoleList.filter((r) => r.role_id === id).map((r) => r.user_id),
  );
  return mockSysUserList.some((u) => userIds.has(u.id) && u.deleted_at === 0);
}

/**
 * 软删角色：有关联用户或子角色 → 拒绝；否则清菜单/接口绑定后软删。
 * 返回 { ok, reason?, row? }。
 */
export function softDeleteRole(
  id: number,
): { ok: true; row: SysRole } | { ok: false; reason: string } {
  const exists = mockSysRoleList.find((r) => r.id === id && r.deleted_at === 0);
  if (!exists) return { ok: false, reason: `role ${id} not found` };
  if (hasRoleUsers(id)) return { ok: false, reason: "该角色下存在用户，请先移除用户角色绑定" };
  if (hasRoleChildren(id)) return { ok: false, reason: "请先删除子角色" };

  clearRoleBindings(id);
  const idx = mockSysRoleList.findIndex((r) => r.id === id);
  mockSysRoleList[idx] = { ...mockSysRoleList[idx], deleted_at: Date.now() };
  return { ok: true, row: mockSysRoleList[idx] };
}

/** 清除某角色的菜单/接口绑定（角色软删时调用）。 */
export function clearRoleBindings(roleId: number): void {
  clearRoleMenus(roleId);
  clearRoleApis(roleId);
}

/** code 唯一校验（软删感知）。 */
export function isRoleCodeTaken(code: string, excludeId?: number): boolean {
  return mockSysRoleList.some(
    (r) => r.deleted_at === 0 && r.code === code && (excludeId === undefined || r.id !== excludeId),
  );
}

/** 父角色是否存在且未软删。 */
export function isValidParentRole(parentId: number): boolean {
  return mockSysRoleList.some((r) => r.id === parentId && r.deleted_at === 0);
}

/** 读取某角色的菜单 ID 列表。 */
export function getRoleMenuIds(roleId: number): number[] {
  return mockSysRoleMenuList.filter((r) => r.role_id === roleId).map((r) => r.menu_id);
}

/** 全量替换某角色的菜单授权。 */
export function setRoleMenus(roleId: number, menuIds: number[]): number[] {
  clearRoleMenus(roleId);
  const now = new Date().toISOString();
  for (const mid of menuIds) {
    mockSysRoleMenuList.push({ role_id: roleId, menu_id: mid, created_at: now, created_by: 0 });
  }
  return menuIds;
}

/** 清除某角色的菜单授权。 */
function clearRoleMenus(roleId: number): void {
  for (let i = mockSysRoleMenuList.length - 1; i >= 0; i--) {
    if (mockSysRoleMenuList[i].role_id === roleId) {
      mockSysRoleMenuList.splice(i, 1);
    }
  }
}

/** 读取某角色的接口 ID 列表。 */
export function getRoleApiIds(roleId: number): number[] {
  return mockSysRoleApiList.filter((r) => r.role_id === roleId).map((r) => r.api_id);
}

/** 全量替换某角色的接口授权。 */
export function setRoleApis(roleId: number, apiIds: number[]): number[] {
  clearRoleApis(roleId);
  const now = new Date().toISOString();
  for (const aid of apiIds) {
    mockSysRoleApiList.push({ role_id: roleId, api_id: aid, created_at: now, created_by: 0 });
  }
  return apiIds;
}

/** 清除某角色的接口授权。 */
function clearRoleApis(roleId: number): void {
  for (let i = mockSysRoleApiList.length - 1; i >= 0; i--) {
    if (mockSysRoleApiList[i].role_id === roleId) {
      mockSysRoleApiList.splice(i, 1);
    }
  }
}

/** 清除所有角色对该菜单的授权（菜单软删前调用） */
export function clearRoleMenusByMenuId(menuId: number): void {
  for (let i = mockSysRoleMenuList.length - 1; i >= 0; i--) {
    if (mockSysRoleMenuList[i].menu_id === menuId) {
      mockSysRoleMenuList.splice(i, 1);
    }
  }
}

/** 清除所有角色对该接口的授权（接口软删前调用） */
export function clearRoleApisByApiId(apiId: number): void {
  for (let i = mockSysRoleApiList.length - 1; i >= 0; i--) {
    if (mockSysRoleApiList[i].api_id === apiId) {
      mockSysRoleApiList.splice(i, 1);
    }
  }
}

// ─── 种子 ───────────────────────────────────────────────────

/** 种子：角色（3 个，对齐 MOCK_USERS 三用户）。 */
function buildSysRoleSeeds(): SysRole[] {
  const now = "2025-01-10T08:00:00.000Z";
  const defs: SysRole[] = [
    {
      id: 1,
      code: "super_admin",
      name: "超级管理员",
      parent_id: null,
      sort: 1,
      remark: "系统内置,不可删除",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 2,
      code: "admin",
      name: "系统管理员",
      parent_id: 1,
      sort: 10,
      remark: "可管理用户/角色/字典/国际化",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 3,
      code: "user",
      name: "普通用户",
      parent_id: 1,
      sort: 99,
      remark: "仅看仪表盘",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
  ];
  return defs;
}

/** 种子：用户（3 个，与 MOCK_USERS 对齐）。 */
function buildSysUserSeeds(): SysUser[] {
  const now = "2025-01-10T08:00:00.000Z";
  const defs: SysUser[] = [
    {
      id: 1,
      username: "vben",
      password_hash: placeholderHash("123456"),
      nickname: "Vben",
      email: "vben@trellis.cloud",
      phone: "13800000001",
      avatar: "",
      language_code: "zh-CN",
      last_login_at: "2026-06-20T01:12:33.000Z",
      last_login_ip: "10.0.0.12",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: "2025-01-10T00:00:00.000Z",
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 2,
      username: "admin",
      password_hash: placeholderHash("123456"),
      nickname: "Admin",
      email: "admin@trellis.cloud",
      phone: "13800000002",
      avatar: "",
      language_code: "zh-CN",
      last_login_at: "2026-06-20T00:55:14.000Z",
      last_login_ip: "10.0.0.45",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: "2025-03-12T02:30:00.000Z",
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 3,
      username: "jack",
      password_hash: placeholderHash("123456"),
      nickname: "Jack",
      email: "jack@trellis.cloud",
      phone: "13800000003",
      avatar: "",
      language_code: "en-US",
      last_login_at: "2026-06-19T09:42:01.000Z",
      last_login_ip: "10.0.1.108",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: "2025-05-08T03:15:00.000Z",
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
  ];
  return defs;
}

/** 种子：用户-角色关联（3 用户对齐 MOCK_USERS）。 */
function buildSysUserRoleSeeds(): SysUserRole[] {
  const now = "2025-01-10T08:00:00.000Z";
  const pairs: Array<[number, number[]]> = [
    [1, [1]], // vben → super_admin
    [2, [2]], // admin → admin
    [3, [3]], // jack → user
  ];
  const rows: SysUserRole[] = [];
  for (const [uid, rids] of pairs) {
    for (const rid of rids) {
      rows.push({ user_id: uid, role_id: rid, created_at: now, created_by: 0 });
    }
  }
  return rows;
}

/** 种子：角色-菜单授权（对齐原 MOCK_MENUS：vben full / admin partial / jack dashboard）。 */
function buildSysRoleMenuSeeds(): SysRoleMenu[] {
  const now = "2025-01-10T08:00:00.000Z";
  const rows: SysRoleMenu[] = [];

  // Dashboard branch + buttons included where useful.
  const dashboard = [100, 101, 102];
  // 日志审计（单 MENU 300；301/302 为 BUTTON，父级授权即可发码）
  const logBranch = [300];
  // 任务调度（一级 MENU 400；401/402 为页内 Tab 权限按钮）
  const taskBranch = [400];
  // Full system menus + button children
  const systemFull = [
    200, 201, 2011, 2012, 2013, 202, 2021, 203, 204, 205, 2051, 2052, 2053, 206, 2061,
  ];
  // Partial system: user/role/dict/i18n (+ user/role buttons)
  const systemPartial = [200, 201, 2011, 2012, 2013, 202, 2021, 203, 204];

  // super_admin(id=1) = vben full
  for (const mid of [...dashboard, ...logBranch, ...taskBranch, ...systemFull]) {
    rows.push({ role_id: 1, menu_id: mid, created_at: now, created_by: 0 });
  }
  // admin(id=2) = partial system + dashboard + 日志 + 任务调度
  for (const mid of [...dashboard, ...logBranch, ...taskBranch, ...systemPartial]) {
    rows.push({ role_id: 2, menu_id: mid, created_at: now, created_by: 0 });
  }
  // user(id=3) = jack dashboard only
  for (const mid of dashboard) {
    rows.push({ role_id: 3, menu_id: mid, created_at: now, created_by: 0 });
  }
  return rows;
}

/** 种子：角色-接口授权（按 path 解析 id，避免硬编码）。 */
function buildSysRoleApiSeeds(): SysRoleApi[] {
  // role_api 依赖 sys_api 种子；ensureUserSeeds 可能早于 ensureMenuApiSeeds
  if (getMockSysApiList().length === 0) {
    buildSysApiSeeds();
  }
  const now = "2025-01-10T08:00:00.000Z";
  const rows: SysRoleApi[] = [];
  const active = getMockSysApiList().filter((a) => a.deleted_at === 0);

  // super_admin(id=1) 授权全部接口
  for (const api of active) {
    rows.push({ role_id: 1, api_id: api.id, created_at: now, created_by: 0 });
  }

  // admin(id=2) 授权用户管理 + 登录/API 日志 + 任务调度
  for (const api of active) {
    const isUser = api.path === "/api/system/user" || api.path.startsWith("/api/system/user/");
    const isLoginLog = api.path === "/api/system/login-log/list";
    const isApiLog = api.path === "/api/system/api-log/list";
    const isTask =
      api.path === "/api/system/task-config" ||
      api.path.startsWith("/api/system/task-config/") ||
      api.path === "/api/system/task-execution" ||
      api.path.startsWith("/api/system/task-execution/");
    if (isUser || isLoginLog || isApiLog || isTask) {
      rows.push({ role_id: 2, api_id: api.id, created_at: now, created_by: 0 });
    }
  }
  return rows;
}

/** 确保 user/role 种子已写入（幂等）。handler 入口调用。 */
export function ensureUserSeeds(): void {
  if (mockSysRoleList.length === 0) {
    mockSysRoleList.push(...buildSysRoleSeeds());
  }
  if (mockSysUserList.length === 0) {
    mockSysUserList.push(...buildSysUserSeeds());
  }
  if (mockSysUserRoleList.length === 0) {
    mockSysUserRoleList.push(...buildSysUserRoleSeeds());
  }
  if (mockSysRoleMenuList.length === 0) {
    mockSysRoleMenuList.push(...buildSysRoleMenuSeeds());
  }
  if (mockSysRoleApiList.length === 0) {
    mockSysRoleApiList.push(...buildSysRoleApiSeeds());
  }
}
