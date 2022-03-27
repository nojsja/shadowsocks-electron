import path from 'path';

import { ElectronApp } from "../app";
import { i18n } from '../electron';

export default (electronApp: ElectronApp) => {
  configureLanguage(electronApp);
};

export const configureLanguage = (electronApp: ElectronApp) => {
  electronApp.registryHooksSync('beforeReady', 'configureLanguage', (app: Electron.App) => {
    console.log('hooks: >> configureLanguage');
    i18n.configure({
      locales: ['en-US', 'zh-CN'],
      defaultLocale: 'en-US',
      directory: path.join(__dirname, '../', 'locales')
    });
  });
};
