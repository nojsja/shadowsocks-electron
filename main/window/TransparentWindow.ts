import { app, BrowserWindow, screen } from "electron";
import path from "path";

import { TransparentWindowType, rectPoint } from '../types/extention';

export default class Transparentwindow implements TransparentWindowType {
  icon: string
  url: string
  width: number
  height: number
  win: BrowserWindow | null;

  constructor() {
    const screenSize = screen.getPrimaryDisplay().workAreaSize;
    this.icon = path.resolve(__dirname, "../../assets/logo.png");
    this.url = `file://${path.resolve(app.getAppPath(), "assets/twin.html")}`;
    this.win = null;
    this.width = screenSize.width;
    this.height = screenSize.height;
  }

  create(params: { fillRect: rectPoint[] }): Promise<any> {

    this.win = new BrowserWindow({
      width: this.width,
      height: this.height,
      transparent: true,
      alwaysOnTop: true,
      hasShadow: false,
      kiosk: true,
      show: false,
      maximizable: true,
      fullscreen: true,
      fullscreenable: true,
      frame: false,
      titleBarStyle: 'hidden',
      resizable: false,
      icon: this.icon,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    this.win.setVisibleOnAllWorkspaces(true);
    this.win.setFullScreen(true);
    this.win.removeMenu();
    this.win.maximize();

    this.win.loadURL(this.url);

    return new Promise(resolve => {
      this.win?.on('ready-to-show', () => {
        this.win?.show();
        resolve(this.win);
        this.win?.webContents.send('renderer:twin', {
          action: 'fillRect',
          params: params.fillRect || []
        });
      })
    });
  }

  destroy() {
    this.win?.hide();
    this.win?.destroy();
  }
}
