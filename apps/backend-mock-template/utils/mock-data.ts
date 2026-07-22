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

// ─── 动态菜单（按角色分配 Dashboard + System）─────────────────

const dashboardMenus = [
  {
    meta: {
      order: -1,
      title: "page.dashboard.title",
    },
    name: "Dashboard",
    path: "/dashboard",
    redirect: "/analytics",
    children: [
      {
        name: "Analytics",
        path: "/analytics",
        component: "/dashboard/analytics/index",
        meta: {
          affixTab: true,
          title: "page.dashboard.analytics",
        },
      },
      {
        name: "Workspace",
        path: "/workspace",
        component: "/dashboard/workspace/index",
        meta: {
          title: "page.dashboard.workspace",
        },
      },
    ],
  },
];

const systemMenus = (level: "full" | "partial") => {
  const fullChildren = [
    {
      name: "SystemUser",
      path: "/system/user",
      component: "/system/user/index",
      meta: {
        icon: "lucide:user-cog",
        order: 1,
        title: "system.user.title",
      },
    },
    {
      name: "SystemRole",
      path: "/system/role",
      component: "/system/role/index",
      meta: {
        icon: "lucide:shield-user",
        order: 2,
        title: "system.role.title",
      },
    },
    {
      name: "SystemDict",
      path: "/system/dict",
      component: "/system/dict/index",
      meta: {
        icon: "lucide:book-marked",
        order: 3,
        title: "system.dict.title",
      },
    },
    {
      name: "SystemI18n",
      path: "/system/i18n",
      component: "/system/i18n/index",
      meta: {
        icon: "lucide:languages",
        order: 4,
        title: "system.i18n.title",
      },
    },
    {
      name: "SystemMenu",
      path: "/system/menu",
      component: "/system/menu/index",
      meta: {
        icon: "lucide:menu",
        order: 5,
        title: "system.menu.title",
      },
    },
    {
      name: "SystemApi",
      path: "/system/api",
      component: "/system/api/index",
      meta: {
        icon: "lucide:terminal",
        order: 6,
        title: "system.api.title",
      },
    },
  ];
  const partialChildren = [
    {
      name: "SystemUser",
      path: "/system/user",
      component: "/system/user/index",
      meta: {
        icon: "lucide:user-cog",
        order: 1,
        title: "system.user.title",
      },
    },
    {
      name: "SystemRole",
      path: "/system/role",
      component: "/system/role/index",
      meta: {
        icon: "lucide:shield-user",
        order: 2,
        title: "system.role.title",
      },
    },
    {
      name: "SystemDict",
      path: "/system/dict",
      component: "/system/dict/index",
      meta: {
        icon: "lucide:book-marked",
        order: 3,
        title: "system.dict.title",
      },
    },
    {
      name: "SystemI18n",
      path: "/system/i18n",
      component: "/system/i18n/index",
      meta: {
        icon: "lucide:languages",
        order: 4,
        title: "system.i18n.title",
      },
    },
  ];
  return [
    {
      meta: {
        icon: "lucide:settings",
        order: 2005,
        title: "system.title",
      },
      name: "System",
      path: "/system",
      redirect: "/system/user",
      children: level === "full" ? fullChildren : partialChildren,
    },
  ];
};

/** 日志审计菜单（对齐 sys_login_log；full 角色可见） */
const logMenus = () => [
  {
    meta: {
      icon: "lucide:logs",
      order: 2004,
      title: "log.title",
    },
    name: "Log",
    path: "/log",
    redirect: "/log/login-log",
    children: [
      {
        name: "LogLoginLog",
        path: "/log/login-log",
        component: "/log/login-log/index",
        meta: {
          icon: "lucide:user-lock",
          order: 1,
          title: "log.loginLog.title",
        },
      },
    ],
  },
];

export const MOCK_MENUS = [
  {
    menus: [...dashboardMenus, ...logMenus(), ...systemMenus("full")],
    username: "vben",
  },
  {
    menus: [...dashboardMenus, ...logMenus(), ...systemMenus("partial")],
    username: "admin",
  },
  {
    menus: [...dashboardMenus],
    username: "jack",
  },
];

export const MOCK_MENU_LIST = [
  {
    id: 1,
    name: "Workspace",
    status: 1,
    type: "menu",
    icon: "mdi:dashboard",
    path: "/workspace",
    component: "/dashboard/workspace/index",
    meta: {
      icon: "carbon:workspace",
      title: "page.dashboard.workspace",
      affixTab: true,
      order: 0,
    },
  },
  {
    id: 2,
    meta: {
      icon: "carbon:settings",
      order: 9997,
      title: "system.title",
      badge: "new",
      badgeType: "normal",
      badgeVariants: "primary",
    },
    status: 1,
    type: "catalog",
    name: "System",
    path: "/system",
    children: [
      {
        id: 201,
        pid: 2,
        path: "/system/menu",
        name: "SystemMenu",
        authCode: "System:Menu:List",
        status: 1,
        type: "menu",
        meta: {
          icon: "carbon:menu",
          title: "system.menu.title",
        },
        component: "/system/menu/list",
        children: [
          {
            id: 20_101,
            pid: 201,
            name: "SystemMenuCreate",
            status: 1,
            type: "button",
            authCode: "System:Menu:Create",
            meta: { title: "common.create" },
          },
          {
            id: 20_102,
            pid: 201,
            name: "SystemMenuEdit",
            status: 1,
            type: "button",
            authCode: "System:Menu:Edit",
            meta: { title: "common.edit" },
          },
          {
            id: 20_103,
            pid: 201,
            name: "SystemMenuDelete",
            status: 1,
            type: "button",
            authCode: "System:Menu:Delete",
            meta: { title: "common.delete" },
          },
        ],
      },
      {
        id: 202,
        pid: 2,
        path: "/system/dept",
        name: "SystemDept",
        status: 1,
        type: "menu",
        authCode: "System:Dept:List",
        meta: {
          icon: "carbon:container-services",
          title: "system.dept.title",
        },
        component: "/system/dept/list",
        children: [
          {
            id: 20_401,
            pid: 202,
            name: "SystemDeptCreate",
            status: 1,
            type: "button",
            authCode: "System:Dept:Create",
            meta: { title: "common.create" },
          },
          {
            id: 20_402,
            pid: 202,
            name: "SystemDeptEdit",
            status: 1,
            type: "button",
            authCode: "System:Dept:Edit",
            meta: { title: "common.edit" },
          },
          {
            id: 20_403,
            pid: 202,
            name: "SystemDeptDelete",
            status: 1,
            type: "button",
            authCode: "System:Dept:Delete",
            meta: { title: "common.delete" },
          },
        ],
      },
    ],
  },
  {
    id: 9,
    meta: {
      badgeType: "dot",
      order: 9998,
      title: "demos.vben.title",
      icon: "carbon:data-center",
    },
    name: "Project",
    path: "/vben-admin",
    type: "catalog",
    status: 1,
    children: [
      {
        id: 901,
        pid: 9,
        name: "VbenDocument",
        path: "/vben-admin/document",
        component: "IFrameView",
        type: "embedded",
        status: 1,
        meta: {
          icon: "carbon:book",
          iframeSrc: "https://doc.vben.pro",
          title: "demos.vben.document",
        },
      },
      {
        id: 902,
        pid: 9,
        name: "VbenGithub",
        path: "/vben-admin/github",
        component: "IFrameView",
        type: "link",
        status: 1,
        meta: {
          icon: "carbon:logo-github",
          link: "https://github.com/vbenjs/vue-vben-admin",
          title: "Github",
        },
      },
      {
        id: 903,
        pid: 9,
        name: "VbenAntdv",
        path: "/vben-admin/antdv",
        component: "IFrameView",
        type: "link",
        status: 0,
        meta: {
          icon: "carbon:hexagon-vertical-solid",
          badgeType: "dot",
          link: "https://ant.vben.pro",
          title: "demos.vben.antdv",
        },
      },
    ],
  },
  {
    id: 10,
    component: "_core/about/index",
    type: "menu",
    status: 1,
    meta: {
      icon: "lucide:copyright",
      order: 9999,
      title: "demos.vben.about",
    },
    name: "About",
    path: "/about",
  },
];

