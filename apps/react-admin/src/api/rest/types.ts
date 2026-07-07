/** vben 风格的 mock 接口类型 */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number | string;
  username: string;
  realName: string;
  roles: string[];
  homePath?: string;
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export type AccessCode = string;

export interface UserInfo {
  id: number | string;
  username: string;
  realName: string;
  roles: string[];
  homePath?: string;
  avatar?: string;
  email?: string;
  tenantId?: string | number;
  [k: string]: unknown;
}

export interface UserListItem {
  id: string;
  username: string;
  realName: string;
  email: string;
  phone: string;
  status: 0 | 1;
  roles: string[];
  remark: string;
  createTime: string;
}

export interface PageResult<T> {
  items: T[];
  total: number;
}

export interface UserListQuery {
  page?: number;
  pageSize?: number;
  username?: string;
  realName?: string;
  status?: 0 | 1;
  [k: string]: unknown;
}

export interface CreateUserRequest {
  username: string;
  realName?: string;
  email?: string;
  phone?: string;
  status?: 0 | 1;
  roles?: string[];
  remark?: string;
}

export interface UpdateUserRequest {
  id: string;
  data: Partial<UserListItem>;
}

export interface MenuMeta {
  title?: string;
  icon?: string;
  order?: number;
  hideInMenu?: boolean;
  affixTab?: boolean;
  keepAlive?: boolean;
  authority?: string[];
  iframeSrc?: string;
  link?: string;
  badge?: string;
  badgeType?: string;
  badgeVariants?: string;
  [k: string]: unknown;
}

export interface MenuItem {
  id?: number | string;
  name?: string;
  path?: string;
  component?: string;
  redirect?: string;
  meta?: MenuMeta;
  children?: MenuItem[];
  [k: string]: unknown;
}

// ============================================================
// 字典管理（dict_type / dict_data）
// 字段对齐 backend-mock-template 的 schema；软删 deleted_at: 0=未删
// ============================================================

/**
 * 与 antd `_util/type` 内 `LiteralUnion` 等价的最小实现。
 *
 * antd 入口未 re-export LiteralUnion，因此在本文件内联；语义与 antd 官方
 * `T | (U & Record<never, never>)` 一致：
 *  - T 部分给 IDE auto-complete（命中预设字面量时收窄）
 *  - 任意 string 仍可传入，避免丢失向后兼容
 */
export type LiteralUnion<T, U extends string = string> =
  | T
  | (U & Record<never, never>);

/**
 * 预设样式联合类型：与 antd `<Tag color>` prop 的官方签名一致。
 * 从 antd `_util/colors` 子路径取类型，避免依赖入口是否 re-export。
 */
export type DictTagType = LiteralUnion<
  import('antd/_util/colors').PresetColorType | import('antd/_util/colors').PresetStatusColorType
>;

export interface DictType {
  id: number;
  code: string;
  name: string;
  remark: string;
  isEnabled: 0 | 1;
  deletedAt: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
}

export interface DictData {
  id: number;
  typeId: number;
  value: string;
  label: string;
  sort: number;
  isDefault: 0 | 1;
  /** 归属平台：general / react-admin / vue-admin；与 schema v8 对齐 */
  platform: string;
  /**
   * 预设样式标识：与 antd `<Tag color>` 签名一致
   * （LiteralUnion<PresetColorType | PresetStatusColorType>）。
   * 可选值集合收敛到 13 项 preset 色 + 13 项 inverse + 5 项状态色
   * （default / primary / success / warning / error / processing
   *  / magenta / red / volcano / orange / gold / lime / green
   *  / cyan / blue / geekblue / purple / 各自 -inverse）。
   * 与 backend-mock 的 ALLOWED_TAG_TYPES（17 项无 inverse）完全相容。
   */
  tagType: DictTagType;
  isEnabled: 0 | 1;
  deletedAt: number;
  remark: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
  /** 关联的字典类型编码（仅 list 接口返回） */
  typeCode?: string;
}

