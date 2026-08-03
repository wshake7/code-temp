import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources, allNamespaces, type SupportedLocale } from '@/locales';

/**
 * 仅初始化 i18next 本地 bundle。
 * 后端 public 翻译拉取须在 RequestClient.init 之后（见 bootstrap），否则 getInstance 会抛错被静默吞掉。
 */
export const initI18n = async (initialLang: SupportedLocale) => {
  await i18n.use(initReactI18next).init({
    lng: initialLang,
    resources,
    fallbackLng: 'zh-CN',
    supportedLngs: ['zh-CN', 'en-US'],

    defaultNS: 'common',
    ns: allNamespaces,

    missingKeyHandler: import.meta.env.DEV
      ? (lngs, ns, key) => {
          console.warn(`[i18n] Missing: "${key}" in "${ns}" for "${lngs[0]}"`);
        }
      : undefined,
  });

  return i18n;
};
