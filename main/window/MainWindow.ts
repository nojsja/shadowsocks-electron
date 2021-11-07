import { app, BrowserWindow, Tray, Menu, shell } from "electron";
import isDev from "electron-is-dev";
import path from "path";
import os from "os";

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
  quitting = false
  width = 420
  height = 480

  constructor(args?: {
    width: number,
    height: number
  }) {
    this.width = args?.width ?? this.width;
    this.height = args?.height ?? this.height;
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
    ? "http://localhost:3000"
    : `file://${path.resolve(app.getAppPath(), "build/index.html")}`;
    this.icon = path.resolve(app.getAppPath(), "assets/logo.png");
    this.trayIcon = path.resolve(
      app.getAppPath(),
      "assets/tray/tray.png"
    );
  }

  create() {
    return new Promise((resolve, reject) => {
      this.win = new BrowserWindow({
        width: this.width,
        height: this.height,
        resizable: false,
        fullscreenable: false,
        fullscreen: false,
        icon: this.icon,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      });

      if (platform === "darwin") {
        this.win.hide();
      }

      // this.win.setVisibleOnAllWorkspaces(true);

      this.win.on("minimize", (e: Electron.Event) => {
        e.preventDefault();
        this.hide();
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
