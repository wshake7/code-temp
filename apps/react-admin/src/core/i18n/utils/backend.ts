import i18n from 'i18next';
import type { SupportedLocale } from '@/locales';
import { RequestClient } from '@/core/transport/rest';

const CACHE_PREFIX = 'i18n_cache_';

interface I18nCacheEntry {
  hash: string;
  data: Record<string, string>;
}

interface PublicI18nResponse {
  unchanged: boolean;
  hash?: string;
  data?: Record<string, string>;
}

/**
 * 从 public API 拉取后端翻译，以 key 为单位覆盖合并到 i18next。
 * 不阻塞 UI：调用方应 fire-and-forget。
 */
export async function fetchBackendI18n(locale: SupportedLocale): Promise<void> {
  const cacheKey = `${CACHE_PREFIX}${locale}`;

  // 1. 从 localStorage 缓存立即 merge（近零延迟）
  const cached = readCache(cacheKey);
  if (cached) {
    mergeTranslations(locale, cached.data);
  }

  // 2. 请求后端 public 端点
  try {
    const res = await RequestClient.getInstance().get<PublicI18nResponse>(
      `/public/i18n/${encodeURIComponent(locale)}`,
      { params: { hash: cached?.hash ?? '' } },
    );

    if (!res || res.unchanged || !res.data) return;

    // 3. 有新数据：merge + 写缓存
    mergeTranslations(locale, res.data);
    writeCache(cacheKey, { hash: res.hash ?? '', data: res.data });
  } catch {
    // 静默失败：本地 bundle + localStorage 缓存已兜底
  }
}

/** 以 key 为单位覆盖合并翻译到 i18next */
function mergeTranslations(locale: string, kvMap: Record<string, string>): void {
  const byNs: Record<string, Record<string, string>> = {};

  for (const [key, value] of Object.entries(kvMap)) {
    const dotIdx = key.indexOf('.');
    const ns = dotIdx >= 0 ? key.slice(0, dotIdx) : 'common';
    const k = dotIdx >= 0 ? key.slice(dotIdx + 1) : key;
    (byNs[ns] ??= {})[k] = value;
  }

  for (const [ns, resources] of Object.entries(byNs)) {
    i18n.addResourceBundle(locale, ns, resources, true, true);
  }
}

function readCache(key: string): I18nCacheEntry | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as I18nCacheEntry;
    if (parsed && parsed.hash && parsed.data) return parsed;
    return null;
  } catch {
    return null;
  }
}

function writeCache(key: string, entry: I18nCacheEntry): void {
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // storage 满或隐私模式
  }
}
