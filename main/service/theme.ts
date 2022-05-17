import { IpcMain, nativeTheme } from 'electron';

import { ipcMainWindow } from '../electron';
import { ServiceResult, ThemeService as ThemeServiceType } from '../types/extention';
import { debounce } from '../utils/utils';

const updateTheme = debounce<boolean[]>((shouldUseDarkColors) => {
  ipcMainWindow.win?.webContents.send('theme:update', { shouldUseDarkColors });
}, 300);

export class ThemeService implements ThemeServiceType {
  ipc: IpcMain;

  constructor(ipc: IpcMain) {
    this.ipc = ipc;
  }

  private updateTheme(event: { sender: { shouldUseDarkColors: boolean  } }) {
    updateTheme(event.sender.shouldUseDarkColors);
  }

  async listenForUpdate(params: any): Promise<ServiceResult> {
    return new Promise((resolve, reject) => {
      nativeTheme.on('updated', this.updateTheme);
      resolve({
        code: 200,
        result: null
      });
    });
  };

  async unlistenForUpdate(params: any): Promise<ServiceResult> {
    return new Promise((resolve, reject) => {
      nativeTheme.off('updated', this.updateTheme);
      resolve({
        code: 200,
        result: null
      });
    });
  };
}
