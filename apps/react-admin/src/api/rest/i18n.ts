import { del, get, post, put } from './request';
import type {
  CreateI18nLocaleRequest,
  CreateI18nTranslationRequest,
  I18nLocale,
  I18nLocaleQuery,
  I18nTranslation,
  I18nTranslationQuery,
  PageResult,
  UpdateI18nLocaleRequest,
  UpdateI18nTranslationRequest,
} from './types';

/* ============================================================
 * 语言 (i18n-locale)
 * ============================================================ */

/** 分页列出语言 */
export function listI18nLocaleApi(query: I18nLocaleQuery = {}) {
  return get<PageResult<I18nLocale>>(
    '/system/i18n-locale/list',
    query as Record<string, unknown>,
  );
}

/** 列出全部语言（联动下拉用） */
export function listAllI18nLocaleApi(params?: {
  status?: 0 | 1;
  code?: string | string[];
  name?: string;
}) {
  return get<I18nLocale[]>(
    '/system/i18n-locale/all',
    (params ?? {}) as Record<string, unknown>,
  );
}

/** 语言详情 */
export function getI18nLocaleApi(id: number) {
  return get<I18nLocale>(`/system/i18n-locale/${id}`);
}

/** 新建语言 */
export function createI18nLocaleApi(body: CreateI18nLocaleRequest) {
  return post<I18nLocale>('/system/i18n-locale', body);
}

/** 更新语言 */
export function updateI18nLocaleApi({ id, ...patch }: UpdateI18nLocaleRequest) {
  return put<I18nLocale>(`/system/i18n-locale/${id}`, patch);
}

/** 删除语言 */
export function deleteI18nLocaleApi(id: number) {
  return del<unknown>(`/system/i18n-locale/${id}`);
}

/** 批量操作语言 */
export function batchI18nLocaleApi(body: {
  action: 'enable' | 'disable' | 'delete';
  ids: number[];
}) {
  return post<{ action: string; affected: number; ids: number[] }>(
    '/system/i18n-locale/batch',
    body,
  );
}

/* ============================================================
 * 翻译 (i18n-translation)
 * ============================================================ */

/** 分页列出翻译 */
export function listI18nTranslationApi(query: I18nTranslationQuery = {}) {
  return get<PageResult<I18nTranslation>>(
    '/system/i18n-translation/list',
    query as Record<string, unknown>,
  );
}

/** 按语言 code 拉启用翻译（下拉用） */
export function listI18nTranslationByLocaleCodeApi(code: string) {
  return get<I18nTranslation[]>(
    `/system/i18n-translation/by-locale/${encodeURIComponent(code)}`,
  );
}

/** 新建翻译 */
export function createI18nTranslationApi(body: CreateI18nTranslationRequest) {
  return post<I18nTranslation>('/system/i18n-translation', body);
}

/** 更新翻译 */
export function updateI18nTranslationApi({
  id,
  ...patch
}: UpdateI18nTranslationRequest) {
  return put<I18nTranslation>(`/system/i18n-translation/${id}`, patch);
}

/** 删除翻译 */
export function deleteI18nTranslationApi(id: number) {
  return del<unknown>(`/system/i18n-translation/${id}`);
}

/** 批量操作翻译 */
export function batchI18nTranslationApi(body: {
  action: 'enable' | 'disable' | 'delete';
  ids: number[];
}) {
  return post<{ action: string; affected: number; ids: number[] }>(
    '/system/i18n-translation/batch',
    body,
  );
}
