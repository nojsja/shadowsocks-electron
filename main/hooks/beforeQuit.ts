import { ElectronApp } from "../app";

const tasks: Array<(electronApp: ElectronApp) => void> = [];

export default (electronApp: ElectronApp) => {
  tasks.forEach((task) => {
    task(electronApp);
  });
};
