import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources, allNamespaces, type SupportedLocale } from '@/locales';
import { fetchBackendI18n } from '@/core/i18n/utils';

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

  // 后台拉取后端翻译，不阻塞 UI
  fetchBackendI18n(initialLang);

  return i18n;
};