export function getMenuIds(
  menus: { id: number; children?: { id: number; children?: unknown[] }[] }[],
): number[] {
  const ids: number[] = [];
  menus.forEach((item) => {
    ids.push(item.id);
    if (item.children && item.children.length > 0) {
      ids.push(
        ...getMenuIds(
          item.children as { id: number; children?: { id: number; children?: unknown[] }[] }[],
        ),
      );
    }
  });
  return ids;
}

/**
 * 共享的可变用户列表，给 system/user 的 CRUD handler 使用。
 */
const mockUserList: any[] = [];

export function getMockUserList() {
  return mockUserList;
}

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

// ============================================================
// 字典管理（dict_type / dict_data）
// 字段对齐 Open Design 原型 mql4ww2b-schema.sql
// ============================================================

export interface DictType {
  id: number;
  code: string;
  name: string;
  remark: string;
  is_enabled: 0 | 1;
  deleted_at: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
}

export interface DictData {
  id: number;
  type_id: number;
  value: string;
  label: string;
  sort: number;
  is_default: 0 | 1;
  /**
   * 归属平台：general = 跨前端通用；react-admin / vue-admin 表示只对对应前端可见。
   * 写入 / 修改时由 mock 校验，非法值 400。
   */
  platform: string;
  /**
   * 预设样式标识：default = 无样式；其余值由前端按标识映射 ant Tag 颜色 / vben Tag color。
   * 写入 / 修改时由 mock 校验，非法值 400。
   */
  tag_type: string;
  is_enabled: 0 | 1;
  deleted_at: number;
  remark: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  /**
   * 关联的字典类型编码，仅在 list 接口里 join 后返回；其他接口不返回该字段。
   */
  typeCode?: string;
}

/**
 * 字典项允许的 platform 取值（与 schema v8 注释 + 前端 VITE_APP_PLATFORM 对齐）。
 * 写入/修改时校验，非法值 400。
 */
export const ALLOWED_DICT_DATA_PLATFORMS = ["general", "react-admin", "vue-admin"] as const;
export type DictDataPlatform = (typeof ALLOWED_DICT_DATA_PLATFORMS)[number];

export function isAllowedDictDataPlatform(v: unknown): v is DictDataPlatform {
  return typeof v === "string" && (ALLOWED_DICT_DATA_PLATFORMS as readonly string[]).includes(v);
}

/**
 * 字典项允许的 tag_type 取值（与 schema v9 注释 + 前端 TAG_TYPE_OPTIONS 对齐）。
 *
 * 与前端的字面量联合类型对齐：前端 `DictData.tagType` 声明为
 * `LiteralUnion<PresetColorType | PresetStatusColorType>`（antd `<Tag color>` 的
 * 官方签名），可取 antd 13 项 preset 色 + 13 项 inverse 色（`*-inverse`）+ 5 项
 * 状态色（default / primary / success / warning / error / processing）。本枚举是
 * 它们的 17 项子集（不含 inverse），写入/修改时校验，非法值 400。
 */
export const ALLOWED_TAG_TYPES = [
  "default",
  "primary",
  "success",
  "warning",
  "error",
  "processing",
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
] as const;
export type TagType = (typeof ALLOWED_TAG_TYPES)[number];

export function isAllowedTagType(v: unknown): v is TagType {
  return typeof v === "string" && (ALLOWED_TAG_TYPES as readonly string[]).includes(v);
}

/**
 * 共享的可变字典类型列表，给 system/dict-type 的 CRUD handler 使用。
 */
const mockDictTypeList: DictType[] = [];

export function getMockDictTypeList() {
  return mockDictTypeList;
}

/**
 * 共享的可变字典数据列表，给 system/dict-data 的 CRUD handler 使用。
 */
const mockDictDataList: DictData[] = [];

export function getMockDictDataList() {
  return mockDictDataList;
}

/**
 * 生成 mock 自增 ID（与 user 列表隔离，足够 demo 使用）。
 */