export interface DictTypeQuery {
  page?: number;
  pageSize?: number;
  /** 字典类型编码；前端多选下拉时传数组（精确匹配任一） */
  code?: string | string[];
  name?: string;
  status?: 0 | 1;
}

export interface DictDataQuery {
  page?: number;
  pageSize?: number;
  typeId?: number;
  /** 字典类型编码；多选下拉时传数组（精确匹配任一） */
  typeCode?: string | string[];
  label?: string;
  value?: string;
  status?: 0 | 1;
  /** 归属平台过滤（精确匹配；缺省由 hooks 层注入 VITE_APP_PLATFORM） */
  platform?: string;
  /** 是否把通用（general）并入过滤结果（仅当 platform !== 'general' 时生效） */
  includeGeneral?: boolean;
}

export interface CreateDictTypeRequest {
  code: string;
  name: string;
  remark?: string;
  isEnabled?: 0 | 1;
}

export interface UpdateDictTypeRequest {
  id: number;
  code?: string;
  name?: string;
  remark?: string;
  isEnabled?: 0 | 1;
}

export interface CreateDictDataRequest {
  typeId: number;
  value: string;
  label: string;
  sort?: number;
  isDefault?: boolean;
  /** 归属平台；缺省 mock 层回退到 'general' */
  platform?: string;
  /** 预设样式标识；缺省 mock 层回退到 'default' */
  tagType?: DictTagType;
  isEnabled?: 0 | 1;
  remark?: string;
}

export interface UpdateDictDataRequest {
  id: number;
  value?: string;
  label?: string;
  sort?: number;
  isDefault?: 0 | 1;
  platform?: string;
  tagType?: DictTagType;
  isEnabled?: 0 | 1;
  remark?: string;
}

// ============================================================
// I18n（i18n_locale / i18n_translation）
// 字段对齐 backend-mock-template 的 schema；软删 deleted_at: 0=未删
// ============================================================

export interface I18nLocale {
  id: number;
  code: string;
  name: string;
  isDefault: 0 | 1;
  sort: number;
  remark: string;
  isEnabled: 0 | 1;
  deletedAt: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
}

export interface I18nTranslation {
  id: number;
  localeId: number;
  translationKey: string;
  value: string;
  remark: string;
  isEnabled: 0 | 1;
  deletedAt: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
  /** 关联语言编码（仅 list 接口 join 后返回） */
  localeCode?: string;
}

export interface I18nLocaleQuery {
  page?: number;
  pageSize?: number;
  code?: string | string[];
  name?: string;
  status?: 0 | 1;
}

export interface I18nTranslationQuery {
  page?: number;
  pageSize?: number;
  /** 精确匹配语言 ID（与 localeCode 二选一；都传以 localeId 优先） */
  localeId?: number;
  /** 按语言编码过滤（前端选中左表行时使用） */
  localeCode?: string;
  /** 模糊匹配 key 或 value */
  value?: string;
  status?: 0 | 1;
}

export interface CreateI18nLocaleRequest {
  code: string;
  name: string;
  sort?: number;
  remark?: string;
  isDefault?: 0 | 1;
  isEnabled?: 0 | 1;
}

export interface UpdateI18nLocaleRequest {
  id: number;
  code?: string;
  name?: string;
  sort?: number;
  remark?: string;
  isDefault?: 0 | 1;
  isEnabled?: 0 | 1;
}

export interface CreateI18nTranslationRequest {
  localeId: number;
  translationKey: string;
  value: string;
  remark?: string;
  isEnabled?: 0 | 1;
}

export interface UpdateI18nTranslationRequest {
  id: number;
  translationKey?: string;
  value?: string;
  remark?: string;
  isEnabled?: 0 | 1;
}

/**
 * 按 translation_key 聚合返回的多语言版本（GET /system/i18n-translation/by-key/:key）。
 * 缺失 key 时 values 为空数组。
 */
