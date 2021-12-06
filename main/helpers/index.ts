import { BrowserWindow, Tray, screen, session, app } from "electron";
import path from 'path';
import fs from 'fs';
import os from 'os';

export const getBestWindowPosition = (win: BrowserWindow, tray: Tray) => {
  const winBounds = win.getBounds();
  const trayBounds = tray.getBounds();

  const trayScreen = screen.getDisplayNearestPoint({
    x: trayBounds.x,
    y: trayBounds.y
  });

  const workArea = trayScreen.workArea;
  const screenBounds = trayScreen.bounds;

  if (workArea.x > 0) {
    return {
      x: workArea.x,
      y: workArea.height - winBounds.height
    };
  }

  if (workArea.y > 0) {
    return {
      x: Math.round(trayBounds.x + trayBounds.width / 2 - winBounds.width / 2),
      y: workArea.y
    };
  }

  if (workArea.width < screenBounds.width) {
    return {
      x: workArea.width - winBounds.width,
      y: screenBounds.height - winBounds.height
    };
  }

  return {
    x: Math.round(trayBounds.x + trayBounds.width / 2 - winBounds.width / 2),
    y: workArea.height - winBounds.height
  };
};

export const loadExtensions = (dirPath: string) => {
  const reactDevToolsPath = path.join(os.homedir(), dirPath);
  if (fs.existsSync(reactDevToolsPath)) {
    session.defaultSession.loadExtension(reactDevToolsPath);
  }
};

export const getStartupOnBoot_linux = () => {
  const startupDir = `${os.userInfo().homedir}/.config/autostart`;
  const startupFile = 'shadowsocks-electron.desktop';

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(startupDir, startupFile))) {
      return resolve(false);
    }
    fs.readFile(path.join(startupDir, startupFile), 'utf-8',(err, data) => {
      if (err) {
        return reject(err.toString());
      }
      if (data.match(/Hidden=false/g)) {
        return resolve(true);
      }
      resolve(false);
    });
  });
}

export const setStartupOnBoot_linux = (on: boolean) => {
  const startupDir = `${os.userInfo().homedir}/.config/autostart`;
  const startupFile = 'shadowsocks-electron.desktop';
  const fileContent = [
    "[Desktop Entry]",
    "Name=Shadowsocks Electron",
    "Exec=shadowsocks-electron",
    "Terminal=false",
    "Type=Application",
    "Icon=shadowsocks-electron",
    "StartupWMClass=Shadowsocks Electron",
    "Encoding=UTF-8",
    "Comment=Shadowsocks GUI with cross-platform desktop support",
    "Categories=Network"
  ];

  return new Promise((resolve, reject) => {
    fs.writeFile(
      path.join(startupDir, startupFile),
      `${fileContent.join(os.EOL)}${os.EOL}Hidden=${on ? false : true}`,
      (err => {
        if (err) reject(err);
        resolve(path.join(startupDir, startupFile));
      })
    );
  });
}

export const getStartupOnBoot_darwin = (): Promise<any> => {
  return Promise.resolve(app.getLoginItemSettings().openAtLogin);
}


export const setStartupOnBoot_darwin = (params: { openAtLogin: boolean, openAsHidden: boolean }) => {
  app.setLoginItemSettings({
    openAtLogin: params.openAtLogin,
    openAsHidden: params.openAsHidden
  });
}

export const getStartupOnBoot_win32 = (): Promise<any> => {
  return Promise.resolve(app.getLoginItemSettings().openAtLogin);
}


export const setStartupOnBoot_win32 = (params: { openAtLogin: boolean }) => {
  app.setLoginItemSettings({
    openAtLogin: params.openAtLogin
  });
}
