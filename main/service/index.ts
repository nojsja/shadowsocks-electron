import { WorkflowManager } from '../core/workflow/manager';
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
} from '../types';

import { MainService } from './server';
import { DesktopService } from './desktop';
import { ThemeService } from './theme';
import { WorkflowService } from './workflow';

import { ipcBridge } from '../utils/ipc-bridge';

export const workflowManager = new WorkflowManager();

export class IpcMainProcess implements IpcMainProcessType {
  ipc: IpcMain
  mainService: MainServiceType
  desktopService: DesktopServiceType
  themeService: ThemeServiceType
  workflowService: WorkflowServiceType

  constructor(ipc: IpcMain) {
    this.ipc = ipc;
    this.mainService = ipcBridge<MainServiceType>(this.ipc, 'service:main', new MainService(ipc));
    this.desktopService = ipcBridge<DesktopServiceType>(this.ipc, 'service:desktop', new DesktopService(ipc));
    this.themeService = ipcBridge<ThemeServiceType>(this.ipc, 'service:theme', new ThemeService(ipc));
    this.workflowService = ipcBridge<WorkflowServiceType>(this.ipc, 'service:workflow', new WorkflowService(ipc, workflowManager));
  }
}
