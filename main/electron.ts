import { app, BrowserWindow, ipcMain } from "electron";
import isDev from "electron-is-dev";
import { autoUpdater } from'electron-updater';
import { I18n } from 'i18n';

import App from './app';
import { stopClient } from "./proxy";
import { setMainWindow } from "./proxy/client";
import logger from "./logs";
import { setupAfterInstall } from "./install";
import { IpcMainProcess } from './service/index';
import { IpcMainProcess as IpcMainProcessType, IpcMainWindowType } from './types/extention';
import IpcMainWindow from './window/MainWindow';
import { MessageChannel, ProcessManager } from 'electron-re';
import { startProfiler } from "./performance/v8-inspect-profiler";
import registryHooks from './hooks';

import { packageName, platform, isInspect, appDataPath, pathRuntime, pathExecutable } from './config';
import ElectronStore from "electron-store";

export let ipcMainProcess: IpcMainProcessType;
export let ipcMainWindow: IpcMainWindowType;
export const msgc = MessageChannel;
export const electronStore = new ElectronStore();

export const i18n = new I18n();

logger.info(`appDataPath: ${appDataPath}`);
logger.info(`pathRuntime: ${pathRuntime}`);
logger.info(`pathExecutable: ${pathExecutable}`);

/* -------------- pre work -------------- */

require('v8-compile-cache');
app.setAppUserModelId(`io.nojsja.${packageName}`);
app.dock?.hide();

export const electronApp = new App();

registryHooks(electronApp);

electronApp.beforeReady(app);

/* -------------- electron life cycle -------------- */

app.on("ready", async () => {
  let mainProfiler: any;

  electronApp.afterReady(app, (err, app) => { if (err) console.log(err); });
  electronApp.ready(app);
  isInspect && (mainProfiler = await startProfiler('main', 5222));
  ipcMainProcess = new IpcMainProcess(ipcMain);
  await setupAfterInstall(true);

  ipcMainWindow = new IpcMainWindow({
    width: 460,
    height: 540
  });

  ipcMainWindow.create().then((win: BrowserWindow) => {
    (global as any).win = win;
    if (isDev) {
      win.webContents.openDevTools({ mode: 'undocked' });
      ProcessManager.openWindow();
    }
    setMainWindow(win);
  });

  ipcMainWindow.createTray();

  !isDev && autoUpdater.checkForUpdatesAndNotify();
  isInspect && setTimeout(() => { mainProfiler?.stop(); }, 5e3);

  electronApp.registryHooksSync('beforeQuit', 'ipcMainWindowActions', () => {
    ipcMainWindow.beforeQuitting();
  });

});

app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  electronApp.beforeQuit(app);
});

app.on("will-quit", async () => {
  logger.info("App will quit. Cleaning up...");
  electronApp.beforeQuit(app);
  await stopClient();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    ipcMainWindow.create();
  }
});

process.on('exit', () => {
  app.quit();
});