function nextDictId(): number {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

function isoNow(): string {
  return new Date().toISOString();
}

/**
 * 惰性种子：首次 list 调用时填充。每个 typeId 显式固定，方便 dict-data 关联。
 */
function buildDictTypeSeeds(): DictType[] {
  const now = "2025-01-01T00:00:00.000Z";
  const baseTypes: DictType[] = [
    {
      id: 1,
      code: "sys_user_sex",
      name: "用户性别",
      remark: "用户性别字典",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 2,
      code: "sys_yes_no",
      name: "系统是否",
      remark: "通用 Y/N",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 3,
      code: "sys_menu_type",
      name: "菜单类型",
      remark: "DIR / MENU / BUTTON",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 4,
      code: "sys_notice_type",
      name: "通知类型",
      remark: "通知/公告/提醒",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 5,
      code: "sys_switch_status",
      name: "开关状态",
      remark: "跨模块通用启用/禁用状态",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 6,
      code: "sys_default_status",
      name: "默认状态",
      remark: "是否默认值（用于字典项 / 语言等场景的「默认/否」列）",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 10,
      code: "sys_platform",
      name: "平台",
      remark: "前端归属平台（general / react-admin / vue-admin）",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
  ];
  return baseTypes;
}

function buildDictDataSeeds(): DictData[] {
  const now = "2025-01-01T00:00:00.000Z";
  const seed = (
    id: number,
    type_id: number,
    value: string,
    label: string,
    sort: number,
    is_default: 0 | 1 = 0,
    platform: DictData["platform"] = "general",
    tag_type: DictData["tag_type"] = "default",
  ): DictData => ({
    id,
    type_id,
    value,
    label,
    sort,
    is_default,
    platform,
    tag_type,
    is_enabled: 1,
    deleted_at: 0,
    remark: "",
    created_at: now,
    updated_at: now,
    created_by: 0,
    updated_by: 0,
  });
  // 字典类型单份 1..5；字典项 1001.. 起
  const entries: DictData[] = [];
  // sys_user_sex (type_id=1)
  entries.push(seed(1001, 1, "0", "男", 0, 1));
  entries.push(seed(1002, 1, "1", "女", 1));
  entries.push(seed(1003, 1, "2", "未知", 2));
  // sys_yes_no (type_id=2)
  entries.push(seed(1011, 2, "Y", "是", 0, 1));
  entries.push(seed(1012, 2, "N", "否", 1));
  // sys_menu_type (type_id=3)
  entries.push(seed(1021, 3, "DIR", "目录", 0));
  entries.push(seed(1022, 3, "MENU", "菜单", 1));
  entries.push(seed(1023, 3, "BUTTON", "按钮", 2));
  // sys_notice_type (type_id=4)
  entries.push(seed(1031, 4, "1", "通知", 0));
  entries.push(seed(1032, 4, "2", "公告", 1));
  entries.push(seed(1033, 4, "3", "提醒", 2));
  // sys_switch_status (type_id=5)
  // sort 单调递增 1..6（对齐 backend/db/schema_data.sql 与 design.md）
  entries.push(seed(1041, 5, "enabled", "启用", 1, 0, "general", ""));
  entries.push(seed(1042, 5, "disabled", "禁用", 2, 1, "general", ""));
  entries.push(seed(1051, 5, "enabled", "启用", 3, 0, "react-admin", "success"));
  entries.push(seed(1052, 5, "disabled", "禁用", 4, 1, "react-admin", "error"));
  entries.push(seed(1061, 5, "enabled", "启用", 5, 0, "vue-admin", "success"));
  entries.push(seed(1062, 5, "disabled", "禁用", 6, 1, "vue-admin", "error"));
  // sys_default_status (type_id=6)
  // value 约定：'default' = 默认（isDefault=1）/ 'not-default' = 否（isDefault=0）
  // 单平台 general；tag_type 与 react-admin / vue-admin 两端 Tag 颜色对齐
  // （value=default → processing；value=not-default → default）。
  // name 列填 '-' 表示"否"，与现有 i18n 列"否"占位一致。
  entries.push(seed(1071, 6, "default", "默认", 0, 1, "general", "processing"));
  entries.push(seed(1072, 6, "not-default", "-", 1, 0, "general", "default"));
  entries.push(seed(1081, 6, "default", "默认", 2, 1, "react-admin", "processing"));
  entries.push(seed(1082, 6, "not-default", "-", 3, 0, "react-admin", "default"));
  entries.push(seed(1091, 6, "default", "默认", 4, 1, "vue-admin", "processing"));
  entries.push(seed(1092, 6, "not-default", "-", 5, 0, "vue-admin", "default"));
  // sys_platform (type_id=10)
  // 平台字段的字典驱动源：value = platform 字符串，platform 字段 = value（自洽）。
  // tag_type 全部置空，平台 CellTag 不着色（与 design.md「sys_platform 字典契约」一致）。
  entries.push(seed(2001, 10, "general", "通用", 1, 1, "general", ""));
  entries.push(seed(2002, 10, "react-admin", "React Admin", 2, 0, "react-admin", ""));
  entries.push(seed(2003, 10, "vue-admin", "Vue Admin", 3, 0, "vue-admin", ""));
  return entries;
}

/**
 * 首次访问 list 时把种子写入共享 list；之后 create/update/delete 改它，list 不会重置。
 */
export function ensureDictSeeds(): void {
  if (mockDictTypeList.length === 0) {
    mockDictTypeList.push(...buildDictTypeSeeds());
  }
  if (mockDictDataList.length === 0) {
    mockDictDataList.push(...buildDictDataSeeds());
  }
}

export {
  nextDictId,
  isoNow,
  nextI18nId,
  getMockI18nLocaleList,
  getMockI18nTranslationList,
  ensureI18nSeeds,
};

// ============================================================
// I18n（i18n_locale / i18n_translation）
// 字段对齐 Open Design 原型 mql4ww2b-schema.sql 的 i18n_locale / i18n_translation
// ============================================================

export interface I18nLocale {
  id: number;
  code: string;
  name: string;
  is_default: 0 | 1;
  sort: number;
  remark: string;
  is_enabled: 0 | 1;
  deleted_at: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
}

export interface I18nTranslation {
  id: number;
  locale_id: number;
  translation_key: string;
  value: string;
  remark: string;
  is_enabled: 0 | 1;
  deleted_at: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  /** 仅在 list 接口 join 后返回 */
  localeCode?: string;
}

/**
 * 共享的可变 i18n_locale 列表，给 system/i18n-locale 的 CRUD handler 使用。
 */
const mockI18nLocaleList: I18nLocale[] = [];

function getMockI18nLocaleList() {
  return mockI18nLocaleList;
}

/**
 * 共享的可变 i18n_translation 列表，给 system/i18n-translation 的 CRUD handler 使用。
 */
const mockI18nTranslationList: I18nTranslation[] = [];

function getMockI18nTranslationList() {
  return mockI18nTranslationList;
}

/**
 * 生成 mock 自增 ID（与 dict / user 列表隔离，足够 demo 使用）。
 */
function nextI18nId(): number {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

/**
 * 惰性种子：首次 list 调用时填充。
 * 三个语言（zh-CN / en-US / ja-JP），每语言 8 条常见 UI 文案翻译。
 */
function buildI18nLocaleSeeds(): I18nLocale[] {
  const now = "2025-01-01T00:00:00.000Z";
  const base: Omit<I18nLocale, "id">[] = [
    {
      code: "zh-CN",
      name: "简体中文",
      is_default: 1,
      sort: 0,
      remark: "系统默认语言",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      code: "en-US",
      name: "English",
      is_default: 0,
      sort: 1,
      remark: "English (United States)",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      code: "ja-JP",
      name: "日本語",
      is_default: 0,
      sort: 2,
      remark: "Japanese (Japan)",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
  ];
  return base.map((b, idx) => ({ id: idx + 1, ...b }));
}

function buildI18nTranslationSeeds(): I18nTranslation[] {
  const now = "2025-01-01T00:00:00.000Z";
  // 8 条常见 UI 文案
  const seeds: Array<{ key: string; zh: string; en: string; ja: string }> = [
    { key: "common.confirm", zh: "确认", en: "Confirm", ja: "確認" },
    { key: "common.cancel", zh: "取消", en: "Cancel", ja: "キャンセル" },
    { key: "common.create", zh: "新建", en: "Create", ja: "新規" },
    { key: "common.edit", zh: "编辑", en: "Edit", ja: "編集" },
    { key: "common.delete", zh: "删除", en: "Delete", ja: "削除" },
    { key: "common.search", zh: "搜索", en: "Search", ja: "検索" },
    { key: "common.save", zh: "保存", en: "Save", ja: "保存" },
    { key: "common.refresh", zh: "刷新", en: "Refresh", ja: "更新" },
  ];
  const entries: I18nTranslation[] = [];
  // locale_id 1=zh-CN, 2=en-US, 3=ja-JP
  const groups: Array<{
    localeId: number;
    localeCode: string;
    pick: (s: (typeof seeds)[number]) => string;
  }> = [
    { localeId: 1, localeCode: "zh-CN", pick: (s) => s.zh },
    { localeId: 2, localeCode: "en-US", pick: (s) => s.en },
    { localeId: 3, localeCode: "ja-JP", pick: (s) => s.ja },
  ];
  let id = 1;
  for (const g of groups) {
    for (const s of seeds) {
      entries.push({
        id: id++,
        locale_id: g.localeId,
        translation_key: s.key,
        value: g.pick(s),
        remark: "",
        is_enabled: 1,
        deleted_at: 0,
        created_at: now,
        updated_at: now,
        created_by: 0,
        updated_by: 0,
        localeCode: g.localeCode,
      });
    }
  }
  return entries;
}

/**
 * 首次访问 list 时把种子写入共享 list；之后 create/update/delete 改它，list 不会重置。
 */
function ensureI18nSeeds(): void {
  if (mockI18nLocaleList.length === 0) {
    mockI18nLocaleList.push(...buildI18nLocaleSeeds());
  }
  if (mockI18nTranslationList.length === 0) {
    mockI18nTranslationList.push(...buildI18nTranslationSeeds());
  }
}

// ============================================================
// 菜单/接口管理（sys_menu / sys_api / sys_menu_api）
// 字段对齐 Open Design 原型 schema.sql 的 sys_menu / sys_api / sys_menu_api
// 内部 snake 存储，handler 边界转 camel（见 utils/menu-api-camel.ts）
// ============================================================

export type MenuType = "DIR" | "MENU" | "BUTTON";

export interface SysMenu {
  id: number;
  /** 父菜单 ID，NULL = 根 */
  parent_id: number | null;
  name: string;
  type: MenuType;
  /** 路由路径；仅 MENU 类型有效，DIR/BUTTON 为 NULL */
  path: string | null;
  /** 前端组件路径；仅 MENU 类型有效 */
  component: string | null;
  icon: string;
  /** 路由重定向；仅 MENU 类型，缺省 "" */
  redirect: string;
  /** 权限码；BUTTON 必填，MENU/DIR 可空 */
  permission_code: string | null;
  /** 物化路径，如 /1/11/，便于查祖先/子树；根为 /<id>/ */
  tree_path: string;
  /** 前端扩展 JSON 字符串（badge/hideInBreadcrumb/keepAlive/affix/activeMenu） */
  metadata: string | null;
  sort: number;
  is_hidden: 0 | 1;
  is_enabled: 0 | 1;
  deleted_at: number;
  remark: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
}

export interface SysApi {
  id: number;
  name: string;
  /** HTTP method: GET/POST/PUT/DELETE/PATCH/OPTIONS/HEAD */
  method: string;
  /** 接口路径，支持 :id 占位，不含 host */
  path: string;
  /** 权限码（与按钮权限码同构） */
  permission_code: string;
  /** 分组 */
  api_group: string;
  remark: string;
  is_enabled: 0 | 1;
  deleted_at: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
}

/** 菜单-API 绑定关联（sys_menu_api），复合主键 (menu_id, api_id) */
export interface SysMenuApi {
  menu_id: number;
  api_id: number;
  created_at: string;
  created_by: number;
}

const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"] as const;
export const HTTP_METHODS = [...ALLOWED_METHODS];
export type HttpMethod = (typeof ALLOWED_METHODS)[number];

export function isAllowedMethod(v: unknown): v is HttpMethod {
  return typeof v === "string" && (ALLOWED_METHODS as readonly string[]).includes(v.toUpperCase());
}

const MENU_TYPE_VALUES = ["DIR", "MENU", "BUTTON"] as const;
export function isAllowedMenuType(v: unknown): v is MenuType {
  return typeof v === "string" && (MENU_TYPE_VALUES as readonly string[]).includes(v);
}

/** 共享可变菜单列表 */
const mockSysMenuList: SysMenu[] = [];
export function getMockSysMenuList() {
  return mockSysMenuList;
}

/** 共享可变接口列表 */
const mockSysApiList: SysApi[] = [];
export function getMockSysApiList() {
  return mockSysApiList;
}

/** 共享可变菜单-接口绑定列表 */
const mockSysMenuApiList: SysMenuApi[] = [];
export function getMockSysMenuApiList() {
  return mockSysMenuApiList;
}

/** 生成菜单自增 ID（用计数器，便于 tree_path 稳定） */
let menuIdSeq = 0;
function nextMenuId(): number {
  menuIdSeq += 1;
  return menuIdSeq;
}

/** 生成接口自增 ID */
let apiIdSeq = 0;
function nextApiId(): number {
  apiIdSeq += 1;
  return apiIdSeq;
}

/**
 * 按 parent_id 计算物化路径 tree_path。
 * 根节点（parentId=null）→ `/${id}/`；子节点 → `${parent.tree_path}${id}/`。
 */
function buildTreePath(id: number, parentId: number | null): string {
  if (parentId === null || parentId === undefined) return `/${id}/`;
  const parent = mockSysMenuList.find((m) => m.id === parentId && m.deleted_at === 0);
  if (!parent) return `/${id}/`;
  return `${parent.tree_path}${id}/`;
}

/**
 * 某节点删除后，递归重建其所有后代的 tree_path。
 * 父节点 tree_path 变更时调用；demo 数据量小，遍历重建即可。
 */
function rebuildDescendantTreePaths(parentId: number): void {
  const children = mockSysMenuList.filter((m) => m.parent_id === parentId && m.deleted_at === 0);
  for (const child of children) {
    const parent = mockSysMenuList.find((m) => m.id === parentId);
    const newPath = parent ? `${parent.tree_path}${child.id}/` : `/${child.id}/`;
    const idx = mockSysMenuList.indexOf(child);
    mockSysMenuList[idx] = { ...child, tree_path: newPath };
    rebuildDescendantTreePaths(child.id);
  }
}

/** 给定 id 是否存在未软删的后代节点 */
export function hasMenuChildren(id: number): boolean {
  return mockSysMenuList.some((m) => m.parent_id === id && m.deleted_at === 0);
}

/** 软删某菜单；调用方需先 hasMenuChildren 校验 */
export function softDeleteMenu(id: number): SysMenu | undefined {
  const idx = mockSysMenuList.findIndex((m) => m.id === id && m.deleted_at === 0);
  if (idx < 0) return undefined;
  mockSysMenuList[idx] = { ...mockSysMenuList[idx], deleted_at: Date.now() };
  return mockSysMenuList[idx];
}

/** 创建菜单（含 tree_path 计算）。返回新建行。 */
export function createSysMenu(input: {
  parentId: number | null;
  name: string;
  type: MenuType;
  path: string | null;
  component: string | null;
  icon: string;
  redirect: string;
  permissionCode: string | null;
  metadata: string | null;
  sort: number;
  isHidden: 0 | 1;
  isEnabled: 0 | 1;
  remark: string;
}): SysMenu {
  const id = nextMenuId();
  const now = new Date().toISOString();
  const row: SysMenu = {
    id,
    parent_id: input.parentId,
    name: input.name,
    type: input.type,
    path: input.path,
    component: input.component,
    icon: input.icon,
    redirect: input.redirect,
    permission_code: input.permissionCode,
    tree_path: "", // 先占位，下面按 parentId 计算
    metadata: input.metadata,
    sort: input.sort,
    is_hidden: input.isHidden,
    is_enabled: input.isEnabled,
    deleted_at: 0,
    remark: input.remark,
    created_at: now,
    updated_at: now,
    created_by: 0,
    updated_by: 0,
  };
  row.tree_path = buildTreePath(id, input.parentId);
  mockSysMenuList.push(row);
  return row;
}

/** 更新菜单；parentId 变更时重算自身及子树 tree_path。返回更新后行或 undefined。 */
export function updateSysMenu(
  id: number,
  patch: Partial<{
    parentId: number | null;
    name: string;
    type: MenuType;
    path: string | null;
    component: string | null;
    icon: string;
    redirect: string;
    permissionCode: string | null;
    metadata: string | null;
    sort: number;
    isHidden: 0 | 1;
    isEnabled: 0 | 1;
    remark: string;
  }>,
): SysMenu | undefined {
  const idx = mockSysMenuList.findIndex((m) => m.id === id && m.deleted_at === 0);
  if (idx < 0) return undefined;
  const now = new Date().toISOString();
  const before = mockSysMenuList[idx];
  const parentIdChanged = patch.parentId !== undefined && patch.parentId !== before.parent_id;
  const next: SysMenu = {
    ...before,
    parent_id: patch.parentId !== undefined ? patch.parentId : before.parent_id,
    name: patch.name !== undefined ? patch.name : before.name,
    type: patch.type !== undefined ? patch.type : before.type,
    path: patch.path !== undefined ? patch.path : before.path,
    component: patch.component !== undefined ? patch.component : before.component,
    icon: patch.icon !== undefined ? patch.icon : before.icon,
    redirect: patch.redirect !== undefined ? patch.redirect : before.redirect,
    permission_code:
      patch.permissionCode !== undefined ? patch.permissionCode : before.permission_code,
    metadata: patch.metadata !== undefined ? patch.metadata : before.metadata,
    sort: patch.sort !== undefined ? patch.sort : before.sort,
    is_hidden: patch.isHidden !== undefined ? patch.isHidden : before.is_hidden,
    is_enabled: patch.isEnabled !== undefined ? patch.isEnabled : before.is_enabled,
    remark: patch.remark !== undefined ? patch.remark : before.remark,
    updated_at: now,
    updated_by: 0,
  };
  if (parentIdChanged) {
    next.tree_path = buildTreePath(id, next.parent_id);
  }
  mockSysMenuList[idx] = next;
  if (parentIdChanged) {
    rebuildDescendantTreePaths(id);
  }
  return next;
}

/** 创建接口。返回新建行。 */
export function createSysApi(input: {
  name: string;
  method: string;
  path: string;
  permissionCode: string;
  apiGroup: string;
  remark: string;
  isEnabled: 0 | 1;
}): SysApi {
  const id = nextApiId();
  const now = new Date().toISOString();
  const row: SysApi = {
    id,
    name: input.name,
    method: input.method.toUpperCase(),
    path: input.path,
    permission_code: input.permissionCode,
    api_group: input.apiGroup,
    remark: input.remark,
    is_enabled: input.isEnabled,
    deleted_at: 0,
    created_at: now,
    updated_at: now,
    created_by: 0,
    updated_by: 0,
  };
  mockSysApiList.push(row);
  return row;
}

/** 更新接口。返回更新后行或 undefined。 */
export function updateSysApi(
  id: number,
  patch: Partial<{
    name: string;
    method: string;
    path: string;
    permissionCode: string;
    apiGroup: string;
    remark: string;
    isEnabled: 0 | 1;
  }>,
): SysApi | undefined {
  const idx = mockSysApiList.findIndex((a) => a.id === id && a.deleted_at === 0);
  if (idx < 0) return undefined;
  const now = new Date().toISOString();
  const before = mockSysApiList[idx];
  const next: SysApi = {
    ...before,
    name: patch.name !== undefined ? patch.name : before.name,
    method: patch.method !== undefined ? patch.method.toUpperCase() : before.method,
    path: patch.path !== undefined ? patch.path : before.path,
    permission_code:
      patch.permissionCode !== undefined ? patch.permissionCode : before.permission_code,
    api_group: patch.apiGroup !== undefined ? patch.apiGroup : before.api_group,
    remark: patch.remark !== undefined ? patch.remark : before.remark,
    is_enabled: patch.isEnabled !== undefined ? patch.isEnabled : before.is_enabled,
    updated_at: now,
    updated_by: 0,
  };
  mockSysApiList[idx] = next;
  return next;
}

/** 软删接口 */
export function softDeleteApi(id: number): SysApi | undefined {
  const idx = mockSysApiList.findIndex((a) => a.id === id && a.deleted_at === 0);
  if (idx < 0) return undefined;
  mockSysApiList[idx] = { ...mockSysApiList[idx], deleted_at: Date.now() };
  return mockSysApiList[idx];
}

/** 读取某菜单已绑定的接口 ID 列表 */
export function getMenuApiIds(menuId: number): number[] {
  return mockSysMenuApiList.filter((r) => r.menu_id === menuId).map((r) => r.api_id);
}

/** 全量替换某菜单的接口绑定（覆盖写）。返回最终绑定的 api_id 列表。 */
export function setMenuApis(menuId: number, apiIds: number[]): number[] {
  // 删除旧的
  for (let i = mockSysMenuApiList.length - 1; i >= 0; i--) {
    if (mockSysMenuApiList[i].menu_id === menuId) {
      mockSysMenuApiList.splice(i, 1);
    }
  }
  const now = new Date().toISOString();
  // 只绑定存在且未软删的接口
  const validIds = new Set(mockSysApiList.filter((a) => a.deleted_at === 0).map((a) => a.id));
  const bound: number[] = [];
  for (const aid of apiIds) {
    if (validIds.has(aid) && !bound.includes(aid)) {
      mockSysMenuApiList.push({ menu_id: menuId, api_id: aid, created_at: now, created_by: 0 });
      bound.push(aid);
    }
  }
  return bound;
}

/** 清除某菜单的全部绑定（菜单软删前调用） */
export function clearMenuApis(menuId: number): void {
  for (let i = mockSysMenuApiList.length - 1; i >= 0; i--) {
    if (mockSysMenuApiList[i].menu_id === menuId) {
      mockSysMenuApiList.splice(i, 1);
    }
  }
}

/** 清除某接口的全部绑定（接口软删前调用） */
export function clearApiMenus(apiId: number): void {
  for (let i = mockSysMenuApiList.length - 1; i >= 0; i--) {
    if (mockSysMenuApiList[i].api_id === apiId) {
      mockSysMenuApiList.splice(i, 1);
    }
  }
}

/** 同步 upsert：按 (method, path) 命中则跳过，否则新增。返回 added/skipped/total。 */
export function syncApisFromManifest(
  manifest: Array<{
    name: string;
    method: string;
    path: string;
    permissionCode: string;
    apiGroup: string;
  }>,
): { added: number; skipped: number; total: number } {
  let added = 0;
  let skipped = 0;
  for (const item of manifest) {
    const exists = mockSysApiList.some(
      (a) => a.deleted_at === 0 && a.method === item.method.toUpperCase() && a.path === item.path,
    );
    if (exists) {
      skipped += 1;
      continue;
    }
    createSysApi({
      name: item.name,
      method: item.method,
      path: item.path,
      permissionCode: item.permissionCode,
      apiGroup: item.apiGroup,
      remark: "同步自后端路由清单",
      isEnabled: 1,
    });
    added += 1;
  }
  return { added, skipped, total: mockSysApiList.filter((a) => a.deleted_at === 0).length };
}

/** 种子：菜单树（对齐两端实际页面 path/component，供 RBAC → /menu/all 投影） */
function buildSysMenuSeeds(): SysMenu[] {
  const now = "2025-01-10T08:00:00.000Z";
  const base = {
    redirect: "",
    metadata: null as string | null,
    is_hidden: 0 as 0 | 1,
    is_enabled: 1 as 0 | 1,
    deleted_at: 0,
    remark: "",
    created_at: now,
    updated_at: now,
    created_by: 0,
    updated_by: 0,
  };

  const defs: Array<Omit<SysMenu, "tree_path">> = [
    // Dashboard
    {
      id: 100,
      parent_id: null,
      name: "page.dashboard.title",
      type: "DIR",
      path: "/dashboard",
      component: null,
      icon: "lucide:layout-dashboard",
      permission_code: null,
      sort: -1,
      ...base,
      redirect: "/analytics",
      metadata: JSON.stringify({ routeName: "Dashboard", order: -1 }),
    },
    {
      id: 101,
      parent_id: 100,
      name: "page.dashboard.analytics",
      type: "MENU",
      path: "/analytics",
      component: "/dashboard/analytics/index",
      icon: "lucide:area-chart",
      permission_code: null,
      sort: 1,
      ...base,
      metadata: JSON.stringify({ routeName: "Analytics", affixTab: true, order: 1 }),
    },
    {
      id: 102,
      parent_id: 100,
      name: "page.dashboard.workspace",
      type: "MENU",
      path: "/workspace",
      component: "/dashboard/workspace/index",
      icon: "carbon:workspace",
      permission_code: null,
      sort: 2,
      ...base,
      metadata: JSON.stringify({ routeName: "Workspace", order: 2 }),
    },
    // System
    {
      id: 200,
      parent_id: null,
      name: "system.title",
      type: "DIR",
      path: "/system",
      component: null,
      icon: "lucide:settings",
      permission_code: null,
      sort: 2005,
      ...base,
      redirect: "/system/user",
      metadata: JSON.stringify({ routeName: "System", order: 2005 }),
    },
    {
      id: 201,
      parent_id: 200,
      name: "system.user.title",
      type: "MENU",
      path: "/system/user",
      component: "/system/user/index",
      icon: "lucide:user-cog",
      permission_code: "system:user:list",
      sort: 1,
      ...base,
      metadata: JSON.stringify({ routeName: "SystemUser", order: 1 }),
    },
    {
      id: 2011,
      parent_id: 201,
      name: "新增用户",
      type: "BUTTON",
      path: null,
      component: null,
      icon: "",
      permission_code: "system:user:create",
      sort: 1,
      ...base,
    },
    {
      id: 2012,
      parent_id: 201,
      name: "编辑用户",
      type: "BUTTON",
      path: null,
      component: null,
      icon: "",
      permission_code: "system:user:update",
      sort: 2,
      ...base,
    },
    {
      id: 2013,
      parent_id: 201,
      name: "删除用户",
      type: "BUTTON",
      path: null,
      component: null,
      icon: "",
      permission_code: "system:user:delete",
      sort: 3,
      ...base,
    },
    {
      id: 202,
      parent_id: 200,
      name: "system.role.title",
      type: "MENU",
      path: "/system/role",
      component: "/system/role/index",
      icon: "lucide:shield-user",
      permission_code: "system:role:list",
      sort: 2,
      ...base,
      metadata: JSON.stringify({ routeName: "SystemRole", order: 2 }),
    },
    {
      id: 2021,
      parent_id: 202,
      name: "分配菜单",
      type: "BUTTON",
      path: null,
      component: null,
      icon: "",
      permission_code: "system:role:menu",
      sort: 1,
      ...base,
    },
    {
      id: 203,
      parent_id: 200,
      name: "system.dict.title",
      type: "MENU",
      path: "/system/dict",
      component: "/system/dict/index",
      icon: "lucide:book-marked",
      permission_code: "system:dict:list",
      sort: 3,
      ...base,
      metadata: JSON.stringify({ routeName: "SystemDict", order: 3 }),
    },
    {
      id: 204,
      parent_id: 200,
      name: "system.i18n.title",
      type: "MENU",
      path: "/system/i18n",
      component: "/system/i18n/index",
      icon: "lucide:languages",
      permission_code: "system:i18n:list",
      sort: 4,
      ...base,
      metadata: JSON.stringify({ routeName: "SystemI18n", order: 4 }),
    },
    {
      id: 205,
      parent_id: 200,
      name: "system.menu.title",
      type: "MENU",
      path: "/system/menu",
      component: "/system/menu/index",
      icon: "lucide:menu",
      permission_code: "system:menu:list",
      sort: 5,
      ...base,
      metadata: JSON.stringify({ routeName: "SystemMenu", order: 5 }),
    },
    {
      id: 2051,
      parent_id: 205,
      name: "新增菜单",
      type: "BUTTON",
      path: null,
      component: null,
      icon: "",
      permission_code: "system:menu:create",
      sort: 1,
      ...base,
    },
    {
      id: 2052,
      parent_id: 205,
      name: "编辑菜单",
      type: "BUTTON",
      path: null,
      component: null,
      icon: "",
      permission_code: "system:menu:update",
      sort: 2,
      ...base,
    },
    {
      id: 2053,
      parent_id: 205,
      name: "删除菜单",
      type: "BUTTON",
      path: null,
      component: null,
      icon: "",
      permission_code: "system:menu:delete",
      sort: 3,
      ...base,
    },
    {
      id: 206,
      parent_id: 200,
      name: "system.api.title",
      type: "MENU",
      path: "/system/api",
      component: "/system/api/index",
      icon: "lucide:terminal",
      permission_code: "system:api:list",
      sort: 6,
      ...base,
      metadata: JSON.stringify({ routeName: "SystemApi", order: 6 }),
    },
    {
      id: 2061,
      parent_id: 206,
      name: "同步接口",
      type: "BUTTON",
      path: null,
      component: null,
      icon: "",
      permission_code: "system:api:sync",
      sort: 1,
      ...base,
    },
    // 日志审计 — sys_login_log
    {
      id: 300,
      parent_id: null,
      name: "log.title",
      type: "DIR",
      path: "/log",
      component: null,
      icon: "lucide:logs",
      permission_code: null,
      sort: 2004,
      ...base,
      redirect: "/log/login-log",
      metadata: JSON.stringify({ routeName: "Log", order: 2004 }),
    },
    {
      id: 301,
      parent_id: 300,
      name: "log.loginLog.title",
      type: "MENU",
      path: "/log/login-log",
      component: "/log/login-log/index",
      icon: "lucide:user-lock",
      permission_code: "log:login-log:list",
      sort: 1,
      ...base,
      metadata: JSON.stringify({ routeName: "LogLoginLog", order: 1 }),
    },
  ];

  for (const d of defs) {
    mockSysMenuList.push({ ...d, tree_path: buildTreePath(d.id, d.parent_id) });
  }
  menuIdSeq = Math.max(...defs.map((d) => d.id), 0);
  return mockSysMenuList.slice();
}

/** 种子：接口列表（复刻 admin.js DATA.apis） */
function buildSysApiSeeds(): SysApi[] {
  const now = "2025-01-10T08:00:00.000Z";
  const defs: Array<Omit<SysApi, "method"> & { method: string }> = [
    {
      id: 1,
      name: "用户分页列表",
      method: "GET",
      path: "/api/admin/users",
      permission_code: "admin:user:list",
      api_group: "用户管理",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 2,
      name: "创建用户",
      method: "POST",
      path: "/api/admin/users",
      permission_code: "admin:user:create",
      api_group: "用户管理",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 3,
      name: "更新用户",
      method: "PUT",
      path: "/api/admin/users/:id",
      permission_code: "admin:user:update",
      api_group: "用户管理",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 4,
      name: "删除用户",
      method: "DELETE",
      path: "/api/admin/users/:id",
      permission_code: "admin:user:delete",
      api_group: "用户管理",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 5,
      name: "角色列表",
      method: "GET",
      path: "/api/admin/roles",
      permission_code: "admin:role:list",
      api_group: "角色管理",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 6,
      name: "角色授权菜单",
      method: "POST",
      path: "/api/admin/roles/:id/menus",
      permission_code: "admin:role:assign:menu",
      api_group: "角色管理",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 7,
      name: "菜单树",
      method: "GET",
      path: "/api/admin/menus/tree",
      permission_code: "admin:menu:list",
      api_group: "菜单管理",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 8,
      name: "接口同步",
      method: "POST",
      path: "/api/admin/apis/sync",
      permission_code: "admin:api:sync",
      api_group: "接口管理",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 9,
      name: "字典类型列表",
      method: "GET",
      path: "/api/admin/dict/types",
      permission_code: "admin:dict:list",
      api_group: "字典管理",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 10,
      name: "字典数据",
      method: "GET",
      path: "/api/admin/dict/data/:type",
      permission_code: "admin:dict:data:list",
      api_group: "字典管理",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 11,
      name: "任务列表",
      method: "GET",
      path: "/api/admin/tasks",
      permission_code: "admin:task:list",
      api_group: "任务调度",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 12,
      name: "手动触发任务",
      method: "POST",
      path: "/api/admin/tasks/:id/trigger",
      permission_code: "admin:task:trigger",
      api_group: "任务调度",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 13,
      name: "登录",
      method: "POST",
      path: "/api/auth/login",
      permission_code: "auth:login",
      api_group: "认证",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 15,
      name: "登出",
      method: "POST",
      path: "/api/auth/logout",
      permission_code: "auth:logout",
      api_group: "认证",
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 16,
      name: "登录日志分页列表",
      method: "GET",
      path: "/api/system/login-log/list",
      permission_code: "log:login-log:list",
      api_group: "日志审计",
      remark: "sys_login_log / archive 列表",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
  ];
  for (const d of defs) {
    mockSysApiList.push({ ...d, method: d.method.toUpperCase() });
  }
  apiIdSeq = Math.max(...defs.map((d) => d.id), 0);
  return mockSysApiList.slice();
}

/**
 * 首次访问时把菜单/接口/绑定种子写入共享 list；之后 create/update/delete 改它。
 */
export function ensureMenuApiSeeds(): void {
  if (mockSysMenuList.length === 0) {
    buildSysMenuSeeds();
  }
  if (mockSysApiList.length === 0) {
    buildSysApiSeeds();
  }
  // sys_menu_api 种子：菜单管理绑定示例 + 登录日志绑定列表接口
  if (mockSysMenuApiList.length === 0) {
    const now = "2025-01-10T08:00:00.000Z";
    // SystemMenu(205) binds sample APIs 7/8
    mockSysMenuApiList.push(
      { menu_id: 205, api_id: 7, created_at: now, created_by: 0 },
      { menu_id: 205, api_id: 8, created_at: now, created_by: 0 },
      // LogLoginLog(301) → 登录日志列表
      { menu_id: 301, api_id: 16, created_at: now, created_by: 0 },
    );
  }
}

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

/** demo 占位密码哈希：不真实加密，仅加前缀便于辨识 */
function placeholderHash(plain: string): string {
  return `demo$bcrypt$${plain}`;
}

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
  // 日志审计（与 MOCK_MENUS / Vue 静态路由对齐）
  const logBranch = [300, 301];
  // Full system menus + button children
  const systemFull = [
    200, 201, 2011, 2012, 2013, 202, 2021, 203, 204, 205, 2051, 2052, 2053, 206, 2061,
  ];
  // Partial system: user/role/dict/i18n (+ user/role buttons)
  const systemPartial = [200, 201, 2011, 2012, 2013, 202, 2021, 203, 204];

  // super_admin(id=1) = vben full
  for (const mid of [...dashboard, ...logBranch, ...systemFull]) {
    rows.push({ role_id: 1, menu_id: mid, created_at: now, created_by: 0 });
  }
  // admin(id=2) = partial system + dashboard + 登录日志
  for (const mid of [...dashboard, ...logBranch, ...systemPartial]) {
    rows.push({ role_id: 2, menu_id: mid, created_at: now, created_by: 0 });
  }
  // user(id=3) = jack dashboard only
  for (const mid of dashboard) {
    rows.push({ role_id: 3, menu_id: mid, created_at: now, created_by: 0 });
  }
  return rows;
}

/** 种子：角色-接口授权示例（admin 拥有用户管理 4 个接口）。 */
function buildSysRoleApiSeeds(): SysRoleApi[] {
  const now = "2025-01-10T08:00:00.000Z";
  const rows: SysRoleApi[] = [];
  // super_admin(id=1) 授权全部接口
  for (const aid of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]) {
    rows.push({ role_id: 1, api_id: aid, created_at: now, created_by: 0 });
  }
  // admin(id=2) 授权用户管理接口 + 登录日志列表
  for (const aid of [1, 2, 3, 4, 16]) {
    rows.push({ role_id: 2, api_id: aid, created_at: now, created_by: 0 });
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

// ============================================================
// 登录日志 — sys_login_log / sys_login_log_archive
// 字段对齐 schema.sql v5；只增不改；login 成功/失败均写热表。
// ============================================================

export type LoginMethod = "PASSWORD" | "SSO" | "OAUTH" | "SMS";

export interface SysLoginLog {
  id: number;
  username: string;
  success: 0 | 1;
  reason: string;
  status_code: null | number;
  sys_user_id: null | number;
  login_method: LoginMethod;
  login_time: string;
  login_ip: string;
  login_mac: string;
  client_id: string;
  client_name: string;
  user_agent: string;
  browser_name: string;
  browser_version: string;
  os_name: string;
  os_version: string;
  location: string;
  created_at: string;
}

export interface SysLoginLogArchive extends SysLoginLog {
  archived_at: string;
}

export interface AppendLoginLogInput {
  username: string;
  success: 0 | 1;
  reason?: string;
  statusCode?: null | number;
  sysUserId?: null | number;
  loginMethod?: LoginMethod;
  loginIp?: string;
  loginMac?: string;
  clientId?: string;
  clientName?: string;
  userAgent?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  osVersion?: string;
  location?: string;
  loginTime?: string;
}

const mockSysLoginLogList: SysLoginLog[] = [];
const mockSysLoginLogArchiveList: SysLoginLogArchive[] = [];

export function getMockSysLoginLogList() {
  return mockSysLoginLogList;
}

export function getMockSysLoginLogArchiveList() {
  return mockSysLoginLogArchiveList;
}

let sysLoginLogIdSeq = 0;
function nextSysLoginLogId(): number {
  sysLoginLogIdSeq += 1;
  return sysLoginLogIdSeq;
}

let sysLoginLogArchiveIdSeq = 0;
function nextSysLoginLogArchiveId(): number {
  sysLoginLogArchiveIdSeq += 1;
  return sysLoginLogArchiveIdSeq;
}

/** 简易 UA 解析（mock 用，非完整 parser） */
export function parseUserAgent(ua: string): {
  browser_name: string;
  browser_version: string;
  os_name: string;
  os_version: string;
} {
  let browser_name = "";
  let browser_version = "";
  let os_name = "";
  let os_version = "";

  const edge = ua.match(/Edg\/([\d.]+)/);
  const chrome = ua.match(/Chrome\/([\d.]+)/);
  const firefox = ua.match(/Firefox\/([\d.]+)/);
  const safari = ua.match(/Version\/([\d.]+).*Safari/);
  if (edge) {
    browser_name = "Edge";
    browser_version = edge[1] ?? "";
  } else if (chrome) {
    browser_name = "Chrome";
    browser_version = chrome[1] ?? "";
  } else if (firefox) {
    browser_name = "Firefox";
    browser_version = firefox[1] ?? "";
  } else if (safari) {
    browser_name = "Safari";
    browser_version = safari[1] ?? "";
  } else if (ua) {
    browser_name = "Unknown";
  }

  const win = ua.match(/Windows NT ([\d.]+)/);
  const mac = ua.match(/Mac OS X ([\d_]+)/);
  const android = ua.match(/Android ([\d.]+)/);
  const ios = ua.match(/OS ([\d_]+) like Mac OS X/);
  if (win) {
    os_name = "Windows";
    os_version = win[1] === "10.0" ? "10/11" : (win[1] ?? "");
  } else if (mac) {
    os_name = "macOS";
    os_version = (mac[1] ?? "").replace(/_/g, ".");
  } else if (android) {
    os_name = "Android";
    os_version = android[1] ?? "";
  } else if (ios) {
    os_name = "iOS";
    os_version = (ios[1] ?? "").replace(/_/g, ".");
  } else if (/Linux/.test(ua)) {
    os_name = "Linux";
  }

  return { browser_name, browser_version, os_name, os_version };
}

/** 追加一条热表登录日志（只增不改）；写入前确保种子已就绪 */
export function appendLoginLog(input: AppendLoginLogInput): SysLoginLog {
  ensureLoginLogSeeds();
  const now = input.loginTime ?? new Date().toISOString();
  const ua = input.userAgent ?? "";
  const parsed = parseUserAgent(ua);
  const row: SysLoginLog = {
    id: nextSysLoginLogId(),
    username: input.username,
    success: input.success,
    reason: input.reason ?? "",
    status_code: input.statusCode ?? (input.success === 1 ? 200 : 403),
    sys_user_id: input.sysUserId ?? null,
    login_method: input.loginMethod ?? "PASSWORD",
    login_time: now,
    login_ip: input.loginIp ?? "",
    login_mac: input.loginMac ?? "",
    client_id: input.clientId ?? "web-admin",
    client_name: input.clientName ?? "Web Admin",
    user_agent: ua,
    browser_name: input.browserName ?? parsed.browser_name,
    browser_version: input.browserVersion ?? parsed.browser_version,
    os_name: input.osName ?? parsed.os_name,
    os_version: input.osVersion ?? parsed.os_version,
    location: input.location ?? "Mock-City",
    created_at: now,
  };
  mockSysLoginLogList.push(row);
  return row;
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86_400_000).toISOString();
}

function buildLoginLogSeeds(): SysLoginLog[] {
  const chromeUa =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
  const macUa =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15";
  const seeds: Omit<SysLoginLog, "id">[] = [
    {
      username: "vben",
      success: 1,
      reason: "",
      status_code: 200,
      sys_user_id: 1,
      login_method: "PASSWORD",
      login_time: hoursAgo(1),
      login_ip: "10.0.0.12",
      login_mac: "",
      client_id: "web-admin",
      client_name: "Web Admin",
      user_agent: chromeUa,
      browser_name: "Chrome",
      browser_version: "122.0.0.0",
      os_name: "Windows",
      os_version: "10/11",
      location: "Mock-City",
      created_at: hoursAgo(1),
    },
    {
      username: "admin",
      success: 1,
      reason: "",
      status_code: 200,
      sys_user_id: 2,
      login_method: "PASSWORD",
      login_time: hoursAgo(3),
      login_ip: "10.0.0.21",
      login_mac: "",
      client_id: "web-admin",
      client_name: "Web Admin",
      user_agent: macUa,
      browser_name: "Safari",
      browser_version: "17.2",
      os_name: "macOS",
      os_version: "14.3",
      location: "Mock-City",
      created_at: hoursAgo(3),
    },
    {
      username: "admin",
      success: 0,
      reason: "Username or password is incorrect.",
      status_code: 403,
      sys_user_id: null,
      login_method: "PASSWORD",
      login_time: hoursAgo(5),
      login_ip: "203.0.113.8",
      login_mac: "",
      client_id: "web-admin",
      client_name: "Web Admin",
      user_agent: chromeUa,
      browser_name: "Chrome",
      browser_version: "122.0.0.0",
      os_name: "Windows",
      os_version: "10/11",
      location: "Mock-City",
      created_at: hoursAgo(5),
    },
    {
      username: "jack",
      success: 1,
      reason: "",
      status_code: 200,
      sys_user_id: 3,
      login_method: "PASSWORD",
      login_time: hoursAgo(8),
      login_ip: "10.0.0.33",
      login_mac: "",
      client_id: "web-admin",
      client_name: "Web Admin",
      user_agent: chromeUa,
      browser_name: "Chrome",
      browser_version: "122.0.0.0",
      os_name: "Windows",
      os_version: "10/11",
      location: "Mock-City",
      created_at: hoursAgo(8),
    },
    {
      username: "unknown",
      success: 0,
      reason: "Username or password is incorrect.",
      status_code: 403,
      sys_user_id: null,
      login_method: "PASSWORD",
      login_time: hoursAgo(12),
      login_ip: "198.51.100.4",
      login_mac: "",
      client_id: "web-admin",
      client_name: "Web Admin",
      user_agent: chromeUa,
      browser_name: "Chrome",
      browser_version: "122.0.0.0",
      os_name: "Windows",
      os_version: "10/11",
      location: "Mock-City",
      created_at: hoursAgo(12),
    },
    {
      username: "vben",
      success: 1,
      reason: "",
      status_code: 200,
      sys_user_id: 1,
      login_method: "SSO",
      login_time: hoursAgo(24),
      login_ip: "10.0.0.12",
      login_mac: "",
      client_id: "sso-portal",
      client_name: "SSO Portal",
      user_agent: chromeUa,
      browser_name: "Chrome",
      browser_version: "122.0.0.0",
      os_name: "Windows",
      os_version: "10/11",
      location: "Mock-City",
      created_at: hoursAgo(24),
    },
    {
      username: "jack",
      success: 0,
      reason: "Username and password are required",
      status_code: 400,
      sys_user_id: null,
      login_method: "PASSWORD",
      login_time: hoursAgo(30),
      login_ip: "10.0.0.99",
      login_mac: "",
      client_id: "web-admin",
      client_name: "Web Admin",
      user_agent: "",
      browser_name: "",
      browser_version: "",
      os_name: "",
      os_version: "",
      location: "Mock-City",
      created_at: hoursAgo(30),
    },
    {
      username: "admin",
      success: 1,
      reason: "",
      status_code: 200,
      sys_user_id: 2,
      login_method: "OAUTH",
      login_time: hoursAgo(48),
      login_ip: "10.0.0.21",
      login_mac: "",
      client_id: "oauth-app",
      client_name: "OAuth App",
      user_agent: macUa,
      browser_name: "Safari",
      browser_version: "17.2",
      os_name: "macOS",
      os_version: "14.3",
      location: "Mock-City",
      created_at: hoursAgo(48),
    },
  ];
  return seeds.map((s) => {
    const id = nextSysLoginLogId();
    return { id, ...s };
  });
}

function buildLoginLogArchiveSeeds(): SysLoginLogArchive[] {
  const chromeUa =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
  const seeds: Omit<SysLoginLogArchive, "id">[] = [
    {
      username: "vben",
      success: 1,
      reason: "",
      status_code: 200,
      sys_user_id: 1,
      login_method: "PASSWORD",
      login_time: daysAgo(45),
      login_ip: "10.0.0.12",
      login_mac: "",
      client_id: "web-admin",
      client_name: "Web Admin",
      user_agent: chromeUa,
      browser_name: "Chrome",
      browser_version: "120.0.0.0",
      os_name: "Windows",
      os_version: "10/11",
      location: "Mock-City",
      created_at: daysAgo(45),
      archived_at: daysAgo(15),
    },
    {
      username: "admin",
      success: 0,
      reason: "Username or password is incorrect.",
      status_code: 403,
      sys_user_id: null,
      login_method: "PASSWORD",
      login_time: daysAgo(50),
      login_ip: "203.0.113.20",
      login_mac: "",
      client_id: "web-admin",
      client_name: "Web Admin",
      user_agent: chromeUa,
      browser_name: "Chrome",
      browser_version: "120.0.0.0",
      os_name: "Windows",
      os_version: "10/11",
      location: "Mock-City",
      created_at: daysAgo(50),
      archived_at: daysAgo(15),
    },
    {
      username: "jack",
      success: 1,
      reason: "",
      status_code: 200,
      sys_user_id: 3,
      login_method: "SMS",
      login_time: daysAgo(60),
      login_ip: "10.0.0.33",
      login_mac: "",
      client_id: "mobile-app",
      client_name: "Mobile App",
      user_agent: "MockMobile/1.0",
      browser_name: "Unknown",
      browser_version: "",
      os_name: "Android",
      os_version: "14",
      location: "Mock-City",
      created_at: daysAgo(60),
      archived_at: daysAgo(20),
    },
    {
      username: "vben",
      success: 1,
      reason: "",
      status_code: 200,
      sys_user_id: 1,
      login_method: "PASSWORD",
      login_time: daysAgo(70),
      login_ip: "10.0.0.12",
      login_mac: "",
      client_id: "web-admin",
      client_name: "Web Admin",
      user_agent: chromeUa,
      browser_name: "Chrome",
      browser_version: "120.0.0.0",
      os_name: "Windows",
      os_version: "10/11",
      location: "Mock-City",
      created_at: daysAgo(70),
      archived_at: daysAgo(25),
    },
    {
      username: "ghost",
      success: 0,
      reason: "Username or password is incorrect.",
      status_code: 403,
      sys_user_id: null,
      login_method: "PASSWORD",
      login_time: daysAgo(80),
      login_ip: "198.51.100.99",
      login_mac: "",
      client_id: "web-admin",
      client_name: "Web Admin",
      user_agent: chromeUa,
      browser_name: "Chrome",
      browser_version: "120.0.0.0",
      os_name: "Windows",
      os_version: "10/11",
      location: "Mock-City",
      created_at: daysAgo(80),
      archived_at: daysAgo(30),
    },
  ];
  return seeds.map((s) => {
    const id = nextSysLoginLogArchiveId();
    return { id, ...s };
  });
}

/** 是否已完成种子装载（与 list 长度解耦，避免登录先写导致种子被跳过） */
let loginLogSeedsReady = false;

/** 确保登录日志种子已写入（幂等）。 */
export function ensureLoginLogSeeds(): void {
  if (loginLogSeedsReady) return;
  loginLogSeedsReady = true;
  if (mockSysLoginLogList.length === 0) {
    mockSysLoginLogList.push(...buildLoginLogSeeds());
  }
  if (mockSysLoginLogArchiveList.length === 0) {
    mockSysLoginLogArchiveList.push(...buildLoginLogArchiveSeeds());
  }
}

/**
 * 后端路由清单（sync 用）。手维护常量；与真实 nitro 路由会漂移，demo 可接受。
 * 覆盖 system 下常见 CRUD + auth。
 */
export const API_SYNC_MANIFEST = [
  {
    name: "登录",
    method: "POST",
    path: "/api/auth/login",
    permissionCode: "auth:login",
    apiGroup: "认证",
  },
  {
    name: "登出",
    method: "POST",
    path: "/api/auth/logout",
    permissionCode: "auth:logout",
    apiGroup: "认证",
  },
  {
    name: "用户分页列表",
    method: "GET",
    path: "/api/admin/users",
    permissionCode: "admin:user:list",
    apiGroup: "用户管理",
  },
  {
    name: "创建用户",
    method: "POST",
    path: "/api/admin/users",
    permissionCode: "admin:user:create",
    apiGroup: "用户管理",
  },
  {
    name: "更新用户",
    method: "PUT",
    path: "/api/admin/users/:id",
    permissionCode: "admin:user:update",
    apiGroup: "用户管理",
  },
  {
    name: "删除用户",
    method: "DELETE",
    path: "/api/admin/users/:id",
    permissionCode: "admin:user:delete",
    apiGroup: "用户管理",
  },
  {
    name: "角色列表",
    method: "GET",
    path: "/api/admin/roles",
    permissionCode: "admin:role:list",
    apiGroup: "角色管理",
  },
  {
    name: "菜单树",
    method: "GET",
    path: "/api/admin/menus/tree",
    permissionCode: "admin:menu:list",
    apiGroup: "菜单管理",
  },
  {
    name: "字典类型列表",
    method: "GET",
    path: "/api/admin/dict/types",
    permissionCode: "admin:dict:list",
    apiGroup: "字典管理",
  },
  {
    name: "字典数据",
    method: "GET",
    path: "/api/admin/dict/data/:type",
    permissionCode: "admin:dict:data:list",
    apiGroup: "字典管理",
  },
  {
    name: "任务列表",
    method: "GET",
    path: "/api/admin/tasks",
    permissionCode: "admin:task:list",
    apiGroup: "任务调度",
  },
  {
    name: "手动触发任务",
    method: "POST",
    path: "/api/admin/tasks/:id/trigger",
    permissionCode: "admin:task:trigger",
    apiGroup: "任务调度",
  },
] as const;
