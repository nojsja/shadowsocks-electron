import { IpcMain, app, dialog, Notification, Menu, desktopCapturer } from 'electron';
import fs from 'fs';
import os from 'os';
import open from "open";
import { ProcessManager } from 'electron-re';

import {
  contextAction,
  DesktopService as DesktopServiceType,
  RectPoint, ServiceResult,
  WindowInfo
} from '../types/extention';
import { openLogDir } from '../logs';
import TransparentWindow from '../window/TransparentWindow';
import {
  setStartupOnBoot_darwin, getStartupOnBoot_darwin,
  getStartupOnBoot_linux, setStartupOnBoot_linux,
  getStartupOnBoot_win32, setStartupOnBoot_win32
} from '../core/helpers';
import { i18n, ipcMainWindow } from '../electron';
import { getPluginsPath } from '../utils/utils';

/* main service handler */
export class DesktopService implements DesktopServiceType {
  ipc: IpcMain

  constructor(ipc: IpcMain) {
    this.ipc = ipc;
  }

  async openNotification(
    params: {
      title?: string, action?: 'warning' | 'error' | 'info',
      body: string, subtitle?: string,
      urgency?: "normal" | "critical" | "low" | undefined
    }
  ): Promise<ServiceResult> {
    return new Promise(resolve => {
      new Notification({
        title:
          params.title
          ?? (params.action && i18n.__(`action_${params.action}`))
          ?? 'shadowsocks-electron',
        subtitle: params.subtitle,
        body: params.body,
        urgency: params.urgency ?? 'normal'
      }).show();
    });
  }

  async openProcessManager(): Promise<void> {
    ProcessManager.openWindow();
  }

  async getStartupOnBoot(): Promise<ServiceResult> {
    return new Promise(resolve => {
      switch (os.platform()) {
        case 'linux':
          getStartupOnBoot_linux().then(value => {
            resolve({
              code: 200,
              result: value
            });
          }).catch(error => {
            resolve({
              code: 500,
              result: error.toString()
            });
          });
          break;
        case 'darwin':
          getStartupOnBoot_darwin().then(value => {
            resolve({
              code: 200,
              result: value
            });
          }).catch(error => {
            resolve({
              code: 500,
              result: error.toString()
            });
          });
          break;
        case 'win32':
          getStartupOnBoot_win32().then(value => {
            resolve({
              code: 200,
              result: value
            });
          }).catch(error => {
            resolve({
              code: 500,
              result: error.toString()
            });
          });
          break;
        default:
          resolve({
            code: 500,
            result: `Platform ${process.platform} is not supported!`
          });
          break;
      }
    })
  }

  async setStartupOnBoot(on: boolean): Promise<ServiceResult> {
    return new Promise(resolve => {
      switch (os.platform()) {
        case 'linux':
          setStartupOnBoot_linux(on)
          .then(data => {
            resolve({
              code: 200,
              result: data
            });
          })
          .catch(err => {
            resolve({
              code: 500,
              result: err.toString()
            });
          });
          break;
        case 'darwin':
          setStartupOnBoot_darwin({
            openAtLogin: on,
            openAsHidden: true
          });
          resolve({
            code: 200,
            result: {}
          });
          break;
        case 'win32':
          setStartupOnBoot_win32({
            openAtLogin: on
          });
          resolve({
            code: 200,
            result: {}
          });
          break;
        default:
          resolve({
            code: 500,
            result: `Platform ${process.platform} is not supported!`
          });
          break;
      }
    });
  }

  async setAclUrl(): Promise<ServiceResult> {
    return new Promise(resolve => {
      const filePath = dialog.showOpenDialogSync((global as any).win, {
        defaultPath: app.getPath('home'),
        properties: ['openFile', 'showHiddenFiles'],
      });
      if (filePath && filePath.length) {
        resolve({
          code: 200,
          result: filePath[0]
        });
      } else {
        resolve({
          code: 404,
          result: null
        });
      }
    });
  }

