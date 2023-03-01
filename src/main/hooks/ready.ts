import { AppEvent } from '@main/event';
import { init } from '@main/i18n';

const tasks: Array<(electronApp: AppEvent) => void> = [];

const configureLanguage = (electronApp: AppEvent) => {
  electronApp.registryHooksSync('ready', 'configureLanguage', () => {
    console.log('hooks: >> configure language');
    init();
  });
};

tasks.push(configureLanguage);

export default (electronApp: AppEvent) => {
  tasks.forEach((task) => {
    task(electronApp);
  });
};