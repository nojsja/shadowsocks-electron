import { IpcMain, nativeTheme } from 'electron';

import { electronStore, ipcMainWindow } from '@main/electron';
import { debounce } from '@main/core/utils';
import { ServiceResult, ThemeService as ThemeServiceType } from '@main/type';

const updateTheme = debounce<boolean[]>((shouldUseDarkColors) => {
  ipcMainWindow.win?.webContents.send('theme:update', { shouldUseDarkColors });
}, 300);

export class ThemeService implements ThemeServiceType {
  ipc: IpcMain;

  constructor(ipc: IpcMain) {
    this.ipc = ipc;

    let autoTheme = false;
    try {
      autoTheme = JSON.parse(
        JSON.parse(electronStore.get('persist:root') as string).settings
      ).autoTheme;
    } catch(error) {
      console.error(error);
    } finally {
      if (autoTheme) {
        this.listenForUpdate();
      }
    }
  }

  private updateTheme(event: { sender: { shouldUseDarkColors: boolean  } }) {
    updateTheme(event.sender.shouldUseDarkColors);
  }

  async listenForUpdate(): Promise<ServiceResult> {
    return new Promise((resolve) => {
      nativeTheme.off('updated', this.updateTheme);
      nativeTheme.on('updated', this.updateTheme);
      resolve({
        code: 200,
        result: null
      });
    });
  }

  async unlistenForUpdate(): Promise<ServiceResult> {
    return new Promise((resolve) => {
      nativeTheme.off('updated', this.updateTheme);
      resolve({
        code: 200,
        result: null
      });
    });
  }

  async getSystemThemeInfo(): Promise<ServiceResult> {
    return new Promise((resolve) => {
      resolve({
        code: 200,
        result: {
          shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
          shouldUseHighContrastColors: nativeTheme.shouldUseHighContrastColors,
          shouldUseInvertedColorScheme: nativeTheme.shouldUseInvertedColorScheme
        }
      });
    });
  }
}
