import path from 'path';
import os from 'os';
import * as Sentry from '@sentry/electron';
import isDev from 'electron-is-dev';

import logger from '../logs';
import { ElectronApp } from '../app';
import { appDataPath, platform, pathRuntime, pathExecutable } from '../config';
import {
  checkEnvFiles as check, copyDir, chmod,
  getPluginsPath, getExecutableFilePath,
  copyFileToPluginDir,
} from '../utils/utils';
import { pacDir, binDir } from '../config';

const tasks: Array<(electronApp: ElectronApp) => void> = [];

const checkEnvFiles = (electronApp: ElectronApp) => {
  electronApp.registryHooksSync('beforeReady', 'checkEnvFiles', () => {
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
        { _path: getPluginsPath(''), isDir: true },
        { _path: getPluginsPath('v2ray-plugin'), isDir: false,
          exec: () => {
            copyFileToPluginDir('v2ray-plugin', getExecutableFilePath('v2ray-plugin'));
          }
        },
        { _path: pacDir, isDir: true, checkEmpty: true,
          exec: () => {
            logger.info(`copyDir: ${path.join(pathExecutable, 'pac')} -> ${pacDir}`);
            copyDir(path.join(pathExecutable, 'pac'), pacDir);
          }
        },
      ]
    );
  });
}

const chmodFiles = (electronApp: ElectronApp) => {
  electronApp.registryHooksSync('beforeReady', 'chmodFiles', () => {
    console.log('hooks: >> chmodFiles');
    chmod(path.join(pathRuntime, 'bin'), 0o711);
  });
};

const checkPlatform = (electronApp: ElectronApp) => {
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

const injectSentryMonitor = (electronApp: ElectronApp) => {
  electronApp.registryHooksSync('beforeReady', 'injectSentryMonitor', () => {
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

tasks.push(
  checkEnvFiles,
  chmodFiles,
  checkPlatform,
  injectSentryMonitor,
);

export default (electronApp: ElectronApp) => {
  tasks.forEach((task) => {
    task(electronApp);
  });
};