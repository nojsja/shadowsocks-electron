/**
* @description: 主进程ipc信号监听器
*/
import {
  IpcMainProcess as IpcMainProcessType,
  IpcMain,
  MainService as MainServiceType,
  DesktopService as DesktopServiceType
} from '../types/extention';
import { ipcBridge } from '../utils/ipcBridge';
import { MainService } from './server';
import { DesktopService } from './desktop';

export class IpcMainProcess implements IpcMainProcessType {
  ipc: IpcMain
  mainService: MainServiceType
  desktopService: DesktopServiceType

  constructor(ipc: IpcMain) {
    this.ipc = ipc;
    this.mainService = ipcBridge<MainServiceType>(this.ipc, 'service:main', new MainService(ipc));
    this.desktopService = ipcBridge<DesktopServiceType>(this.ipc, 'service:desktop', new DesktopService(ipc));
  }
}
