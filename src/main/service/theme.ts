import { IpcMain } from 'electron';

import { appEventCenter } from '@main/event';
import { debounce } from '@main/core/utils';
import { ServiceResult, ThemeService as ThemeServiceType } from '@main/type';

const updateTheme = debounce<boolean[]>((shouldUseDarkColors) => {
  appEventCenter.emit('sendToWeb', 'theme:update', { shouldUseDarkColors });
}, 300);

export class ThemeService implements ThemeServiceType {
  ipc: IpcMain;

  constructor(ipc: IpcMain) {
    const { autoTheme } = appEventCenter.getStoreData('settings');
    this.ipc = ipc;
    autoTheme && this.listenForUpdate();
  }

  private updateTheme(event: { sender: { shouldUseDarkColors: boolean  } }) {
    updateTheme(event.sender.shouldUseDarkColors);
  }

  async listenForUpdate(): Promise<ServiceResult> {
    appEventCenter.unregistryListenerForThemeUpdate(this.updateTheme);
    appEventCenter.registryListenerForThemeUpdate(this.updateTheme);

    return {
      code: 200,
      result: null
    };
  }

  async unlistenForUpdate(): Promise<ServiceResult> {
    appEventCenter.unregistryListenerForThemeUpdate(this.updateTheme);

    return {
      code: 200,
      result: null
    };
  }

  async getSystemThemeInfo(): Promise<ServiceResult> {
    return {
      code: 200,
      result: appEventCenter.getNativeTheme(),
    };
  }
}
