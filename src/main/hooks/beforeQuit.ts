import { AppEvent } from '../event';

const tasks: Array<(electronApp: AppEvent) => void> = [];

export default (electronApp: AppEvent) => {
  tasks.forEach((task) => {
    task(electronApp);
  });
};
