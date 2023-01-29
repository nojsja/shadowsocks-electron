import { IpcMain } from 'electron';
import { WorkflowManager } from '../core/workflow/manager';
import { CronTableObject, WorkflowTaskOptions } from '../core/workflow/types';

import { ServiceResult, WorkflowService as WorkflowServiceType, WorkflowTaskTimer } from '../types';

export class WorkflowService implements WorkflowServiceType {
  ipc: IpcMain
  manager: WorkflowManager

  constructor(ipc: IpcMain, manager: WorkflowManager) {
    this.ipc = ipc;
    this.manager = manager;
  }

  async getWorkflowRunners() {
    const runners = await this.manager.getWorkflowRunners();

    return {
      code: 200,
      result: runners,
    };
  }

  async getWorkflowRunner(id: string) {
    const runner = await this.manager.getWorkflowRunner(id);

    return {
      code: runner ? 200 : 404,
      result: runner,
    };
  }

  async runWorkflowRunner(id: string) {
    const error = await this.manager.runWorkflowRunner(id);

    return {
      code: error ? 500 : 200,
      result: error,
    };
  }

  async stopWorkflowRunner(id: string) {
    const error = await this.manager.stopWorkflowRunner(id);

    return {
      code: error ? 500 : 200,
      result: error,
    };
  }

  async editWorkflowRunner(id: string, options: {
    enable?: boolean;
    timer?: {
      enable?: boolean;
      type?: WorkflowTaskTimer['type'];
      interval?: number;
      schedule?: CronTableObject;
    };
  }) {
    const error = await this.manager.editWorkflowRunner(id, options);

    return {
      code: error ? 500 : 200,
      result: error,
    };
  }

  async generateTaskOfRunner(task: Partial<WorkflowTaskOptions>, runnerId?: string) {
    const error = await this.manager.generateTaskOfRunner(task, runnerId);

    return {
      code: error ? 500 : 200,
      result: error,
    };
  }

  async removeTaskOfRunner(taskId: string, runnerId: string) {
    const error = await this.manager.removeTaskOfRunner(taskId, runnerId);

    return {
      code: error ? 500 : 200,
      result: error,
    };
  }
}