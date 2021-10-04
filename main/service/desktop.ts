import { IpcMain, app, dialog, Notification } from 'electron';
import fs from 'fs';
import os from 'os';
import { ProcessManager } from 'electron-re';

import {
  DesktopService as DesktopServiceType,
  rectPoint, ServiceResult
} from '../types/extention';
import { openLogDir } from '../logs';
import { createTransparentWindow } from '../electron';
import {
  setStartupOnBoot_darwin, getStartupOnBoot_darwin,
  getStartupOnBoot_linux, setStartupOnBoot_linux
} from '../helpers';

/* main service handler */
export class DesktopService implements DesktopServiceType {
  ipc: IpcMain

  constructor(ipc: IpcMain) {
    this.ipc = ipc;
  }

  async openNotification(
    params: { title?: string, body: string, subtitle?: string, urgency?: "normal" | "critical" | "low" | undefined }
  ): Promise<ServiceResult> {
    return new Promise(resolve => {
      new Notification({
        title: params.title ?? 'shadowsocks-electron',
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
        default:
          resolve({
            code: 500,
            result: `Platform ${process.platform} is not supported!`
          });
          break;
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

  async createTransparentWindow(params: rectPoint[]): Promise<ServiceResult> {
    return new Promise(resolve => {
      createTransparentWindow({
        fillRect: params.map(item => ({
          x: item.x ?? 0,
          y: item.y ?? 0,
          width: item.width ?? 0,
          height: item.height ?? 0
        }))
      })
      .then(() => {
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
}
