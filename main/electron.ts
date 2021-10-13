import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import os from "os";
import isDev from "electron-is-dev";
import { autoUpdater } from "electron-updater";
import { initRenderer } from 'electron-store';

import { setMainWindow, stopClient } from "./proxy";
import logger from "./logs";
import { setupAfterInstall } from "./install";
import { IpcMainProcess } from './service/index';
import { IpcMainProcess as IpcMainProcessType, IpcMainWindowType } from './types/extention';
import IpcMainWindow from './window/MainWindow';
import { MessageChannel, ProcessManager } from 'electron-re';
import { checkEnvFiles, copyDir } from "./utils/utils";
import chmod from "./utils/fsChmod";

console.log(typeof MessageChannel);

const packageName = 'shadowsocks-electron';
let ipcMainProcess: IpcMainProcessType;
let ipcMainWindow: IpcMainWindowType;

autoUpdater.logger = logger;
const appDataPath = path.join(app.getPath('appData'), packageName);
const pathRuntime = (global as any).pathRuntime = path.join(appDataPath, 'runtime/');

/* -------------- pre work -------------- */

app.setAppUserModelId(`io.nojsja.${packageName}`);
app.dock?.hide();

checkEnvFiles(
  [
    { _path: appDataPath, isDir: true },
    { _path: pathRuntime, isDir: true },
    { _path: path.join(pathRuntime, 'bin'), isDir: true,
      exec: () => {
        copyDir(path.join(app.getAppPath(), 'bin'), path.join(pathRuntime, 'bin'));
      }
    }
  ]
);
chmod(path.join(pathRuntime, 'bin'), 0o711);

if (os.platform() === 'linux') {
  try {
    app.disableHardwareAcceleration();
  } catch (error) {
    console.log(error);
  }
}

/* -------------- electron life cycle -------------- */

app.on("ready", async () => {
  initRenderer();
  ipcMainProcess = new IpcMainProcess(ipcMain);
  console.log(typeof ipcMainProcess);
  await setupAfterInstall(true);

  ipcMainWindow = new IpcMainWindow({
    width: 420,
    height: 480
  });
  ipcMainWindow.create().then((win: BrowserWindow) => {
    (global as any).win = win;
    if (isDev) {
      ProcessManager.openWindow();
    }
    setMainWindow(win);
  });
  ipcMainWindow.createTray();

  autoUpdater.checkForUpdatesAndNotify();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  ipcMainWindow.beforeQuitting();
});

app.on("will-quit", async () => {
  logger.info("App will quit. Cleaning up...");
  await stopClient();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    ipcMainWindow.create();
  }
});
