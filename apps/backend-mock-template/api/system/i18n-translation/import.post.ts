import { defineEventHandler, readBody, setResponseStatus } from "h3";
import {
  ensureI18nSeeds,
  getMockI18nLocaleList,
  getMockI18nTranslationList,
  isoNow,
  nextI18nId,
  type I18nLocale,
  type I18nTranslation,
} from "~/utils/mock-data";
import { useResponseError, useResponseSuccess } from "~/utils/response";

/**
 * POST /api/system/i18n-translation/import
 *
 * Body: { "@type": "raw"|"simple", locales: {...}, translations: [...] }
 * 无 @type 时按 simple 处理。
 *
 * 冲突策略：软删除旧 key + insert 新记录（保留历史）。
 */

interface RawImport {
  "@type"?: "raw" | "simple";
  locales?: Array<{
    code: string;
    name: string;
    isDefault?: 0 | 1;
    sort?: number;
    remark?: string;
    isEnabled?: 0 | 1;
  }>;
  translations?: Array<{
    localeCode?: string;
    localeId?: number;
    translationKey: string;
    value: string;
    remark?: string;
    isEnabled?: 0 | 1;
  }>;
}

interface SimpleImport {
  "@type"?: "raw" | "simple";
  locales?: Record<string, Record<string, string>>;
}

export default defineEventHandler(async (event) => {
  ensureI18nSeeds();

  const body = (await readBody(event)) as
    | RawImport
    | SimpleImport
    | Record<string, Record<string, string>>;

  if (!body || typeof body !== "object") {
    setResponseStatus(event, 400);
    return useResponseError("BadRequest", "body is required");
  }

  const localeList = getMockI18nLocaleList();
  const translationList = getMockI18nTranslationList();
  const nowMs = Date.now();

  // 检测 @type
  const type = (body as any)["@type"] as string | undefined;

  let createdLocales = 0;
  let softDeleted = 0;
  let createdTranslations = 0;

  if (type === "raw") {
    const raw = body as RawImport;

    // 1) 处理 locales
    const codeToLocaleId = new Map<string, number>();
    if (Array.isArray(raw.locales)) {
      for (const loc of raw.locales) {
        if (!loc.code || !loc.name) continue;
        // 查找已有
        const existing = localeList.find((l) => l.code === loc.code && l.deleted_at === 0);
        if (existing) {
          // 更新字段
          existing.name = loc.name;
          existing.is_default = loc.isDefault ?? existing.is_default;
          existing.sort = loc.sort ?? existing.sort;
          existing.remark = loc.remark ?? existing.remark;
          existing.is_enabled = loc.isEnabled ?? existing.is_enabled;
          existing.updated_at = isoNow();
          codeToLocaleId.set(loc.code, existing.id);
        } else {
          const id = nextI18nId();
          const now = isoNow();
          localeList.push({
            id,
            code: loc.code,
            name: loc.name,
            is_default: loc.isDefault ?? 0,
            sort: loc.sort ?? 0,
            remark: loc.remark ?? "",
            is_enabled: loc.isEnabled ?? 1,
            deleted_at: 0,
            created_at: now,
            updated_at: now,
            created_by: 0,
            updated_by: 0,
          });
          codeToLocaleId.set(loc.code, id);
          createdLocales++;
        }
      }
    }

    // 2) 处理 translations
    if (Array.isArray(raw.translations)) {
      const allLocales = localeList.filter((l) => l.deleted_at === 0);
      for (const t of raw.translations) {
        if (!t.translationKey || t.value === undefined) continue;
        const localeCode = t.localeCode;
        let lid = t.localeId;
        if (!lid && localeCode) {
          lid = codeToLocaleId.get(localeCode) ?? allLocales.find((l) => l.code === localeCode)?.id;
        }
        if (!lid) continue;

        // 软删除同 locale + key 的旧记录
        for (let i = 0; i < translationList.length; i++) {
          const existing = translationList[i];
          if (
            existing.deleted_at === 0 &&
            existing.locale_id === lid &&
            existing.translation_key === t.translationKey
          ) {
            translationList[i] = { ...existing, deleted_at: nowMs };
            softDeleted++;
          }
        }

        // insert 新记录
        const now = isoNow();
        const newRow: I18nTranslation = {
          id: nextI18nId(),
          locale_id: lid,
          translation_key: t.translationKey,
          value: t.value,
          remark: t.remark ?? "",
          is_enabled: t.isEnabled ?? 1,
          deleted_at: 0,
          created_at: now,
          updated_at: now,
          created_by: 0,
          updated_by: 0,
        };
        translationList.unshift(newRow);
        createdTranslations++;
      }
    }
  } else {
    // simple (含无 @type 的纯 key-value JSON)
    let simpleLocales: Record<string, Record<string, string>>;

    if (type === "simple") {
      simpleLocales = (body as SimpleImport).locales ?? {};
    } else {
      // 无 @type，当作 { key: value } 单语言处理，从 query 或 body 中取 targetLocaleCode
      simpleLocales = { "": body as unknown as Record<string, string> };
    }

    // 如果通过 header/target 指定目标语言 code，则优先使用
    const targetLocaleCode = (body as any).targetLocaleCode as string | undefined;

    const allLocales = localeList.filter((l) => l.deleted_at === 0);

    for (const [code, kvMap] of Object.entries(simpleLocales)) {
      const effectiveCode = targetLocaleCode || code;
      if (!effectiveCode || effectiveCode === "") continue;

      const locale = allLocales.find((l) => l.code === effectiveCode);
      if (!locale) continue;

      for (const [key, value] of Object.entries(kvMap)) {
        if (typeof value !== "string") continue;

        // 软删除旧记录
        for (let i = 0; i < translationList.length; i++) {
          const existing = translationList[i];
          if (
            existing.deleted_at === 0 &&
            existing.locale_id === locale.id &&
            existing.translation_key === key
          ) {
            translationList[i] = { ...existing, deleted_at: nowMs };
            softDeleted++;
          }
        }

        // insert 新记录
        const now = isoNow();
        translationList.unshift({
          id: nextI18nId(),
          locale_id: locale.id,
          translation_key: key,
          value,
          remark: "",
          is_enabled: 1,
          deleted_at: 0,
          created_at: now,
          updated_at: now,
          created_by: 0,
          updated_by: 0,
        });
        createdTranslations++;
      }
    }
  }

  return useResponseSuccess({
    ok: true,
    affected: {
      createdLocales,
      softDeleted,
      createdTranslations,
    },
  });
});
