/**
* @description: IpcMainProcess
*/
import {
  IpcMainProcess as IpcMainProcessType,
  IpcMain,
  MainService as MainServiceType,
  DesktopService as DesktopServiceType,
  ThemeService as ThemeServiceType,
  WorkflowService as WorkflowServiceType,
  AIService as AIServiceType,
} from '@main/type';

import { ipcBridge } from '@main/utils';

import { MainService } from './server';
import { DesktopService } from './desktop';
import { ThemeService } from './theme';
import { WorkflowService } from './workflow';
import { AIService } from './ai';

export class IpcMainProcess implements IpcMainProcessType {
  ipc: IpcMain
  mainService: MainServiceType
  desktopService: DesktopServiceType
  themeService: ThemeServiceType
  workflowService: WorkflowServiceType
  aiService: AIServiceType

  constructor(ipc: IpcMain) {
    const mainService = new MainService(ipc);
    const desktopService = new DesktopService(ipc);
    const themeService = new ThemeService(ipc);
    const workflowService = new WorkflowService(ipc);
    const aiService = new AIService(ipc);

    this.ipc = ipc;
    this.mainService = ipcBridge<MainServiceType>(this.ipc, 'service:main', mainService);
    this.desktopService = ipcBridge<DesktopServiceType>(this.ipc, 'service:desktop', desktopService);
    this.themeService = ipcBridge<ThemeServiceType>(this.ipc, 'service:theme', themeService);
    this.workflowService = ipcBridge<WorkflowServiceType>(this.ipc, 'service:workflow', workflowService);
    this.aiService = ipcBridge<AIServiceType>(this.ipc, 'service:ai', aiService);
  }
}
