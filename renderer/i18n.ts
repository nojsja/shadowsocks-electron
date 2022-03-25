import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en_US from './locales/en-US.json'
import zh_CN from './locales/zh-CN.json'
// don't want to use this?
// have a look at the Quick start guide
// for passing in lng and translations on init

export const getFirstLanguage = (lang?: string | null) => {
  const supported = ['en-US', 'zh-CN'];
  if (lang && supported.includes(lang))
    return lang;
  if (navigator.language && supported.includes(navigator.language))
    return navigator.language;
  return 'en-US';
}

export default (lang?: string | null) => {
  i18n
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
      fallbackLng: 'en-US',
      lng: getFirstLanguage(lang),
      debug: true,
      resources: {
        'en-US': { translation: en_US },
        'zh-CN': { translation: zh_CN }
      },
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      }
    });
};
