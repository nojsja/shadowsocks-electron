import path from 'path';

import { ElectronApp } from "../app";
import { i18n } from '../electron';

const tasks: Array<(electronApp: ElectronApp) => void> = [];

const configureLanguage = (electronApp: ElectronApp) => {
  electronApp.registryHooksSync('ready', 'configureLanguage', (app: Electron.App) => {
    console.log('hooks: >> configureLanguage');
    i18n.configure({
      locales: ['en-US', 'zh-CN', 'ru-RU'],
      defaultLocale: 'en-US',
      directory: path.join(__dirname, '../', 'locales')
    });
  });
};

tasks.push(configureLanguage);

export default (electronApp: ElectronApp) => {
  tasks.forEach((task) => {
    task(electronApp);
  });
};