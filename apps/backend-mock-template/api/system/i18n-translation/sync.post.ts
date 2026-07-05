import { defineEventHandler, readBody, setResponseStatus } from "h3";
import {
  ensureI18nSeeds,
  getMockI18nLocaleList,
  getMockI18nTranslationList,
  isoNow,
  nextI18nId,
  type I18nTranslation,
} from "~/utils/mock-data";
import { useResponseError, useResponseSuccess } from "~/utils/response";

/**
 * POST /api/system/i18n-translation/sync
 *
 * 把前端静态 i18n JSON 同步到后端 i18n_translation 表。
 *
 * Body: { locales: { "zh-CN": { "common.save": "保存", ... }, "en-US": { ... } } }
 *
 * 按 locale code 匹配已有语言，批量 upsert translation。
 */
export default defineEventHandler(async (event) => {
  ensureI18nSeeds();

  const body = (await readBody(event)) as {
    locales?: Record<string, Record<string, string>>;
  };

  if (!body?.locales || typeof body.locales !== "object") {
    setResponseStatus(event, 400);
    return useResponseError("BadRequest", "locales is required");
  }

  const localeList = getMockI18nLocaleList().filter((l) => l.deleted_at === 0);
  const translationList = getMockI18nTranslationList();

  let created = 0;
  let updated = 0;
  let softDeleted = 0;

  for (const [localeCode, kvMap] of Object.entries(body.locales)) {
    const locale = localeList.find((l) => l.code === localeCode);
    if (!locale) continue;

    for (const [key, value] of Object.entries(kvMap)) {
      if (typeof value !== "string") continue;

      const existingIdx = translationList.findIndex(
        (t) => t.deleted_at === 0 && t.locale_id === locale.id && t.translation_key === key,
      );

      if (existingIdx >= 0) {
        // update existing
        translationList[existingIdx] = {
          ...translationList[existingIdx],
          value,
          updated_at: isoNow(),
          updated_by: 0,
        };
        updated++;
      } else {
        // insert new
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
        created++;
      }
    }
  }

  return useResponseSuccess({
    ok: true,
    affected: { created, updated, softDeleted },
  });
});
