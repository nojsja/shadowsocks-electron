import { app, BrowserWindow, Tray, Menu, shell, ipcMain, screen } from "electron";
import isDev from "electron-is-dev";
import path from "path";
import os from "os";
import { autoUpdater } from "electron-updater";
import { initRenderer } from 'electron-store';

import { setMainWindow, stopClient } from "./proxy";
import logger from "./logs";
import { setupAfterInstall } from "./install";
import {
  getBestWindowPosition
} from "./helpers";
import { IpcMainProcess } from './service/index';
import { IpcMainProcess as IpcMainProcessType, rectPoint } from './types/extention';
import { MessageChannel, ProcessManager } from 'electron-re';
import { checkEnvFiles, copyDir } from "./utils/utils";
import chmod from "./utils/fsChmod";

console.log(typeof MessageChannel);

const platform = os.platform();
const packageName = 'shadowsocks-electron';
const width = 420;
const height = 480;
let win: BrowserWindow;
let tray: Tray;
let quitting = false;
let ipcMainProcess: IpcMainProcessType;

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

/* -------------- transparent drawer window for screen capture -------------- */
export const createTransparentWindow = (
  params: {
    fillRect: rectPoint[]
  }
): Promise<void> => {
  const screenSize = screen.getPrimaryDisplay().workAreaSize;
  const twin = new BrowserWindow({
    width: screenSize.width,
    height: screenSize.height,
    transparent: true,
    alwaysOnTop: true,
    show: false,
    fullscreen: true,
    frame: false,
    titleBarStyle: 'hidden',
    resizable: false,
    icon: path.resolve(__dirname, "../assets/logo.png"),
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  twin.setVisibleOnAllWorkspaces(true);
  twin.setFullScreen(true);
  twin.removeMenu();
  twin.maximize();

  twin.loadURL(`file://${path.resolve(app.getAppPath(), "assets/twin.html")}`);

  return new Promise(resolve => {
    twin.on('ready-to-show', () => {
      twin.show();
      // twin.webContents.openDevTools();
      resolve();
      twin.webContents.send('renderer:twin', {
        action: 'fillRect',
        params: params.fillRect || []
      });
      setTimeout(() => {
        twin.hide();
        twin.destroy();
      }, 1.2e3);
    })
  });
}

/* -------------- create main window -------------- */

const showWindow = () => {
  if (platform === "darwin" || platform === "win32") {
    const position = getBestWindowPosition(win, tray);
    win.setPosition(position.x, position.y);
  }
  win.show();
};

const createWindow = () => {
  (global as any).win =  win = new BrowserWindow({
    width,
    height,
    resizable: false,
    icon: path.resolve(__dirname, "../assets/logo.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (platform === "darwin") {
    win.hide();
  }

  win.setVisibleOnAllWorkspaces(true);

  win.on("minimize", (e: Electron.Event) => {
    e.preventDefault();
    win.hide();
  });

  win.on("close", e => {
    if (!quitting) {
      e.preventDefault();
      win.hide();
    }
  });


  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.resolve(app.getAppPath(), "build/index.html")}`
  );

  setMainWindow(win);

  win.webContents.on("new-window", (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });

  if (isDev) {
    ProcessManager.openWindow();
    // win.webContents.openDevTools();
    win.removeMenu();
  } else {
    win.removeMenu();
  }

};

/* -------------- create taskbar button -------------- */

const createTray = () => {
  tray = new Tray(
    path.resolve(
      __dirname,
      platform === "darwin"
        ? "../assets/icons/16x16.png"
        : "../assets/logo.png"
    )
  );

  const menu = Menu.buildFromTemplate([
    {
      label: "Show UI",
      click: () => {
        showWindow();
      }
    },
    {
      label: "Hide UI",
      click: () => {
        win.hide();
      }
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        quitting = true;
        app.quit();
      }
    }
  ]);

  if (platform !== "linux") {
    tray.on("click", e => {
      if (win.isVisible()) {
        win.hide();
      } else {
        showWindow();
      }
    });
    tray.on("right-click", () => {
      tray.popUpContextMenu(menu);
    });
  } else {
    tray.setContextMenu(menu);
  }
};

/* -------------- electron life cycle -------------- */

app.on("ready", async () => {
  initRenderer();
  ipcMainProcess = new IpcMainProcess(ipcMain);
  console.log(typeof ipcMainProcess);
  await setupAfterInstall(true);
  createWindow();
  createTray();

  autoUpdater.checkForUpdatesAndNotify();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  quitting = true;
});

app.on("will-quit", async () => {
  logger.info("App will quit. Cleaning up...");
  await stopClient();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