  async restoreConfigurationFromFile(): Promise<ServiceResult> {
    const filePath = dialog.showOpenDialogSync((global as any).win, {
      defaultPath: `${app.getPath('downloads')}/gui-config.json`,
      properties: ['openFile', 'showHiddenFiles']
    });
    return new Promise(resolve => {
      if (filePath && filePath.length) {
        fs.readFile(filePath[0], 'utf-8', (err, data) => {
          if (err) {
            console.log(err);
            return resolve({
              code: 500,
              result: err.toString()
            });
          }
          try {
            resolve({
              code: 200,
              result: JSON.parse(data)
            });
          } catch (error) {
            resolve({
              code: 600,
              result: filePath
            });
          }
        });
      } else {
        resolve({
          code: 404,
          result: null
        });
      };
    });
  }

  async backupConfigurationToFile(params: JSON): Promise<ServiceResult> {
    const filePath = dialog.showSaveDialogSync((global as any).win, {
      defaultPath: `${app.getPath('downloads')}/gui-config.json`
    });
    return new Promise(resolve => {
      if (filePath) {
        fs.writeFile(filePath, JSON.stringify(params, null, 2), (err) => {
          if (err) {
            console.log(err);
            return resolve({
              code: 500,
              result: err.toString()
            });
          }
          resolve({
            code: 200,
            result: filePath
          });
        });
      } else {
        resolve({
          code: 404,
          result: null
        });
      };
    });
  }

  async createTransparentWindow(params: RectPoint[]): Promise<ServiceResult> {
    return new Promise(resolve => {
      const win = new TransparentWindow();
      win.create({
        fillRect: params.map(item => ({
          x: item.x ?? 0,
          y: item.y ?? 0,
          width: item.width ?? 0,
          height: item.height ?? 0
        }))
      })
      .then(() => {
        setTimeout(() => {
          win.destroy();
        }, 1.2e3);
        resolve({
          code: 200,
          result: 'success'
        });
      })
      .catch((error) => {
        resolve({
          code: 500,
          result: error.toString()
        });
      });
    })
  }

  async getScreenCapturedResources(params: WindowInfo): Promise<ServiceResult> {

    const { devicePixelRatio, width, height, types } = params;

    return new Promise(resolve => {
      desktopCapturer.getSources({
        types: types,
        thumbnailSize: {
          width: width * devicePixelRatio,
          height: height * devicePixelRatio
        }
      }).then((sources) => {
        resolve({
          code: 200,
          result: sources
        });
      }).catch(err => {
        resolve({
          code: 500,
          result: err.toString
        });
      });
    });
  }

  async reloadMainWindow(params: any): Promise<ServiceResult> {
    if ((global as any).win) {
      console.log('reload');
      (global as any).win.reload();
    }

    return Promise.resolve({
      code: 200,
      result: {}
    });
  }

  async openPluginsDir(params: any): Promise<ServiceResult> {
    const dir = getPluginsPath();
    open(dir);
    return Promise.resolve({
      code: 200,
      result: {}
    });
  }

  async openLogDir(): Promise<ServiceResult> {
    return new Promise((resolve) => {
      openLogDir()
        .then(rsp => {
          resolve({
            code: 200,
            result: ''
          });
        })
        .catch(error => {
          resolve({
            code: 500,
            result: error.toString()
          });
        })
    });
  }

  async contextMenu(actions: contextAction[]): Promise<ServiceResult> {
    return new Promise(resolve => {
      const templates = actions.map(action => {
        let a: Electron.MenuItemConstructorOptions = {
          ...action
        };
        a.click = (function(this: any) {
          resolve({
            code: 200,
            result: this.action
          });
        }).bind(a);

        return a;
      })
      Menu.buildFromTemplate(templates).popup();
    });
  }

  async hideApp(actions: contextAction[]): Promise<void> {
    return new Promise(resolve => {
      // dialog.showMessageBoxSync({
      //   message: 'Close server and quit?',
      //   type: 'question',
      // });
      ipcMainWindow?.quit();
      resolve();
    });
  }

  async minimumApp(actions: contextAction[]): Promise<void> {
    return new Promise(resolve => {
      ipcMainWindow?.hide();
      resolve();
    });
  }

  async setLocale(lang: 'en-US' | 'zh-CN'): Promise<void> {
    return new Promise((resolve) => {
      i18n.setLocale(lang);
      ipcMainWindow.setLocaleTrayMenu();
      resolve();
    });
  }
}
