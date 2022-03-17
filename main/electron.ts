import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import os from "os";
import isDev from "electron-is-dev";
import { initRenderer } from 'electron-store';
import { autoUpdater } from'electron-updater';

import { stopClient } from "./proxy";
import { setMainWindow } from "./proxy/client";
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
export let ipcMainWindow: IpcMainWindowType;
const platform = os.platform();

const appDataPath = path.join(app.getPath('appData'), packageName);
const pathRuntime = path.join(appDataPath, 'runtime/');
const pathExecutable = isDev ? app.getAppPath() : path.dirname(app.getPath('exe'));

export const getPathRoot = (p: string) => path.join(appDataPath, p);
export const getPathRuntime = (p: string) => path.join(pathRuntime, p);

logger.info(`appDataPath: ${appDataPath}`);
logger.info(`pathRuntime: ${pathRuntime}`);

/* -------------- pre work -------------- */

app.setAppUserModelId(`io.nojsja.${packageName}`);
app.dock?.hide();

checkEnvFiles(
  [
    { _path: appDataPath, isDir: true },
    ...(platform === 'linux' ? [{ _path: `${os.homedir}/.config/autostart`, isDir: true }] : []),
    { _path: pathRuntime, isDir: true },
    { _path: path.join(pathRuntime, 'bin'), isDir: true,
      exec: () => {
        copyDir(path.join(pathExecutable, 'bin'), path.join(pathRuntime, 'bin'));
      }
    }
  ]
);
chmod(path.join(pathRuntime, 'bin'), 0o711);

if (platform === 'linux') {
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
      // win.webContents.openDevTools({ mode: 'undocked' });
      ProcessManager.openWindow();
    }
    setMainWindow(win);
  });
  ipcMainWindow.createTray();

  !isDev && autoUpdater.checkForUpdatesAndNotify();
});

app.on("window-all-closed", () => {
  if (platform !== "darwin") {
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
