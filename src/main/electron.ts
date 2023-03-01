import { BrowserWindow, ipcMain } from 'electron';
import isDev from 'electron-is-dev';
import { autoUpdater } from 'electron-updater';
import { MessageChannel, ProcessManager } from 'electron-re';
import { createRequire } from 'module';

import { appEventCenter } from './event';
import { manager } from './core';
import logger from './helpers/logger';
import { setupAfterInstall } from './helpers/devtools-installer';
import { IpcMainProcess } from './service/index';
import {
  IpcMainProcess as IpcMainProcessType,
} from './type';
import { startProfiler } from './helpers/v8-inspect-profiler';
import registryHooks from './hooks';

import {
  packageName,
  platform,
  isInspect,
  appDataPath,
  pathRuntime,
  pathExecutable,
} from './config';

export let ipcMainProcess: IpcMainProcessType;
export const msgc = MessageChannel;

const { Manager } = manager;
const require = createRequire(import.meta.url);

logger.info(`appDataPath: ${appDataPath}`);
logger.info(`pathRuntime: ${pathRuntime}`);
logger.info(`pathExecutable: ${pathExecutable}`);

/* -------------- pre work -------------- */

const { app } = appEventCenter;
const gotTheLock = app.requestSingleInstanceLock(); // singleton lock
if (!gotTheLock) app.quit();

require('v8-compile-cache');
app.setAppUserModelId(`io.nojsja.${packageName}`);
app.dock?.hide();

registryHooks(appEventCenter);
appEventCenter.beforeReady();

/* -------------- electron life cycle -------------- */

app.on('ready', async () => {
  let mainProfiler: any;

  appEventCenter.afterReady((err) => {
    if (err) console.log(err);
  });
  appEventCenter.ready();
  isInspect && (mainProfiler = await startProfiler('main', 5222));
  ipcMainProcess = new IpcMainProcess(ipcMain);
  await setupAfterInstall(true);

  appEventCenter.initIpcMainWindow().then((win: BrowserWindow) => {
    (global as any).win = win;
    if (isDev) {
      win.webContents.openDevTools({ mode: 'undocked' });
      ProcessManager.openWindow();
    }
  });

  !isDev && autoUpdater.checkForUpdatesAndNotify();
  isInspect &&
    setTimeout(() => {
      mainProfiler?.stop();
    }, 5e3);

  appEventCenter.registryHooksSync('beforeQuit', 'ipcMainWindowActions', () => {
    appEventCenter.handlers.ipcMainWindow?.beforeQuitting();
  });
});

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  appEventCenter.beforeQuit();
});

app.on('will-quit', async () => {
  logger.info('App will quit. Cleaning up...');
  appEventCenter.beforeQuit();
  await Manager.stopClient();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    appEventCenter.handlers.ipcMainWindow?.create();
  }
});

process.on('exit', () => {
  app.quit();
});
