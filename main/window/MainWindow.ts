import { app, BrowserWindow, Tray, Menu, shell } from "electron";
import isDev from "electron-is-dev";
import path from "path";
import os from "os";
import windowStateKeeper from 'electron-window-state';

import { IpcMainWindowType, TrayMenu } from '../types/extention';
import { getBestWindowPosition } from "../core/helpers";
import { electronStore, i18n } from "../electron";

const platform = os.platform();

export default class IpcMainWindow implements IpcMainWindowType {
  win: BrowserWindow | null
  tray: Tray | null
  icon: string
  trayIcon: string
  trayMenu: Menu | null;
  menus: TrayMenu;
  url: string;
  quitting = false;
  resizable = true;
  width = 460;
  height = 540;
  minHeight = 480;
  minWidth = 420;
  maxHeight = 980;
  maxWidth = 800;

  constructor(args?: Electron.BrowserWindowConstructorOptions) {
    this.width = args?.width ?? this.width;
    this.height = args?.height ?? this.height;
    this.resizable = args?.resizable ?? this.resizable;
    this.win = null;
    this.tray = null;
    this.trayMenu = null;
    this.menus = [];
    this.url = isDev
    ? "http://localhost:3001"
    : `file://${path.resolve(app.getAppPath(), "build/index.html")}`;
    this.icon = path.resolve(app.getAppPath(), "assets/logo.png");
    this.trayIcon = path.resolve(app.getAppPath(), "assets/icons/16x16.png");
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
      } catch(error) {}

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

    });
  }

  setLocaleTrayMenu() {
    this.menus = [
      {
        label: i18n.__('show_ui'),
        click: this.show.bind(this)
      },
      {
        label: i18n.__('hide_ui'),
        click: this.hide.bind(this)
      },
      { type: "separator" },
      {
        label: i18n.__('quit'),
        click: this.quit.bind(this)
      }
    ];

    this.trayMenu = Menu.buildFromTemplate(this.menus);
    this.tray?.setContextMenu(this.trayMenu);
  }

  createTray () {
    return new Promise((resolve, reject) => {
      if (this.tray && !this.tray.isDestroyed()) return;

      this.tray = new Tray(this.trayIcon);
      this.setLocaleTrayMenu();

      if (platform !== "linux") {
        this.tray.on("click", e => {
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