export interface I18nTranslationByKeyValue {
  id: number;
  localeId: number;
  localeCode?: string;
  value: string;
  remark: string;
  isEnabled: 0 | 1;
}

export interface I18nTranslationByKeyResponse {
  translationKey: string;
  values: I18nTranslationByKeyValue[];
}

/**
 * 单 key 多语言事务化 upsert（POST /system/i18n-translation/batch-upsert-by-key）。
 * 处理顺序：rename → delete → upsert，任一阶段失败即返回 errors，不继续后续阶段。
 */
export interface I18nTranslationBatchUpsertByKeyItem {
  localeId: number;
  value: string;
  remark?: string;
  isEnabled?: 0 | 1;
}

export interface I18nTranslationBatchUpsertByKeyRequest {
  translationKey: string;
  /** 可选：仅「剩 1 row」时才提供 */
  newTranslationKey?: string;
  items: I18nTranslationBatchUpsertByKeyItem[];
  /** 可选：随本次保存一起删除的 row id */
  deletedIds?: number[];
}

export interface I18nTranslationBatchUpsertError {
  code: string;
  message: string;
  localeId?: number;
  id?: number;
}

export interface I18nTranslationBatchUpsertByKeyResponse {
  ok: boolean;
  affected?: { renamed: number; created: number; updated: number; deleted: number };
  values?: I18nTranslationByKeyValue[];
  errors?: I18nTranslationBatchUpsertError[];
}

// ============================================================
// I18n 导出 / 导入 / 同步
// ============================================================

/** 导出 JSON 请求参数 */
export interface I18nExportParams {
  ids: number[];
  type: 'raw' | 'simple';
}

/** raw 导出格式 */
export interface I18nRawExport {
  '@type': 'raw';
  locale: I18nLocale;
  translations: Array<{
    id?: number;
    translationKey: string;
    value: string;
    remark?: string;
    isEnabled?: 0 | 1;
  }>;
}

/** simple 导出格式：顶层为嵌套字典（unflatten 后即得到 key/value） */
export interface I18nSimpleExport {
  '@type': 'simple';
  [key: string]: unknown;
}

export type I18nExportData = I18nRawExport | I18nSimpleExport;

/* ============================================================
 * 批量导入（多文件）— import-batch / import-preview / export-batch
 * ============================================================ */

export type I18nImportFormat = 'raw' | 'simple';

export interface I18nImportBatchItem {
  /** 文件名（用于 perFile 回显与 UI 标记） */
  name: string;
  /** key 前缀拼接；空或省略表示原样 */
  prefix?: string;
  /** 该文件的目标语言 code（simple 必填，raw 优先取文件内 locale.code） */
  localeCode: string;
  format: I18nImportFormat;
  /** 已 JSON.parse 后的 payload */
  payload: unknown;
}

export interface I18nImportBatchRequest {
  items: I18nImportBatchItem[];
}

export interface I18nImportBatchPerFile {
  name: string;
  ok: boolean;
  error?: string;
  createdLocales: number;
  softDeleted: number;
  createdTranslations: number;
}

export interface I18nImportBatchResponse {
  ok: boolean;
  affected: {
    createdLocales: number;
    softDeleted: number;
    createdTranslations: number;
    perFile: I18nImportBatchPerFile[];
  };
}

export interface I18nImportPreviewItem {
  localeCode: string;
  keys: string[];
}

export interface I18nImportPreviewRequest {
  items: I18nImportPreviewItem[];
}

export interface I18nImportPreviewResponse {
  currentRows: I18nTranslation[];
}

export interface I18nExportBatchRequest {
  ids: number[];
  format: I18nImportFormat;
}

export interface I18nExportBatchFile {
  code: string;
  format: I18nImportFormat;
  content: I18nRawExport | I18nSimpleExport;
}

export interface I18nExportBatchResponse {
  files: I18nExportBatchFile[];
}
