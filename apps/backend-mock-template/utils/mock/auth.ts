/**
 * 认证/会话相关静态 mock 数据。
 *
 * - UserInfo：会话用户信息类型（session-utils / login 共用）。
 * - MOCK_USERS / MOCK_CODES：历史登录数据，现已被 RBAC sys_user 种子取代，
 *   但作为公开 demo 数据保留（无 handler 直接引用）。
 * - TIME_ZONE_OPTIONS：时区下拉选项，timezone 接口在用。
 *
 * 注意：原 mock-data.ts 中的 getMockUserList / mockUserList（空 any[]，无任何引用）
 * 已作为死代码删除。
 */

export interface UserInfo {
  id: number;
  password: string;
  realName: string;
  roles: string[];
  username: string;
  homePath?: string;
}

export interface TimezoneOption {
  offset: number;
  timezone: string;
}

/**
 * 统一用户数据源：登录 + 用户管理共用。
 * password_hash 使用 demo$bcrypt$ 前缀占位，登录验证时提取后缀比对明文。
 */
export const MOCK_USERS: UserInfo[] = [
  {
    id: 1,
    password: "123456",
    realName: "Vben",
    roles: ["super"],
    username: "vben",
  },
  {
    id: 2,
    password: "123456",
    realName: "Admin",
    roles: ["admin"],
    username: "admin",
    homePath: "/system/user",
  },
  {
    id: 3,
    password: "123456",
    realName: "Jack",
    roles: ["user"],
    username: "jack",
    homePath: "/analytics",
  },
];

export const MOCK_CODES = [
  // super
  {
    codes: ["AC_100100", "AC_100110", "AC_100120", "AC_100010"],
    username: "vben",
  },
  {
    // admin
    codes: ["AC_100010", "AC_100020", "AC_100030"],
    username: "admin",
  },
  {
    // user
    codes: ["AC_1000001", "AC_1000002"],
    username: "jack",
  },
];

/**
 * 时区选项
 */
export const TIME_ZONE_OPTIONS: TimezoneOption[] = [
  {
    offset: -5,
    timezone: "America/New_York",
  },
  {
    offset: 0,
    timezone: "Europe/London",
  },
  {
    offset: 8,
    timezone: "Asia/Shanghai",
  },
  {
    offset: 9,
    timezone: "Asia/Tokyo",
  },
  {
    offset: 9,
    timezone: "Asia/Seoul",
  },
];