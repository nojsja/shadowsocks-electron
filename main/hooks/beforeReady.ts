import path from 'path';
import os from 'os';

import { ElectronApp } from "../app";
import { appDataPath, platform, pathRuntime, pathExecutable } from "../electron";
import { checkEnvFiles as check, copyDir } from "../utils/utils";
import chmod from '../utils/fsChmod';

export default (electronApp: ElectronApp) => {
  checkEnvFiles(electronApp);
  chmodFiles(electronApp);
  checkPlatform(electronApp);
};

export const checkEnvFiles = (electronApp: ElectronApp) => {
  electronApp.registryHooksSync('beforeReady', 'checkEnvFiles', (app: Electron.App) => {
    console.log('hooks: >> checkEnvFiles');
    check(
      [
        { _path: appDataPath, isDir: true },
        ...(platform === 'linux' ? [{ _path: `${os.homedir}/.config/autostart`, isDir: true }] : []),
        { _path: pathRuntime, isDir: true },
        { _path: path.join(pathRuntime, 'bin'), isDir: true, checkEmpty: true,
          exec: () => {
            copyDir(path.join(pathExecutable, 'bin'), path.join(pathRuntime, 'bin'));
          }
        }
      ]
    );
  });
}

export const chmodFiles = (electronApp: ElectronApp) => {
  electronApp.registryHooksSync('beforeReady', 'chmodFiles', (app: Electron.App) => {
    console.log('hooks: >> chmodFiles');
    chmod(path.join(pathRuntime, 'bin'), 0o711);
  });
};

export const checkPlatform = (electronApp: ElectronApp) => {
  electronApp.registryHooksSync('beforeReady', 'checkPlatform', (app: Electron.App) => {
    console.log('hooks: >> checkPlatform');
    if (platform === 'linux') {
      try {
        app.disableHardwareAcceleration();
      } catch (error) {
        console.log(error);
      }
    }
  });
};
