import { ElectronApp } from '@main/app';
import { init } from '@main/i18n';

const tasks: Array<(electronApp: ElectronApp) => void> = [];

const configureLanguage = (electronApp: ElectronApp) => {
  electronApp.registryHooksSync('ready', 'configureLanguage', () => {
    console.log('hooks: >> configure language');
    init();
  });
};

tasks.push(configureLanguage);

export default (electronApp: ElectronApp) => {
  tasks.forEach((task) => {
    task(electronApp);
  });
};