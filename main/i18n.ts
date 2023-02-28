import i18next from 'i18next';

import en_US from './locales/en-US.json';
import zh_CN from './locales/zh-CN.json';
import ru_RU from './locales/ru-RU.json';

export const i18n = i18next;

export const init = () => {
  i18next
    // pass the i18n instance to react-i18next.
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
      fallbackLng: 'en-US',
      lng: 'en-US',
      debug: true,
      resources: {
        'en-US': { translation: en_US },
        'zh-CN': { translation: zh_CN },
        'ru-RU': { translation: ru_RU },
      },
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      }
    });
};
