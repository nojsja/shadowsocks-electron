import path from 'path';
import os from 'os';
import * as Sentry from "@sentry/electron";
import isDev from "electron-is-dev";

import logger from '../logs';
import { ElectronApp } from "../app";
import { appDataPath, platform, pathRuntime, pathExecutable } from "../config";
import { checkEnvFiles as check, copyDir, chmod } from "../utils/utils";
import { pacDir, binDir } from '../config';

export default (electronApp: ElectronApp) => {
  checkEnvFiles(electronApp);
  chmodFiles(electronApp);
  checkPlatform(electronApp);
  injectSentryMonitor(electronApp);
};

export const checkEnvFiles = (electronApp: ElectronApp) => {
  electronApp.registryHooksSync('beforeReady', 'checkEnvFiles', (app: Electron.App) => {
    console.log('hooks: >> checkEnvFiles');
    check(
      [
        { _path: appDataPath, isDir: true },
        ...(platform === 'linux' ? [{ _path: `${os.homedir}/.config/autostart`, isDir: true }] : []),
        { _path: pathRuntime, isDir: true },
        { _path: binDir, isDir: true, checkEmpty: true,
          exec: () => {

            logger.info(`copyDir: ${path.join(pathExecutable, 'bin')} -> ${binDir}`);
            copyDir(path.join(pathExecutable, 'bin'), binDir);
          }
        },
        { _path: pacDir, isDir: true, checkEmpty: true,
          exec: () => {
            logger.info(`copyDir: ${path.join(pathExecutable, 'pac')} -> ${pacDir}`);
            copyDir(path.join(pathExecutable, 'pac'), pacDir);
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

export const injectSentryMonitor = (electronApp: ElectronApp) => {
  electronApp.registryHooksSync('beforeReady', 'injectSentryMonitor', (app: Electron.App) => {
    if (isDev) {
      console.log('hooks: >> uncaughtException');
      // 未捕获的全局错误
      process.on('uncaughtException', (err) => {
        console.error('<---------------');
        console.log(err);
        console.error('--------------->');
      });
    } else {
      // 错误上报
      console.log('hooks: >> injectSentryMonitor');
      Sentry.init({ dsn: "https://56c8722111c2420e9758a85cd0138c95@o1179966.ingest.sentry.io/6292380" });
    }
  });
};
