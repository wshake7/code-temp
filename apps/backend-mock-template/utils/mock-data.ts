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

/** 日志审计菜单（单菜单进页，页内 Tab 切换登录/API 日志） */
const logMenus = () => [
  {
    meta: {
      icon: "lucide:logs",
      order: 2004,
      title: "log.title",
    },
    name: "Log",
    path: "/log",
    component: "/log/index",
  },
];

/** 任务调度菜单（一级入口；页内 Tab 切换配置/执行记录） */
const taskMenus = () => [
  {
    meta: {
      icon: "lucide:timer",
      order: 2003,
      title: "task.title",
    },
    name: "Task",
    path: "/task",
    component: "/task/index",
  },
];

export const MOCK_MENUS = [
  {
    menus: [...dashboardMenus, ...taskMenus(), ...logMenus(), ...systemMenus("full")],
    username: "vben",
  },
  {
    menus: [...dashboardMenus, ...taskMenus(), ...logMenus(), ...systemMenus("partial")],
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

/**
 * 按菜单 ID 列表聚合 sys_menu_api → 去重的未软删 api_id。
 * 供角色授权「从已选菜单带出接口」使用（结构化快捷绑定，非直接授权）。
 */
export function getApiIdsByMenuIds(menuIds: number[]): number[] {
  if (!menuIds.length) return [];
  const menuIdSet = new Set(menuIds);
  const validApiIds = new Set(
    mockSysApiList.filter((a) => a.deleted_at === 0).map((a) => a.id),
  );
  const out: number[] = [];
  const seen = new Set<number>();
  for (const row of mockSysMenuApiList) {
    if (!menuIdSet.has(row.menu_id)) continue;
    if (!validApiIds.has(row.api_id) || seen.has(row.api_id)) continue;
    seen.add(row.api_id);
    out.push(row.api_id);
  }
  return out.sort((a, b) => a - b);
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
    // 日志审计 — 单 MENU 进页；BUTTON 发 list 权限码供页内 Tab 显隐
    {
      id: 300,
      parent_id: null,
      name: "log.title",
      type: "MENU",
      path: "/log",
      component: "/log/index",
      icon: "lucide:logs",
      permission_code: null,
      sort: 2004,
      ...base,
      // fullPathKey:false — 页内 ?tab= 切换不产生重复顶栏标签（Vue tabbar）
      metadata: JSON.stringify({
        routeName: "Log",
        order: 2004,
        fullPathKey: false,
      }),
    },
    {
      id: 301,
      parent_id: 300,
      name: "log.loginLog.title",
      type: "BUTTON",
      path: null,
      component: null,
      icon: "",
      permission_code: "log:login-log:list",
      sort: 1,
      ...base,
    },
    {
      id: 302,
      parent_id: 300,
      name: "log.apiLog.title",
      type: "BUTTON",
      path: null,
      component: null,
      icon: "",
      permission_code: "log:api-log:list",
      sort: 2,
      ...base,
    },
    // 任务调度 — 一级菜单；页内 Tab 切换配置/执行记录
    {
      id: 400,
      parent_id: null,
      name: "task.title",
      type: "MENU",
      path: "/task",
      component: "/task/index",
      icon: "lucide:timer",
      permission_code: null,
      sort: 2003,
      ...base,
      metadata: JSON.stringify({
        routeName: "Task",
        order: 2003,
        fullPathKey: false,
      }),
    },
    {
      id: 401,
      parent_id: 400,
      name: "task.config.title",
      type: "BUTTON",
      path: null,
      component: null,
      icon: "",
      permission_code: "task:config:list",
      sort: 1,
      ...base,
    },
    {
      id: 402,
      parent_id: 400,
      name: "task.execution.title",
      type: "BUTTON",
      path: null,
      component: null,
      icon: "",
      permission_code: "task:execution:list",
      sort: 2,
      ...base,
    },
  ];

  for (const d of defs) {
    mockSysMenuList.push({ ...d, tree_path: buildTreePath(d.id, d.parent_id) });
  }
  menuIdSeq = Math.max(...defs.map((d) => d.id), 0);
  return mockSysMenuList.slice();
}

/**
 * 后端路由清单（sys_api 种子 + sync 共用唯一源）。
 * 只收录现有 mock 中真实存在的系统管理接口；不含 /api/admin 伪造路径、
 * 不含 dept / table / demo / timezone 等非本产品系统模块。
 */
export const API_SYNC_MANIFEST = [
  // —— 会话壳 ——
  {
    name: "权限码列表",
    method: "GET",
    path: "/api/auth/codes",
    permissionCode: "auth:codes",
    apiGroup: "会话",
  },
  {
    name: "当前用户信息",
    method: "GET",
    path: "/api/user/info",
    permissionCode: "user:info",
    apiGroup: "会话",
  },
  {
    name: "用户菜单路由",
    method: "GET",
    path: "/api/menu/all",
    permissionCode: "menu:all",
    apiGroup: "会话",
  },
  {
    name: "文件上传",
    method: "POST",
    path: "/api/upload",
    permissionCode: "system:upload",
    apiGroup: "会话",
  },
  // —— 用户管理 ——
  {
    name: "用户分页列表",
    method: "GET",
    path: "/api/system/user/list",
    permissionCode: "system:user:list",
    apiGroup: "用户管理",
  },
  {
    name: "创建用户",
    method: "POST",
    path: "/api/system/user",
    permissionCode: "system:user:create",
    apiGroup: "用户管理",
  },
  {
    name: "更新用户",
    method: "PUT",
    path: "/api/system/user/:id",
    permissionCode: "system:user:update",
    apiGroup: "用户管理",
  },
  {
    name: "删除用户",
    method: "DELETE",
    path: "/api/system/user/:id",
    permissionCode: "system:user:delete",
    apiGroup: "用户管理",
  },
  {
    name: "启停用户",
    method: "PUT",
    path: "/api/system/user/:id/status",
    permissionCode: "system:user:status",
    apiGroup: "用户管理",
  },
  {
    name: "重置用户密码",
    method: "POST",
    path: "/api/system/user/:id/password",
    permissionCode: "system:user:password",
    apiGroup: "用户管理",
  },
  // —— 角色管理 ——
  {
    name: "角色分页列表",
    method: "GET",
    path: "/api/system/role/list",
    permissionCode: "system:role:list",
    apiGroup: "角色管理",
  },
  {
    name: "角色全量列表",
    method: "GET",
    path: "/api/system/role/all",
    permissionCode: "system:role:list",
    apiGroup: "角色管理",
  },
  {
    name: "创建角色",
    method: "POST",
    path: "/api/system/role",
    permissionCode: "system:role:create",
    apiGroup: "角色管理",
  },
  {
    name: "更新角色",
    method: "PUT",
    path: "/api/system/role/:id",
    permissionCode: "system:role:update",
    apiGroup: "角色管理",
  },
  {
    name: "删除角色",
    method: "DELETE",
    path: "/api/system/role/:id",
    permissionCode: "system:role:delete",
    apiGroup: "角色管理",
  },
  {
    name: "角色已绑菜单",
    method: "GET",
    path: "/api/system/role/:id/menus",
    permissionCode: "system:role:menu",
    apiGroup: "角色管理",
  },
  {
    name: "分配角色菜单",
    method: "POST",
    path: "/api/system/role/:id/menus",
    permissionCode: "system:role:menu",
    apiGroup: "角色管理",
  },
  {
    name: "角色已绑接口",
    method: "GET",
    path: "/api/system/role/:id/apis",
    permissionCode: "system:role:api",
    apiGroup: "角色管理",
  },
  {
    name: "分配角色接口",
    method: "POST",
    path: "/api/system/role/:id/apis",
    permissionCode: "system:role:api",
    apiGroup: "角色管理",
  },
  // —— 菜单管理 ——
  {
    name: "菜单分页列表",
    method: "GET",
    path: "/api/system/menu/list",
    permissionCode: "system:menu:list",
    apiGroup: "菜单管理",
  },
  {
    name: "菜单全量列表",
    method: "GET",
    path: "/api/system/menu/all",
    permissionCode: "system:menu:list",
    apiGroup: "菜单管理",
  },
  {
    name: "创建菜单",
    method: "POST",
    path: "/api/system/menu",
    permissionCode: "system:menu:create",
    apiGroup: "菜单管理",
  },
  {
    name: "更新菜单",
    method: "PUT",
    path: "/api/system/menu/:id",
    permissionCode: "system:menu:update",
    apiGroup: "菜单管理",
  },
  {
    name: "删除菜单",
    method: "DELETE",
    path: "/api/system/menu/:id",
    permissionCode: "system:menu:delete",
    apiGroup: "菜单管理",
  },
  {
    name: "批量操作菜单",
    method: "POST",
    path: "/api/system/menu/batch",
    permissionCode: "system:menu:batch",
    apiGroup: "菜单管理",
  },
  {
    name: "菜单名是否存在",
    method: "GET",
    path: "/api/system/menu/name-exists",
    permissionCode: "system:menu:list",
    apiGroup: "菜单管理",
  },
  {
    name: "菜单路径是否存在",
    method: "GET",
    path: "/api/system/menu/path-exists",
    permissionCode: "system:menu:list",
    apiGroup: "菜单管理",
  },
  {
    name: "菜单已绑接口",
    method: "GET",
    path: "/api/system/menu/:id/apis",
    permissionCode: "system:menu:api",
    apiGroup: "菜单管理",
  },
  {
    name: "设置菜单接口",
    method: "POST",
    path: "/api/system/menu/:id/apis",
    permissionCode: "system:menu:api",
    apiGroup: "菜单管理",
  },
  // —— 接口管理 ——
  {
    name: "接口分页列表",
    method: "GET",
    path: "/api/system/api/list",
    permissionCode: "system:api:list",
    apiGroup: "接口管理",
  },
  {
    name: "接口全量列表",
    method: "GET",
    path: "/api/system/api/all",
    permissionCode: "system:api:list",
    apiGroup: "接口管理",
  },
  {
    name: "接口分组列表",
    method: "GET",
    path: "/api/system/api/groups",
    permissionCode: "system:api:list",
    apiGroup: "接口管理",
  },
  {
    name: "创建接口",
    method: "POST",
    path: "/api/system/api",
    permissionCode: "system:api:create",
    apiGroup: "接口管理",
  },
  {
    name: "更新接口",
    method: "PUT",
    path: "/api/system/api/:id",
    permissionCode: "system:api:update",
    apiGroup: "接口管理",
  },
  {
    name: "删除接口",
    method: "DELETE",
    path: "/api/system/api/:id",
    permissionCode: "system:api:delete",
    apiGroup: "接口管理",
  },
  {
    name: "批量操作接口",
    method: "POST",
    path: "/api/system/api/batch",
    permissionCode: "system:api:batch",
    apiGroup: "接口管理",
  },
  {
    name: "同步接口",
    method: "POST",
    path: "/api/system/api/sync",
    permissionCode: "system:api:sync",
    apiGroup: "接口管理",
  },
  // —— 字典管理 ——
  {
    name: "字典类型分页",
    method: "GET",
    path: "/api/system/dict-type/list",
    permissionCode: "system:dict:list",
    apiGroup: "字典管理",
  },
  {
    name: "字典类型全量",
    method: "GET",
    path: "/api/system/dict-type/all",
    permissionCode: "system:dict:list",
    apiGroup: "字典管理",
  },
  {
    name: "字典类型详情",
    method: "GET",
    path: "/api/system/dict-type/:id",
    permissionCode: "system:dict:list",
    apiGroup: "字典管理",
  },
  {
    name: "创建字典类型",
    method: "POST",
    path: "/api/system/dict-type",
    permissionCode: "system:dict:create",
    apiGroup: "字典管理",
  },
  {
    name: "更新字典类型",
    method: "PUT",
    path: "/api/system/dict-type/:id",
    permissionCode: "system:dict:update",
    apiGroup: "字典管理",
  },
  {
    name: "删除字典类型",
    method: "DELETE",
    path: "/api/system/dict-type/:id",
    permissionCode: "system:dict:delete",
    apiGroup: "字典管理",
  },
  {
    name: "批量操作字典类型",
    method: "POST",
    path: "/api/system/dict-type/batch",
    permissionCode: "system:dict:batch",
    apiGroup: "字典管理",
  },
  {
    name: "字典数据分页",
    method: "GET",
    path: "/api/system/dict-data/list",
    permissionCode: "system:dict:data:list",
    apiGroup: "字典管理",
  },
  {
    name: "按类型查字典数据",
    method: "GET",
    path: "/api/system/dict-data/by-type/:code",
    permissionCode: "system:dict:data:list",
    apiGroup: "字典管理",
  },
  {
    name: "创建字典数据",
    method: "POST",
    path: "/api/system/dict-data",
    permissionCode: "system:dict:data:create",
    apiGroup: "字典管理",
  },
  {
    name: "更新字典数据",
    method: "PUT",
    path: "/api/system/dict-data/:id",
    permissionCode: "system:dict:data:update",
    apiGroup: "字典管理",
  },
  {
    name: "删除字典数据",
    method: "DELETE",
    path: "/api/system/dict-data/:id",
    permissionCode: "system:dict:data:delete",
    apiGroup: "字典管理",
  },
  {
    name: "批量操作字典数据",
    method: "POST",
    path: "/api/system/dict-data/batch",
    permissionCode: "system:dict:data:batch",
    apiGroup: "字典管理",
  },
  // —— 国际化 ——
  {
    name: "语言分页列表",
    method: "GET",
    path: "/api/system/i18n-locale/list",
    permissionCode: "system:i18n:list",
    apiGroup: "国际化",
  },
  {
    name: "语言全量列表",
    method: "GET",
    path: "/api/system/i18n-locale/all",
    permissionCode: "system:i18n:list",
    apiGroup: "国际化",
  },
  {
    name: "语言详情",
    method: "GET",
    path: "/api/system/i18n-locale/:id",
    permissionCode: "system:i18n:list",
    apiGroup: "国际化",
  },
  {
    name: "创建语言",
    method: "POST",
    path: "/api/system/i18n-locale",
    permissionCode: "system:i18n:create",
    apiGroup: "国际化",
  },
  {
    name: "更新语言",
    method: "PUT",
    path: "/api/system/i18n-locale/:id",
    permissionCode: "system:i18n:update",
    apiGroup: "国际化",
  },
  {
    name: "删除语言",
    method: "DELETE",
    path: "/api/system/i18n-locale/:id",
    permissionCode: "system:i18n:delete",
    apiGroup: "国际化",
  },
  {
    name: "批量操作语言",
    method: "POST",
    path: "/api/system/i18n-locale/batch",
    permissionCode: "system:i18n:batch",
    apiGroup: "国际化",
  },
  {
    name: "导出语言",
    method: "GET",
    path: "/api/system/i18n-locale/export",
    permissionCode: "system:i18n:export",
    apiGroup: "国际化",
  },
  {
    name: "批量导出语言",
    method: "POST",
    path: "/api/system/i18n-locale/export-batch",
    permissionCode: "system:i18n:export",
    apiGroup: "国际化",
  },
  {
    name: "翻译分页列表",
    method: "GET",
    path: "/api/system/i18n-translation/list",
    permissionCode: "system:i18n:list",
    apiGroup: "国际化",
  },
  {
    name: "按语言查翻译",
    method: "GET",
    path: "/api/system/i18n-translation/by-locale/:code",
    permissionCode: "system:i18n:list",
    apiGroup: "国际化",
  },
  {
    name: "按 key 查翻译",
    method: "GET",
    path: "/api/system/i18n-translation/by-key/:key",
    permissionCode: "system:i18n:list",
    apiGroup: "国际化",
  },
  {
    name: "创建翻译",
    method: "POST",
    path: "/api/system/i18n-translation",
    permissionCode: "system:i18n:create",
    apiGroup: "国际化",
  },
  {
    name: "更新翻译",
    method: "PUT",
    path: "/api/system/i18n-translation/:id",
    permissionCode: "system:i18n:update",
    apiGroup: "国际化",
  },
  {
    name: "删除翻译",
    method: "DELETE",
    path: "/api/system/i18n-translation/:id",
    permissionCode: "system:i18n:delete",
    apiGroup: "国际化",
  },
  {
    name: "批量操作翻译",
    method: "POST",
    path: "/api/system/i18n-translation/batch",
    permissionCode: "system:i18n:batch",
    apiGroup: "国际化",
  },
  {
    name: "按 key 批量 upsert 翻译",
    method: "POST",
    path: "/api/system/i18n-translation/batch-upsert-by-key",
    permissionCode: "system:i18n:update",
    apiGroup: "国际化",
  },
  {
    name: "导入翻译预览",
    method: "POST",
    path: "/api/system/i18n-translation/import-preview",
    permissionCode: "system:i18n:import",
    apiGroup: "国际化",
  },
  {
    name: "批量导入翻译",
    method: "POST",
    path: "/api/system/i18n-translation/import-batch",
    permissionCode: "system:i18n:import",
    apiGroup: "国际化",
  },
  // —— 日志审计 ——
  {
    name: "登录日志分页列表",
    method: "GET",
    path: "/api/system/login-log/list",
    permissionCode: "log:login-log:list",
    apiGroup: "日志审计",
  },
  {
    name: "API 日志分页列表",
    method: "GET",
    path: "/api/system/api-log/list",
    permissionCode: "log:api-log:list",
    apiGroup: "日志审计",
  },
  // —— 任务调度 ——
  {
    name: "任务配置分页",
    method: "GET",
    path: "/api/system/task-config/list",
    permissionCode: "task:config:list",
    apiGroup: "任务调度",
  },
  {
    name: "任务配置详情",
    method: "GET",
    path: "/api/system/task-config/:id",
    permissionCode: "task:config:list",
    apiGroup: "任务调度",
  },
  {
    name: "创建任务配置",
    method: "POST",
    path: "/api/system/task-config",
    permissionCode: "task:config:create",
    apiGroup: "任务调度",
  },
  {
    name: "更新任务配置",
    method: "PUT",
    path: "/api/system/task-config/:id",
    permissionCode: "task:config:update",
    apiGroup: "任务调度",
  },
  {
    name: "删除任务配置",
    method: "DELETE",
    path: "/api/system/task-config/:id",
    permissionCode: "task:config:delete",
    apiGroup: "任务调度",
  },
  {
    name: "批量操作任务配置",
    method: "POST",
    path: "/api/system/task-config/batch",
    permissionCode: "task:config:batch",
    apiGroup: "任务调度",
  },
  {
    name: "手动触发任务配置",
    method: "POST",
    path: "/api/system/task-config/:id/trigger",
    permissionCode: "task:config:trigger",
    apiGroup: "任务调度",
  },
  {
    name: "任务执行分页",
    method: "GET",
    path: "/api/system/task-execution/list",
    permissionCode: "task:execution:list",
    apiGroup: "任务调度",
  },
  {
    name: "任务执行详情",
    method: "GET",
    path: "/api/system/task-execution/:id",
    permissionCode: "task:execution:list",
    apiGroup: "任务调度",
  },
] as const;

/** 按 method+path 查找种子接口 id（deleted_at=0） */
function findSysApiId(method: string, path: string): number | undefined {
  const m = method.toUpperCase();
  return mockSysApiList.find((a) => a.deleted_at === 0 && a.method === m && a.path === path)?.id;
}

/** 种子：接口列表（与 API_SYNC_MANIFEST / 真实 mock 路由 1:1） */
function buildSysApiSeeds(): SysApi[] {
  const now = "2025-01-10T08:00:00.000Z";
  let id = 0;
  for (const item of API_SYNC_MANIFEST) {
    id += 1;
    mockSysApiList.push({
      id,
      name: item.name,
      method: item.method.toUpperCase(),
      path: item.path,
      permission_code: item.permissionCode,
      api_group: item.apiGroup,
      remark: "",
      is_enabled: 1,
      deleted_at: 0,
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    });
  }
  apiIdSeq = id;
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
  // sys_menu_api：按 method+path 绑定，避免硬编码 api_id
  if (mockSysMenuApiList.length === 0) {
    const now = "2025-01-10T08:00:00.000Z";
    const bind = (menuId: number, method: string, path: string) => {
      const apiId = findSysApiId(method, path);
      if (apiId !== undefined) {
        mockSysMenuApiList.push({
          menu_id: menuId,
          api_id: apiId,
          created_at: now,
          created_by: 0,
        });
      }
    };
    // 用户管理(201)
    bind(201, "GET", "/api/system/user/list");
    // 角色管理(202)
    bind(202, "GET", "/api/system/role/list");
    // 字典管理(203)
    bind(203, "GET", "/api/system/dict-type/list");
    // 国际化(204)
    bind(204, "GET", "/api/system/i18n-locale/list");
    // 菜单管理(205)
    bind(205, "GET", "/api/system/menu/list");
    // 接口管理(206)：列表 + 同步
    bind(206, "GET", "/api/system/api/list");
    bind(206, "POST", "/api/system/api/sync");
    // 登录日志 list 按钮(301)
    bind(301, "GET", "/api/system/login-log/list");
    // API 日志 list 按钮(302)
    bind(302, "GET", "/api/system/api-log/list");
    // 任务调度：配置 list + 执行 list（按钮 401/402）
    bind(401, "GET", "/api/system/task-config/list");
    bind(402, "GET", "/api/system/task-execution/list");
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
  if (mockSysApiList.length === 0) {
    buildSysApiSeeds();
  }
  const now = "2025-01-10T08:00:00.000Z";
  const rows: SysRoleApi[] = [];
  const active = mockSysApiList.filter((a) => a.deleted_at === 0);

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

// ============================================================
// API 调用日志 — api_log / api_log_archive
// 字段对齐 schema.sql v5；只增不改；列表/详情只读。
// ============================================================

export interface ApiLog {
  id: number;
  method: string;
  module: string;
  path: string;
  status_code: null | number;
  success: 0 | 1;
  reason: string;
  cost_time: number;
  request_id: string;
  sys_user_id: null | number;
  username: string;
  request_uri: string;
  request_query: string;
  request_body: string;
  request_header: string;
  referer: string;
  response: string;
  before_change: string;
  after_change: string;
  format_change: string;
  client_id: string;
  client_name: string;
  client_ip: string;
  user_agent: string;
  browser_name: string;
  browser_version: string;
  os_name: string;
  os_version: string;
  location: string;
  created_at: string;
}

export interface ApiLogArchive extends ApiLog {
  archived_at: string;
}

export interface AppendApiLogInput {
  method: string;
  path: string;
  module?: string;
  statusCode?: null | number;
  success?: 0 | 1;
  reason?: string;
  costTime?: number;
  requestId?: string;
  sysUserId?: null | number;
  username?: string;
  requestUri?: string;
  requestQuery?: string;
  requestBody?: string;
  requestHeader?: string;
  referer?: string;
  response?: string;
  beforeChange?: string;
  afterChange?: string;
  formatChange?: string;
  clientId?: string;
  clientName?: string;
  clientIp?: string;
  userAgent?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  osVersion?: string;
  location?: string;
  createdAt?: string;
}

const mockApiLogList: ApiLog[] = [];
const mockApiLogArchiveList: ApiLogArchive[] = [];

export function getMockApiLogList() {
  return mockApiLogList;
}

export function getMockApiLogArchiveList() {
  return mockApiLogArchiveList;
}

let apiLogIdSeq = 0;
function nextApiLogId(): number {
  apiLogIdSeq += 1;
  return apiLogIdSeq;
}

let apiLogArchiveIdSeq = 0;
function nextApiLogArchiveId(): number {
  apiLogArchiveIdSeq += 1;
  return apiLogArchiveIdSeq;
}

function makeRequestId(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(4, "0")}-${Date.now().toString(36)}`;
}

/** 追加一条热表 API 日志（只增不改）；写入前确保种子已就绪 */
export function appendApiLog(input: AppendApiLogInput): ApiLog {
  ensureApiLogSeeds();
  const now = input.createdAt ?? new Date().toISOString();
  const ua = input.userAgent ?? "";
  const parsed = parseUserAgent(ua);
  const status = input.statusCode ?? 200;
  const success: 0 | 1 =
    input.success ?? (status !== null && status >= 200 && status < 300 ? 1 : 0);
  const id = nextApiLogId();
  const row: ApiLog = {
    id,
    method: (input.method || "GET").toUpperCase(),
    module: input.module ?? "",
    path: input.path,
    status_code: status,
    success,
    reason: input.reason ?? "",
    cost_time: input.costTime ?? 0,
    request_id: input.requestId ?? makeRequestId("req", id),
    sys_user_id: input.sysUserId ?? null,
    username: input.username ?? "",
    request_uri: input.requestUri ?? input.path,
    request_query: input.requestQuery ?? "",
    request_body: input.requestBody ?? "",
    request_header: input.requestHeader ?? "",
    referer: input.referer ?? "",
    response: input.response ?? "",
    before_change: input.beforeChange ?? "",
    after_change: input.afterChange ?? "",
    format_change: input.formatChange ?? "",
    client_id: input.clientId ?? "web-admin",
    client_name: input.clientName ?? "Web Admin",
    client_ip: input.clientIp ?? "",
    user_agent: ua,
    browser_name: input.browserName ?? parsed.browser_name,
    browser_version: input.browserVersion ?? parsed.browser_version,
    os_name: input.osName ?? parsed.os_name,
    os_version: input.osVersion ?? parsed.os_version,
    location: input.location ?? "Mock-City",
    created_at: now,
  };
  mockApiLogList.push(row);
  return row;
}

function buildApiLogSeeds(): ApiLog[] {
  const chromeUa =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
  const macUa =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15";
  const seeds: Omit<ApiLog, "id">[] = [
    {
      method: "GET",
      module: "user",
      path: "/api/system/user/list",
      status_code: 200,
      success: 1,
      reason: "",
      cost_time: 42,
      request_id: "req-hot-0001-user-list",
      sys_user_id: 1,
      username: "vben",
      request_uri: "/api/system/user/list?page=1&pageSize=20",
      request_query: "page=1&pageSize=20",
      request_body: "",
      request_header: '{"accept":"application/json","authorization":"Bearer ***"}',
      referer: "http://localhost:5173/system/user",
      response: '{"code":0,"data":{"items":[],"total":0}}',
      before_change: "",
      after_change: "",
      format_change: "",
      client_id: "web-admin-vue3",
      client_name: "Vue Admin",
      client_ip: "10.0.0.12",
      user_agent: chromeUa,
      browser_name: "Chrome",
      browser_version: "122.0.0.0",
      os_name: "Windows",
      os_version: "10/11",
      location: "Mock-City",
      created_at: hoursAgo(1),
    },
    {
      method: "POST",
      module: "user",
      path: "/api/system/user",
      status_code: 200,
      success: 1,
      reason: "",
      cost_time: 128,
      request_id: "req-hot-0002-user-create",
      sys_user_id: 1,
      username: "vben",
      request_uri: "/api/system/user",
      request_query: "",
      request_body: '{"username":"demo","nickname":"Demo"}',
      request_header: '{"content-type":"application/json","authorization":"Bearer ***"}',
      referer: "http://localhost:5173/system/user",
      response: '{"code":0,"data":{"id":99}}',
      before_change: "",
      after_change: '{"id":99,"username":"demo","nickname":"Demo"}',
      format_change: "username: →demo; nickname: →Demo",
      client_id: "web-admin-vue3",
      client_name: "Vue Admin",
      client_ip: "10.0.0.12",
      user_agent: chromeUa,
      browser_name: "Chrome",
      browser_version: "122.0.0.0",
      os_name: "Windows",
      os_version: "10/11",
      location: "Mock-City",
      created_at: hoursAgo(2),
    },
    {
      method: "PUT",
      module: "role",
      path: "/api/system/role/2",
      status_code: 200,
      success: 1,
      reason: "",
      cost_time: 85,
      request_id: "req-hot-0003-role-update",
      sys_user_id: 2,
      username: "admin",
      request_uri: "/api/system/role/2",
      request_query: "",
      request_body: '{"name":"管理员","isEnabled":1}',
      request_header: '{"content-type":"application/json","authorization":"Bearer ***"}',
      referer: "http://localhost:5173/system/role",
      response: '{"code":0,"data":true}',
      before_change: '{"name":"Admin","isEnabled":1}',
      after_change: '{"name":"管理员","isEnabled":1}',
      format_change: "name: Admin→管理员",
      client_id: "web-admin-react",
      client_name: "React Admin",
      client_ip: "10.0.0.21",
      user_agent: macUa,
      browser_name: "Safari",
      browser_version: "17.2",
      os_name: "macOS",
      os_version: "14.3",
      location: "Mock-City",
      created_at: hoursAgo(4),
    },
    {
      method: "DELETE",
      module: "menu",
      path: "/api/system/menu/999",
      status_code: 404,
      success: 0,
      reason: "Menu not found",
      cost_time: 18,
      request_id: "req-hot-0004-menu-delete",
      sys_user_id: 2,
      username: "admin",
      request_uri: "/api/system/menu/999",
      request_query: "",
      request_body: "",
      request_header: '{"authorization":"Bearer ***"}',
      referer: "http://localhost:5173/system/menu",
      response: '{"code":404,"message":"Menu not found"}',
      before_change: "",
      after_change: "",
      format_change: "",
      client_id: "web-admin-react",
      client_name: "React Admin",
      client_ip: "10.0.0.21",
      user_agent: macUa,
      browser_name: "Safari",
      browser_version: "17.2",
      os_name: "macOS",
      os_version: "14.3",
      location: "Mock-City",
      created_at: hoursAgo(6),
    },
    {
      method: "GET",
      module: "auth",
      path: "/api/auth/userinfo",
      status_code: 401,
      success: 0,
      reason: "Token expired",
      cost_time: 5,
      request_id: "req-hot-0005-auth-userinfo",
      sys_user_id: null,
      username: "",
      request_uri: "/api/auth/userinfo",
      request_query: "",
      request_body: "",
      request_header: '{"authorization":"Bearer expired"}',
      referer: "",
      response: '{"code":401,"message":"Unauthorized"}',
      before_change: "",
      after_change: "",
      format_change: "",
      client_id: "web-admin-vue3",
      client_name: "Vue Admin",
      client_ip: "203.0.113.8",
      user_agent: chromeUa,
      browser_name: "Chrome",
      browser_version: "122.0.0.0",
      os_name: "Windows",
      os_version: "10/11",
      location: "Mock-City",
      created_at: hoursAgo(8),
    },
    {
      method: "GET",
      module: "dict",
      path: "/api/system/dict-data/list",
      status_code: 200,
      success: 1,
      reason: "",
      cost_time: 33,
      request_id: "req-hot-0006-dict-list",
      sys_user_id: 3,
      username: "jack",
      request_uri: "/api/system/dict-data/list?typeCode=user_status",
      request_query: "typeCode=user_status",
      request_body: "",
      request_header: '{"accept":"application/json","authorization":"Bearer ***"}',
      referer: "http://localhost:5173/system/dict",
      response: '{"code":0,"data":{"items":[{"value":"1","label":"启用"}]}}',
      before_change: "",
      after_change: "",
      format_change: "",
      client_id: "web-admin-vue3",
      client_name: "Vue Admin",
      client_ip: "10.0.0.33",
      user_agent: chromeUa,
      browser_name: "Chrome",
      browser_version: "122.0.0.0",
      os_name: "Windows",
      os_version: "10/11",
      location: "Mock-City",
      created_at: hoursAgo(12),
    },
    {
      method: "POST",
      module: "login-log",
      path: "/api/system/login-log/list",
      status_code: 405,
      success: 0,
      reason: "Method Not Allowed",
      cost_time: 2,
      request_id: "req-hot-0007-wrong-method",
      sys_user_id: 1,
      username: "vben",
      request_uri: "/api/system/login-log/list",
      request_query: "",
      request_body: "{}",
      request_header: '{"content-type":"application/json"}',
      referer: "http://localhost:5173/log?tab=login",
      response: '{"code":405,"message":"Method Not Allowed"}',
      before_change: "",
      after_change: "",
      format_change: "",
      client_id: "web-admin-vue3",
      client_name: "Vue Admin",
      client_ip: "10.0.0.12",
      user_agent: chromeUa,
      browser_name: "Chrome",
      browser_version: "122.0.0.0",
      os_name: "Windows",
      os_version: "10/11",
      location: "Mock-City",
      created_at: hoursAgo(24),
    },
    {
      method: "GET",
      module: "menu",
      path: "/api/system/menu/all",
      status_code: 500,
      success: 0,
      reason: "Internal Server Error",
      cost_time: 1200,
      request_id: "req-hot-0008-menu-all-err",
      sys_user_id: 1,
      username: "vben",
      request_uri: "/api/system/menu/all",
      request_query: "",
      request_body: "",
      request_header: '{"authorization":"Bearer ***"}',
      referer: "http://localhost:5173/system/menu",
      response: '{"code":500,"message":"Internal Server Error"}',
      before_change: "",
      after_change: "",
      format_change: "",
      client_id: "web-admin-vue3",
      client_name: "Vue Admin",
      client_ip: "10.0.0.12",
      user_agent: chromeUa,
      browser_name: "Chrome",
      browser_version: "122.0.0.0",
      os_name: "Windows",
      os_version: "10/11",
      location: "Mock-City",
      created_at: hoursAgo(36),
    },
  ];
  return seeds.map((s) => {
    const id = nextApiLogId();
    return { id, ...s };
  });
}

function buildApiLogArchiveSeeds(): ApiLogArchive[] {
  const chromeUa =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
  const seeds: Omit<ApiLogArchive, "id">[] = [
    {
      method: "GET",
      module: "user",
      path: "/api/system/user/list",
      status_code: 200,
      success: 1,
      reason: "",
      cost_time: 55,
      request_id: "req-arc-0001-user-list",
      sys_user_id: 1,
      username: "vben",
      request_uri: "/api/system/user/list?page=1",
      request_query: "page=1",
      request_body: "",
      request_header: '{"authorization":"Bearer ***"}',
      referer: "http://localhost:5173/system/user",
      response: '{"code":0,"data":{"items":[],"total":3}}',
      before_change: "",
      after_change: "",
      format_change: "",
      client_id: "web-admin-vue3",
      client_name: "Vue Admin",
      client_ip: "10.0.0.12",
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
      method: "POST",
      module: "auth",
      path: "/api/auth/login",
      status_code: 403,
      success: 0,
      reason: "Invalid credentials",
      cost_time: 30,
      request_id: "req-arc-0002-login-fail",
      sys_user_id: null,
      username: "ghost",
      request_uri: "/api/auth/login",
      request_query: "",
      request_body: '{"username":"ghost","password":"***"}',
      request_header: '{"content-type":"application/json"}',
      referer: "http://localhost:5173/auth/login",
      response: '{"code":403,"message":"Invalid credentials"}',
      before_change: "",
      after_change: "",
      format_change: "",
      client_id: "web-admin",
      client_name: "Web Admin",
      client_ip: "198.51.100.99",
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
      method: "PUT",
      module: "dict",
      path: "/api/system/dict-type/1",
      status_code: 200,
      success: 1,
      reason: "",
      cost_time: 70,
      request_id: "req-arc-0003-dict-update",
      sys_user_id: 2,
      username: "admin",
      request_uri: "/api/system/dict-type/1",
      request_query: "",
      request_body: '{"name":"用户状态"}',
      request_header: '{"content-type":"application/json"}',
      referer: "http://localhost:5173/system/dict",
      response: '{"code":0,"data":true}',
      before_change: '{"name":"User Status"}',
      after_change: '{"name":"用户状态"}',
      format_change: "name: User Status→用户状态",
      client_id: "web-admin-react",
      client_name: "React Admin",
      client_ip: "10.0.0.21",
      user_agent: chromeUa,
      browser_name: "Chrome",
      browser_version: "120.0.0.0",
      os_name: "Windows",
      os_version: "10/11",
      location: "Mock-City",
      created_at: daysAgo(60),
      archived_at: daysAgo(20),
    },
    {
      method: "DELETE",
      module: "role",
      path: "/api/system/role/9",
      status_code: 200,
      success: 1,
      reason: "",
      cost_time: 95,
      request_id: "req-arc-0004-role-delete",
      sys_user_id: 1,
      username: "vben",
      request_uri: "/api/system/role/9",
      request_query: "",
      request_body: "",
      request_header: '{"authorization":"Bearer ***"}',
      referer: "http://localhost:5173/system/role",
      response: '{"code":0,"data":true}',
      before_change: '{"id":9,"code":"temp"}',
      after_change: "",
      format_change: "deleted role temp",
      client_id: "web-admin-vue3",
      client_name: "Vue Admin",
      client_ip: "10.0.0.12",
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
      method: "GET",
      module: "i18n",
      path: "/api/system/i18n-locale/list",
      status_code: 200,
      success: 1,
      reason: "",
      cost_time: 22,
      request_id: "req-arc-0005-i18n-list",
      sys_user_id: 3,
      username: "jack",
      request_uri: "/api/system/i18n-locale/list",
      request_query: "",
      request_body: "",
      request_header: '{"authorization":"Bearer ***"}',
      referer: "http://localhost:5173/system/i18n",
      response: '{"code":0,"data":{"items":[{"code":"zh-CN"}]}}',
      before_change: "",
      after_change: "",
      format_change: "",
      client_id: "web-admin-vue3",
      client_name: "Vue Admin",
      client_ip: "10.0.0.33",
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
    const id = nextApiLogArchiveId();
    return { id, ...s };
  });
}

let apiLogSeedsReady = false;

/** 确保 API 日志种子已写入（幂等）。 */
export function ensureApiLogSeeds(): void {
  if (apiLogSeedsReady) return;
  apiLogSeedsReady = true;
  if (mockApiLogList.length === 0) {
    mockApiLogList.push(...buildApiLogSeeds());
  }
  if (mockApiLogArchiveList.length === 0) {
    mockApiLogArchiveList.push(...buildApiLogArchiveSeeds());
  }
}

// ============================================================
// Temporal 任务调度 — temporal_task_config / temporal_task_execution
// 字段对齐 backend/db/schema.sql §8 / §22；mock-only，不接真实 Temporal。
// ============================================================

export type TaskExecutionStatus =
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "TERMINATED"
  | "TIMED_OUT"
  | "CONTINUED_AS_NEW";

export interface TemporalTaskConfig {
  id: number;
  code: string;
  name: string;
  workflow_type: string;
  task_queue: string;
  /** NULL = 仅手动触发 */
  cron_expr: string | null;
  /** 重试策略 JSON 对象 */
  retry_policy: Record<string, unknown> | null;
  timeout_seconds: number | null;
  remark: string;
  is_enabled: 0 | 1;
  deleted_at: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
}

export interface TemporalTaskExecution {
  id: number;
  /** 软外键 → temporal_task_config.id；配置软删后可悬空 */
  config_id: number | null;
  workflow_id: string;
  run_id: string;
  workflow_type: string;
  task_queue: string;
  status: TaskExecutionStatus;
  started_at: string;
  closed_at: string | null;
  input_summary: Record<string, unknown> | null;
  result_summary: Record<string, unknown> | null;
  failure_reason: string | null;
  created_at: string;
}

const mockTemporalTaskConfigList: TemporalTaskConfig[] = [];
const mockTemporalTaskExecutionList: TemporalTaskExecution[] = [];

export function getMockTemporalTaskConfigList() {
  return mockTemporalTaskConfigList;
}

export function getMockTemporalTaskExecutionList() {
  return mockTemporalTaskExecutionList;
}

let taskConfigIdSeq = 0;
let taskExecutionIdSeq = 0;

export function nextTaskConfigId(): number {
  taskConfigIdSeq += 1;
  return taskConfigIdSeq;
}

export function nextTaskExecutionId(): number {
  taskExecutionIdSeq += 1;
  return taskExecutionIdSeq;
}

function buildTemporalTaskConfigSeeds(): TemporalTaskConfig[] {
  const base = {
    deleted_at: 0,
    created_by: 0,
    updated_by: 0,
  };
  return [
    {
      id: 1,
      code: "report_daily",
      name: "日报生成",
      workflow_type: "ReportDailyWorkflow",
      task_queue: "reports",
      cron_expr: "0 0 2 * * ?",
      retry_policy: { maxAttempts: 3, initialInterval: "30s", backoff: 2.0 },
      timeout_seconds: 3600,
      remark: "每日凌晨生成运营日报",
      is_enabled: 1,
      created_at: "2025-02-01T11:00:00.000Z",
      updated_at: "2025-02-01T11:00:00.000Z",
      ...base,
    },
    {
      id: 2,
      code: "order_settlement",
      name: "订单结算",
      workflow_type: "OrderSettlementWorkflow",
      task_queue: "finance",
      cron_expr: "0 0 1 * * ?",
      retry_policy: { maxAttempts: 5, initialInterval: "60s", backoff: 2.0 },
      timeout_seconds: 7200,
      remark: "订单日终结算",
      is_enabled: 1,
      created_at: "2025-02-01T11:01:00.000Z",
      updated_at: "2025-02-01T11:01:00.000Z",
      ...base,
    },
    {
      id: 3,
      code: "data_archive",
      name: "数据归档",
      workflow_type: "DataArchiveWorkflow",
      task_queue: "maintenance",
      cron_expr: "0 0 3 * * ?",
      retry_policy: { maxAttempts: 2, initialInterval: "120s", backoff: 1.5 },
      timeout_seconds: 14400,
      remark: "历史数据归档",
      is_enabled: 1,
      created_at: "2025-02-15T12:00:00.000Z",
      updated_at: "2025-02-15T12:00:00.000Z",
      ...base,
    },
    {
      id: 4,
      code: "cache_warmup",
      name: "缓存预热",
      workflow_type: "CacheWarmupWorkflow",
      task_queue: "maintenance",
      cron_expr: null,
      retry_policy: { maxAttempts: 2, initialInterval: "10s", backoff: 1.0 },
      timeout_seconds: 600,
      remark: "仅手动触发",
      is_enabled: 1,
      created_at: "2025-03-01T10:00:00.000Z",
      updated_at: "2025-03-01T10:00:00.000Z",
      ...base,
    },
    {
      id: 5,
      code: "session_cleanup",
      name: "会话清理",
      workflow_type: "SessionCleanupWorkflow",
      task_queue: "maintenance",
      cron_expr: "0 */30 * * * ?",
      retry_policy: { maxAttempts: 1 },
      timeout_seconds: 300,
      remark: "已禁用示例",
      is_enabled: 0,
      created_at: "2025-04-01T10:00:00.000Z",
      updated_at: "2025-04-01T10:00:00.000Z",
      ...base,
    },
  ];
}

function buildTemporalTaskExecutionSeeds(): TemporalTaskExecution[] {
  return [
    {
      id: 1,
      config_id: 1,
      workflow_id: "wf-report-20260620-0200",
      run_id: "run-aaa111",
      workflow_type: "ReportDailyWorkflow",
      task_queue: "reports",
      status: "COMPLETED",
      started_at: "2026-06-20T02:00:00.000Z",
      closed_at: "2026-06-20T02:08:42.000Z",
      input_summary: { date: "2026-06-20" },
      result_summary: { rows: 1280 },
      failure_reason: null,
      created_at: "2026-06-20T02:00:00.000Z",
    },
    {
      id: 2,
      config_id: 2,
      workflow_id: "wf-settle-20260620-0100",
      run_id: "run-bbb222",
      workflow_type: "OrderSettlementWorkflow",
      task_queue: "finance",
      status: "COMPLETED",
      started_at: "2026-06-20T01:00:00.000Z",
      closed_at: "2026-06-20T01:32:11.000Z",
      input_summary: null,
      result_summary: { settled: 42 },
      failure_reason: null,
      created_at: "2026-06-20T01:00:00.000Z",
    },
    {
      id: 3,
      config_id: 3,
      workflow_id: "wf-archive-20260620-0300",
      run_id: "run-ccc333",
      workflow_type: "DataArchiveWorkflow",
      task_queue: "maintenance",
      status: "FAILED",
      started_at: "2026-06-20T03:00:00.000Z",
      closed_at: "2026-06-20T03:05:21.000Z",
      input_summary: null,
      result_summary: null,
      failure_reason: "connection timeout to archive-db",
      created_at: "2026-06-20T03:00:00.000Z",
    },
    {
      id: 4,
      config_id: 1,
      workflow_id: "wf-report-20260619-0200",
      run_id: "run-aaa110",
      workflow_type: "ReportDailyWorkflow",
      task_queue: "reports",
      status: "COMPLETED",
      started_at: "2026-06-19T02:00:00.000Z",
      closed_at: "2026-06-19T02:07:55.000Z",
      input_summary: { date: "2026-06-19" },
      result_summary: { rows: 1199 },
      failure_reason: null,
      created_at: "2026-06-19T02:00:00.000Z",
    },
    {
      id: 5,
      config_id: 2,
      workflow_id: "wf-settle-20260619-0100",
      run_id: "run-bbb221",
      workflow_type: "OrderSettlementWorkflow",
      task_queue: "finance",
      status: "COMPLETED",
      started_at: "2026-06-19T01:00:00.000Z",
      closed_at: "2026-06-19T01:28:43.000Z",
      input_summary: null,
      result_summary: { settled: 38 },
      failure_reason: null,
      created_at: "2026-06-19T01:00:00.000Z",
    },
    {
      id: 6,
      config_id: 4,
      workflow_id: "wf-warmup-20260620-0814",
      run_id: "run-ddd444",
      workflow_type: "CacheWarmupWorkflow",
      task_queue: "maintenance",
      status: "RUNNING",
      started_at: "2026-06-20T08:14:00.000Z",
      closed_at: null,
      input_summary: { keys: ["home", "catalog"] },
      result_summary: null,
      failure_reason: null,
      created_at: "2026-06-20T08:14:00.000Z",
    },
    {
      id: 7,
      config_id: 5,
      workflow_id: "wf-cleanup-20260620-0930",
      run_id: "run-eee555",
      workflow_type: "SessionCleanupWorkflow",
      task_queue: "maintenance",
      status: "TIMED_OUT",
      started_at: "2026-06-20T09:30:00.000Z",
      closed_at: "2026-06-20T09:35:00.000Z",
      input_summary: null,
      result_summary: null,
      failure_reason: "timeout 300s exceeded",
      created_at: "2026-06-20T09:30:00.000Z",
    },
    {
      id: 8,
      config_id: 1,
      workflow_id: "wf-report-20260618-0200",
      run_id: "run-aaa109",
      workflow_type: "ReportDailyWorkflow",
      task_queue: "reports",
      status: "COMPLETED",
      started_at: "2026-06-18T02:00:00.000Z",
      closed_at: "2026-06-18T02:08:12.000Z",
      input_summary: { date: "2026-06-18" },
      result_summary: { rows: 1305 },
      failure_reason: null,
      created_at: "2026-06-18T02:00:00.000Z",
    },
  ];
}

/** 为启用中的配置合成一条 mock 执行记录（手动/批量触发）。 */
export function appendMockTaskExecution(
  config: TemporalTaskConfig,
  opts?: { status?: TaskExecutionStatus; failureReason?: string | null },
): TemporalTaskExecution {
  const now = isoNow();
  const stamp = now.replace(/[-:TZ.]/g, "").slice(0, 14);
  const id = nextTaskExecutionId();
  const status = opts?.status ?? "RUNNING";
  const closed = status === "RUNNING" ? null : now;
  const row: TemporalTaskExecution = {
    id,
    config_id: config.id,
    workflow_id: `wf-${config.code}-${stamp}-${id}`,
    run_id: `run-${stamp}-${id}`,
    workflow_type: config.workflow_type,
    task_queue: config.task_queue,
    status,
    started_at: now,
    closed_at: closed,
    input_summary: { trigger: "manual", configCode: config.code },
    result_summary: status === "COMPLETED" ? { ok: true } : null,
    failure_reason: opts?.failureReason ?? null,
    created_at: now,
  };
  mockTemporalTaskExecutionList.unshift(row);
  return row;
}

/** 解析配置名：配置软删或缺失时返回 null（前端展示 —） */
export function resolveTaskConfigName(configId: number | null): string | null {
  if (configId == null) return null;
  const found = mockTemporalTaskConfigList.find((c) => c.id === configId);
  if (!found || found.deleted_at !== 0) return null;
  return found.name;
}

let temporalTaskSeedsReady = false;

/** 确保 Temporal 任务配置/执行种子已写入（幂等）。 */
export function ensureTemporalTaskSeeds(): void {
  if (temporalTaskSeedsReady) return;
  temporalTaskSeedsReady = true;
  if (mockTemporalTaskConfigList.length === 0) {
    const configs = buildTemporalTaskConfigSeeds();
    mockTemporalTaskConfigList.push(...configs);
    taskConfigIdSeq = Math.max(...configs.map((c) => c.id), 0);
  }
  if (mockTemporalTaskExecutionList.length === 0) {
    const execs = buildTemporalTaskExecutionSeeds();
    mockTemporalTaskExecutionList.push(...execs);
    taskExecutionIdSeq = Math.max(...execs.map((e) => e.id), 0);
  }
}
