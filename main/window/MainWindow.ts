import { app, BrowserWindow, Tray, Menu, shell } from "electron";
import isDev from "electron-is-dev";
import path from "path";
import os from "os";
import windowStateKeeper from 'electron-window-state';

import { IpcMainWindowType, TrayMenu } from '../types/extention';
import { getBestWindowPosition } from "../helpers";

const platform = os.platform();

export default class IpcMainWindow implements IpcMainWindowType {
  win: BrowserWindow | null
  tray: Tray | null
  icon: string
  trayIcon: string
  trayMenu: TrayMenu
  url: string
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
    this.trayMenu = [
      {
        label: "Show UI",
        click: this.show.bind(this)
      },
      {
        label: "Hide UI",
        click: this.hide.bind(this)
      },
      { type: "separator" },
      {
        label: "Quit",
        click: this.quit.bind(this)
      }
    ];
    this.url = isDev
    ? "http://localhost:3001"
    : `file://${path.resolve(app.getAppPath(), "build/index.html")}`;
    this.icon = path.resolve(app.getAppPath(), "assets/logo.png");
    this.trayIcon = path.resolve(
      app.getAppPath(),
      "assets/icons/16x16.png"
    );
  }

  create() {
    return new Promise((resolve, reject) => {
      const mainWindowState = windowStateKeeper({
        defaultWidth: this.width,
        defaultHeight: this.height,
        fullScreen: false,
        maximize: false,
        file: "mainWindowState.json",
        path: app.getPath("userData"),
      });

      this.win = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        minHeight: this.minHeight,
        minWidth: this.minWidth,
        maxHeight: this.maxHeight,
        maxWidth: this.maxWidth,
        maximizable: false,
        width: mainWindowState.width,
        height: mainWindowState.height,
        resizable: this.resizable,
        frame: false,
        fullscreenable: false,
        fullscreen: false,
        icon: this.icon,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      });

      mainWindowState.manage(this.win);

      if (platform === "darwin") {
        this.win.hide();
      }

      // this.win.setVisibleOnAllWorkspaces(true);

      this.win.on("minimize", (e: Electron.Event) => {
        e.preventDefault();
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

  createTray () {
    return new Promise((resolve, reject) => {
      this.tray = new Tray(this.trayIcon);
      const menu: Menu = Menu.buildFromTemplate(this.trayMenu);

      if (platform !== "linux") {
        this.tray.on("click", e => {
          if (this.win?.isVisible()) {
            this.win.hide();
          } else {
            this.show();
          }
        });
        this.tray.on("right-click", () => {
          this.tray?.popUpContextMenu(menu);
        });
      } else {
        this.tray?.setContextMenu(menu);
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
