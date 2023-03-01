import {
  app, BrowserWindow, Tray, Menu, shell,
  nativeImage, nativeTheme, MenuItem, MenuItemConstructorOptions,
} from 'electron';
import isDev from 'electron-is-dev';
import path from 'path';
import os from 'os';
import windowStateKeeper from 'electron-window-state';

import { electronStore } from '@main/electron';
import { i18n } from '@main/i18n';
import { Manager } from '@main/core/manager';
import { getBestWindowPosition } from '@main/core/helpers';
import { IpcMainWindowType } from '@main/type';
import { getPerfectDevicePixelRatioImage } from '@main/utils';

const platform = os.platform();

function getIconByDarkMode(iconName: string, darkMode: boolean) {
  return getPerfectDevicePixelRatioImage(
    path.resolve(
      app.getAppPath(), `assets/tray/${darkMode ? (iconName+'-dark') : iconName}.png`
    ),
    [1, 2, 3],
  );
}

export default class IpcMainWindow implements IpcMainWindowType {
  win: BrowserWindow | null;
  tray: Tray | null;
  icon: string;
  trayIcon: string;
  trayMenu: Menu | null;
  menus: (MenuItem| MenuItemConstructorOptions)[];
  url: string;
  quitting = false;
  resizable = true;
  darkMode = nativeTheme.shouldUseDarkColors;
  width = 460;
  height = 540;
  minHeight = 480;
  minWidth = 420;
  maxHeight = 980;
  maxWidth = 800;
  serverMode: 'single' | 'cluster';
  serverStatus: boolean;

  constructor(args?: Electron.BrowserWindowConstructorOptions) {
    this.width = args?.width ?? this.width;
    this.height = args?.height ?? this.height;
    this.resizable = args?.resizable ?? this.resizable;
    this.win = null;
    this.tray = null;
    this.trayMenu = null;
    this.menus = [];
    this.serverMode = 'single';
    this.serverStatus = false;
    this.url = isDev
      ? "http://localhost:3001"
      : `file://${path.resolve(app.getAppPath(), "public/renderer/index.html")}`;
    this.icon = path.resolve(app.getAppPath(), "assets/logo.png");
    this.trayIcon = getPerfectDevicePixelRatioImage(
      path.resolve(app.getAppPath(), "assets/icons/icon.png"), [1, 1.5, 2, 3]
    );
  }

  create() {
    return new Promise((resolve, reject) => {
      let autoHide = false;
      const mainWindowState = windowStateKeeper({
        defaultWidth: this.width,
        defaultHeight: this.height,
        fullScreen: false,
        maximize: false,
        file: "mainWindowState.json",
        path: app.getPath("userData"),
      });

      this.win = new BrowserWindow({
        minHeight: this.minHeight,
        minWidth: this.minWidth,
        maxHeight: this.maxHeight,
        maxWidth: this.maxWidth,
        maximizable: false,
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        resizable: this.resizable,
        frame: false,
        fullscreenable: false,
        fullscreen: false,
        show: false,
        icon: this.icon,
        titleBarStyle: "hidden",
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      });

      mainWindowState.manage(this.win);

      try {
        autoHide = JSON.parse(
          JSON.parse(electronStore.get('persist:root') as string).settings
        ).autoHide;
      } catch(error) {
        console.error(error);
      }

      if (!autoHide) {
        this.win.show();
      }

      this.win.on("minimize", (e: Electron.Event) => {
        e.preventDefault();
        mainWindowState.saveState(this.win as BrowserWindow);
        this.hide();
      });

      this.win.on("maximize", (e: Electron.Event) => {
        e.preventDefault();
      });

      this.win.on("close", e => {
        if (!this.quitting) {
          e.preventDefault();
          this.hide();
        }
      });

      this.win.loadURL(this.url);
      this.win.removeMenu();

      this.win.webContents.on("new-window", (e, url) => {
        e.preventDefault();
        shell.openExternal(url);
      });

      this.win.on('ready-to-show', () => {
        resolve(this.win)
      });

      this.win.on('closed', () => {
        reject(this.win)
      });

      Manager.event.on('manager:server-status', ({ mode, status }) => {
        this.serverMode = mode;
        this.serverStatus = status;
        this.setLocaleTrayMenu();
        try {
          this.win?.webContents?.send("connected", {
            status,
            mode: mode
          });
        } catch (error) {
          console.error(error);
        }
      });

      nativeTheme.on('updated', (event: { sender: { shouldUseDarkColors: boolean  } }) => {
        this.darkMode = event.sender.shouldUseDarkColors;
        this.setLocaleTrayMenu();
      });

    });
  }

  setLocaleTrayMenu() {
    const { serverStatus: status, darkMode } = this;
    this.menus = [
      {
        label: i18n.t('show_ui'),
        icon: nativeImage.createFromPath(getIconByDarkMode('home', darkMode)),

        click: this.show.bind(this)
      },
      {
        label: i18n.t('hide_ui'),
        icon: nativeImage.createFromPath(getIconByDarkMode('hide', darkMode)),
        click: this.hide.bind(this)
      },
      {
        label: status ? i18n.t('disconnect') : i18n.t('connect'),
        icon: nativeImage.createFromPath(getIconByDarkMode('disconnected', darkMode)),
        click: () => {
          if (status) {
            (global as any).win.webContents.send('event:stream', { action: 'disconnect-server' });
          } else {
            (global as any).win.webContents.send('event:stream', { action: 'reconnect-server' });
          }
        }
      },
      { type: "separator" },
      {
        label: i18n.t('quit'),
        icon: nativeImage.createFromPath(getIconByDarkMode('quit', darkMode)),
        click: this.quit.bind(this)
      }
    ];

    try {
      this.trayMenu = Menu.buildFromTemplate(this.menus);
      this.tray?.setContextMenu(this.trayMenu);
    } catch (error) {
      console.error(error);
    }
  }

  createTray () {
    return new Promise((resolve) => {
      if (this.tray && !this.tray.isDestroyed()) return;

      this.tray = new Tray(this.trayIcon);
      this.setLocaleTrayMenu();

      if (platform !== "linux") {
        this.tray.on("click", () => {
          if (this.win?.isVisible()) {
            this.win.hide();
          } else {
            this.show();
          }
        });
        this.tray.on("right-click", () => {
          this.tray?.popUpContextMenu(this.trayMenu ?? undefined);
        });
      } else {
        this.tray?.setContextMenu(this.trayMenu);
      }

      resolve(this.tray);
    });
  }

  show() {
    if (platform === "darwin" || platform === "win32") {
      if (this.win && this.tray) {
        const position = getBestWindowPosition(this.win, this.tray);
        this.win.setPosition(position.x, position.y);
      }
    }
    this.win?.show();
  }

  hide() {
    this.win?.hide();
  }

  beforeQuitting() {
    this.quitting = true;
  }

  quit() {
    this.quitting = true;
    app.quit();
  }
}
