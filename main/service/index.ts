/**
* @description: 主进程ipc信号监听器
*/
import {
  IpcMainProcess as IpcMainProcessType,
  IpcMain,
  MainService as MainServiceType,
  DesktopService as DesktopServiceType,
  ThemeService as ThemeServiceType,
} from '../types';
import { ipcBridge } from '../utils/ipc-bridge';
import { MainService } from './server';
import { DesktopService } from './desktop';
import { ThemeService } from './theme';

export class IpcMainProcess implements IpcMainProcessType {
  ipc: IpcMain
  mainService: MainServiceType
  desktopService: DesktopServiceType
  themeService: ThemeServiceType

  constructor(ipc: IpcMain) {
    this.ipc = ipc;
    this.mainService = ipcBridge<MainServiceType>(this.ipc, 'service:main', new MainService(ipc));
    this.desktopService = ipcBridge<DesktopServiceType>(this.ipc, 'service:desktop', new DesktopService(ipc));
    this.themeService = ipcBridge<ThemeServiceType>(this.ipc, 'service:theme', new ThemeService(ipc));
  }
}
