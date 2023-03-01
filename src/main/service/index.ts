import { WorkflowManager } from '@main/core/workflow/manager';
/**
* @description: 主进程ipc信号监听器
*/
import {
  IpcMainProcess as IpcMainProcessType,
  IpcMain,
  MainService as MainServiceType,
  DesktopService as DesktopServiceType,
  ThemeService as ThemeServiceType,
  WorkflowService as WorkflowServiceType,
} from '../type';

import { MainService } from './server';
import { DesktopService } from './desktop';
import { ThemeService } from './theme';
import { WorkflowService } from './workflow';

import { ipcBridge } from '../utils';

export const workflowManager = new WorkflowManager();

export class IpcMainProcess implements IpcMainProcessType {
  ipc: IpcMain
  mainService: MainServiceType
  desktopService: DesktopServiceType
  themeService: ThemeServiceType
  workflowService: WorkflowServiceType

  constructor(ipc: IpcMain) {
    const mainService = new MainService(ipc);
    const desktopService = new DesktopService(ipc);
    const themeService = new ThemeService(ipc);
    const workflowService = new WorkflowService(ipc, workflowManager);

    this.ipc = ipc;
    this.mainService = ipcBridge<MainServiceType>(this.ipc, 'service:main', mainService);
    this.desktopService = ipcBridge<DesktopServiceType>(this.ipc, 'service:desktop', desktopService);
    this.themeService = ipcBridge<ThemeServiceType>(this.ipc, 'service:theme', themeService);
    this.workflowService = ipcBridge<WorkflowServiceType>(this.ipc, 'service:workflow', workflowService);
  }
}
