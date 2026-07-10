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

export const MOCK_USERS: UserInfo[] = [
  {
    id: 0,
    password: "123456",
    realName: "Vben",
    roles: ["super"],
    username: "vben",
  },
  {
    id: 1,
    password: "123456",
    realName: "Admin",
    roles: ["admin"],
    username: "admin",
    homePath: "/workspace",
  },
  {
    id: 2,
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

const createDemosMenus = (role: "admin" | "super" | "user") => {
  const roleWithMenus = {
    admin: {
      component: "/demos/access/admin-visible",
      meta: {
        icon: "mdi:button-cursor",
        title: "demos.access.adminVisible",
      },
      name: "AccessAdminVisibleDemo",
      path: "/demos/access/admin-visible",
    },
    super: {
      component: "/demos/access/super-visible",
      meta: {
        icon: "mdi:button-cursor",
        title: "demos.access.superVisible",
      },
      name: "AccessSuperVisibleDemo",
      path: "/demos/access/super-visible",
    },
    user: {
      component: "/demos/access/user-visible",
      meta: {
        icon: "mdi:button-cursor",
        title: "demos.access.userVisible",
      },
      name: "AccessUserVisibleDemo",
      path: "/demos/access/user-visible",
    },
  };

  return [
    {
      meta: {
        icon: "ic:baseline-view-in-ar",
        keepAlive: true,
        order: 1000,
        title: "demos.title",
      },
      name: "Demos",
      path: "/demos",
      redirect: "/demos/access",
      children: [
        {
          name: "AccessDemos",
          path: "/demosaccess",
          meta: {
            icon: "mdi:cloud-key-outline",
            title: "demos.access.backendPermissions",
          },
          redirect: "/demos/access/page-control",
          children: [
            {
              name: "AccessPageControlDemo",
              path: "/demos/access/page-control",
              component: "/demos/access/index",
              meta: {
                icon: "mdi:page-previous-outline",
                title: "demos.access.pageAccess",
              },
            },
            {
              name: "AccessButtonControlDemo",
              path: "/demos/access/button-control",
              component: "/demos/access/button-control",
              meta: {
                icon: "mdi:button-cursor",
                title: "demos.access.buttonControl",
              },
            },
            {
              name: "AccessMenuVisible403Demo",
              path: "/demos/access/menu-visible-403",
              component: "/demos/access/menu-visible-403",
              meta: {
                authority: ["no-body"],
                icon: "mdi:button-cursor",
                menuVisibleWithForbidden: true,
                title: "demos.access.menuVisible403",
              },
            },
            roleWithMenus[role],
          ],
        },
      ],
    },
  ];
};

export const MOCK_MENUS = [
  {
    menus: [...dashboardMenus, ...createDemosMenus("super")],
    username: "vben",
  },
  {
    menus: [...dashboardMenus, ...createDemosMenus("admin")],
    username: "admin",
  },
  {
    menus: [...dashboardMenus, ...createDemosMenus("user")],
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

/** 种子：菜单树（复刻 admin.js DATA.menus） */
function buildSysMenuSeeds(): SysMenu[] {
  const now = "2025-01-10T08:00:00.000Z";
  // 先构造无 tree_path，再统一补算（依赖 parent 已入 list）
  const defs: Array<Omit<SysMenu, "tree_path">> = [
    {
      id: 1,
      parent_id: null,
      name: "权限管理",
      type: "DIR",
      path: null,
      component: null,
      icon: "lock",
      redirect: "",
      permission_code: null,
      metadata: null,
      sort: 1,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 11,
      parent_id: 1,
      name: "用户管理",
      type: "MENU",
      path: "/admin/users",
      component: "views/admin/users/index",
      icon: "user",
      redirect: "",
      permission_code: "admin:user:list",
      metadata: null,
      sort: 1,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 111,
      parent_id: 11,
      name: "新增用户",
      type: "BUTTON",
      path: null,
      component: null,
      icon: "",
      redirect: "",
      permission_code: "admin:user:create",
      metadata: null,
      sort: 1,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 112,
      parent_id: 11,
      name: "编辑用户",
      type: "BUTTON",
      path: null,
      component: null,
      icon: "",
      redirect: "",
      permission_code: "admin:user:update",
      metadata: null,
      sort: 2,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 113,
      parent_id: 11,
      name: "删除用户",
      type: "BUTTON",
      path: null,
      component: null,
      icon: "",
      redirect: "",
      permission_code: "admin:user:delete",
      metadata: null,
      sort: 3,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 12,
      parent_id: 1,
      name: "角色管理",
      type: "MENU",
      path: "/admin/roles",
      component: "views/admin/roles/index",
      icon: "role",
      redirect: "",
      permission_code: "admin:role:list",
      metadata: null,
      sort: 2,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 13,
      parent_id: 1,
      name: "菜单管理",
      type: "MENU",
      path: "/admin/menus",
      component: "views/admin/menus/index",
      icon: "menu",
      redirect: "",
      permission_code: "admin:menu:list",
      metadata: null,
      sort: 3,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 14,
      parent_id: 1,
      name: "接口管理",
      type: "MENU",
      path: "/admin/apis",
      component: "views/admin/apis/index",
      icon: "api",
      redirect: "",
      permission_code: "admin:api:list",
      metadata: null,
      sort: 4,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 15,
      parent_id: 1,
      name: "数据权限",
      type: "MENU",
      path: "/admin/data-permission",
      component: "views/admin/data-permission/index",
      icon: "shield",
      redirect: "",
      permission_code: "admin:dp:list",
      metadata: null,
      sort: 5,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 2,
      parent_id: null,
      name: "系统配置",
      type: "DIR",
      path: null,
      component: null,
      icon: "cog",
      redirect: "",
      permission_code: null,
      metadata: null,
      sort: 2,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 21,
      parent_id: 2,
      name: "字典管理",
      type: "MENU",
      path: "/admin/dict",
      component: "views/admin/dict/index",
      icon: "book",
      redirect: "",
      permission_code: "admin:dict:list",
      metadata: null,
      sort: 1,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 22,
      parent_id: 2,
      name: "国际化",
      type: "MENU",
      path: "/admin/i18n",
      component: "views/admin/i18n/index",
      icon: "globe",
      redirect: "",
      permission_code: "admin:i18n:list",
      metadata: null,
      sort: 2,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 3,
      parent_id: null,
      name: "任务调度",
      type: "DIR",
      path: null,
      component: null,
      icon: "clock",
      redirect: "",
      permission_code: null,
      metadata: null,
      sort: 3,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 31,
      parent_id: 3,
      name: "任务配置",
      type: "MENU",
      path: "/admin/tasks",
      component: "views/admin/tasks/index",
      icon: "task",
      redirect: "",
      permission_code: "admin:task:list",
      metadata: null,
      sort: 1,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 32,
      parent_id: 3,
      name: "执行记录",
      type: "MENU",
      path: "/admin/tasks/executions",
      component: "views/admin/tasks/executions",
      icon: "history",
      redirect: "",
      permission_code: "admin:task:execution:list",
      metadata: null,
      sort: 2,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 4,
      parent_id: null,
      name: "日志审计",
      type: "DIR",
      path: null,
      component: null,
      icon: "doc",
      redirect: "",
      permission_code: null,
      metadata: null,
      sort: 4,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 41,
      parent_id: 4,
      name: "API 日志",
      type: "MENU",
      path: "/admin/logs/api",
      component: "views/admin/logs/api",
      icon: "link",
      redirect: "",
      permission_code: "admin:log:api:list",
      metadata: null,
      sort: 1,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 42,
      parent_id: 4,
      name: "登录日志",
      type: "MENU",
      path: "/admin/logs/login",
      component: "views/admin/logs/login",
      icon: "login",
      redirect: "",
      permission_code: "admin:log:login:list",
      metadata: null,
      sort: 2,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
    {
      id: 43,
      parent_id: 4,
      name: "操作日志",
      type: "MENU",
      path: "/admin/logs/operation",
      component: "views/admin/logs/operation",
      icon: "edit",
      redirect: "",
      permission_code: "admin:log:op:list",
      metadata: null,
      sort: 3,
      is_hidden: 0,
      is_enabled: 1,
      deleted_at: 0,
      remark: "",
      created_at: now,
      updated_at: now,
      created_by: 0,
      updated_by: 0,
    },
  ];
  // 按顺序入 list，再补算 tree_path（保证计算时父节点已在 list）
  for (const d of defs) {
    mockSysMenuList.push({ ...d, tree_path: buildTreePath(d.id, d.parent_id) });
  }
  // 同步 menuIdSeq 种子上限，避免后续新增 id 撞种子
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
      id: 14,
      name: "刷新令牌",
      method: "POST",
      path: "/api/auth/refresh",
      permission_code: "auth:refresh",
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
  // sys_menu_api 种子：菜单管理(13) 绑定「菜单树」「接口同步」两个接口（7、8）作示例
  if (mockSysMenuApiList.length === 0) {
    const now = "2025-01-10T08:00:00.000Z";
    mockSysMenuApiList.push(
      { menu_id: 13, api_id: 7, created_at: now, created_by: 0 },
      { menu_id: 13, api_id: 8, created_at: now, created_by: 0 },
    );
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
    name: "刷新令牌",
    method: "POST",
    path: "/api/auth/refresh",
    permissionCode: "auth:refresh",
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
