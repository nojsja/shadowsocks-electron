import { app } from 'electron';
import path from 'path';
import os from 'os';
import * as Sentry from '@sentry/electron';
import isDev from 'electron-is-dev';
import pie from 'puppeteer-in-electron2';

import logger from '@main/helpers/logger';
import { AppEvent } from '@main/event';

import {
  appDataPath,
  platform,
  pathRuntime,
  pathExecutable,
  pathWorkflow,
  workflowTaskDemoDir,
  pacDir,
  binDir
} from '@main/config';
import {
  checkEnvFiles as check, copyDir, chmod,
  getPluginsPath, getExecutableFilePath,
  copyFileToPluginDir,
} from '@main/utils';
import { warning } from '@main/helpers/logger';

const tasks: Array<(AppEvent: AppEvent) => void> = [];

const checkEnvFiles = (AppEvent: AppEvent) => {
  AppEvent.registryHooksSync('beforeReady', 'checkEnvFiles', () => {
    console.log('hooks: >> checkEnvFiles');
    check(
      [
        { _path: appDataPath, isDir: true },
        ...(platform === 'linux' ? [{ _path: `${os.homedir}/.config/autostart`, isDir: true }] : []),
        { _path: pathRuntime, isDir: true },
        { _path: pathWorkflow, isDir: true },
        { _path: workflowTaskDemoDir, isDir: true, checkEmpty: true,
          exec: () => {
            logger.info(`copyDir: ${path.join(pathExecutable, 'scripts/scripts-demo')} -> ${workflowTaskDemoDir}`);
            copyDir(path.join(pathExecutable, 'scripts/scripts-demo'), workflowTaskDemoDir);
          },
        },
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

const chmodFiles = (AppEvent: AppEvent) => {
  AppEvent.registryHooksSync('beforeReady', 'chmodFiles', () => {
    console.log('hooks: >> chmod bin files');
    chmod(path.join(pathRuntime, 'bin'), 0o711);
  });
};

const checkPlatform = (AppEvent: AppEvent) => {
  AppEvent.registryHooksSync('beforeReady', 'checkPlatform', (app: Electron.App) => {
    console.log('hooks: >> handle platform specific');
    if (platform === 'linux') {
      try {
        app.disableHardwareAcceleration();
      } catch (error) {
        console.log(error);
      }
    }
  });
};

const injectSentryMonitor = (AppEvent: AppEvent) => {
  AppEvent.registryHooksSync('beforeReady', 'injectSentryMonitor', () => {
    if (isDev) {
      console.log('hooks: >> uncaughtException handler');
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

const initPuppeteerInElectron = async (AppEvent: AppEvent) => {
  AppEvent.registryHooksSync('beforeReady', 'initPuppeteerInElectron', async () => {
    console.log('hooks: >> init puppeteer-in-electron');
    try {
      await pie.initialize(app);
    } catch (error) {
      warning(`fail to init puppeteer-in-electron: ${error}`);
    }
  });
};

tasks.push(
  checkEnvFiles,
  chmodFiles,
  checkPlatform,
  injectSentryMonitor,
  initPuppeteerInElectron,
);

export default (AppEvent: AppEvent) => {
  tasks.forEach((task) => {
    task(AppEvent);
  });
};