import { IpcMain } from 'electron';
import { workflowTaskDemoDir } from '../config';
import { WorkflowManager } from '../core/workflow/manager';
import { WorkflowTaskOptions } from '../core/workflow/types';

import { type WorkflowService as WorkflowServiceType } from '../types';
import { getPureRunners } from '../utils/utils';

export class WorkflowService implements WorkflowServiceType {
  ipc: IpcMain
  manager: WorkflowManager

  constructor(ipc: IpcMain, manager: WorkflowManager) {
    this.ipc = ipc;
    this.manager = manager;
  }

  async getWorkflowRunners() {
    const runners = await this.manager.getWorkflowRunners();
    const pureRunners = getPureRunners(runners);

    return {
      code: 200,
      result: pureRunners,
    };
  }

  async getWorkflowRunner(params: {id: string}) {
    const { id } = params;
    const runner = await this.manager.getWorkflowRunner(id);
    const pureRunner = runner ? getPureRunners([runner])[0] : null;

    return {
      code: pureRunner ? 200 : 404,
      result: pureRunner,
    };
  }

  async runWorkflowRunner(params: {id: string}) {
    const { id } = params;
    const error = await this.manager.runWorkflowRunner(id);

    return {
      code: error ? 500 : 200,
      result: error,
    };
  }

  async stopWorkflowRunner(params: {id: string}) {
    const { id } = params;
    const error = await this.manager.stopWorkflowRunner(id);

    return {
      code: error ? 500 : 200,
      result: error,
    };
  }


  async enableWorkflowRunner(params: {id: string}) {
    const { id } = params;
    const error = await this.manager.enableWorkflowRunner(id);

    return {
      code: error ? 500 : 200,
      result: error,
    };
  }

  async disableWorkflowRunner(params: {id: string}) {
    const { id } = params;
    const error = await this.manager.disableWorkflowRunner(id);

    return {
      code: error ? 500 : 200,
      result: error,
    };
  }

  async editWorkflowRunner(params: {id: string, options: {
    enable?: boolean;
    timer?: {
      enable?: boolean;
      schedule?: string;
    };
  }}) {
    const { id, options } = params;
    const error = await this.manager.editWorkflowRunner(id, options);

    return {
      code: error ? 500 : 200,
      result: error,
    };
  }

  async generateTaskOfRunner(params: { task: Partial<WorkflowTaskOptions>, runnerId?: string }) {
    const error = await this.manager.generateTaskOfRunner(params.task, params.runnerId);

    return {
      code: error ? 500 : 200,
      result: error,
    };
  }

  async removeTaskOfRunner(params: {taskId: string, runnerId: string}) {
    const { taskId, runnerId } = params;
    const error = await this.manager.removeTaskOfRunner(taskId, runnerId);

    return {
      code: error ? 500 : 200,
      result: error,
    };
  }

  async moveUpTaskOfRunner(params: {taskId: string, runnerId: string}) {
    const { taskId, runnerId } = params;
    const error = await this.manager.moveUpTaskOfRunner(taskId, runnerId);

    return {
      code: error ? 500 : 200,
      result: error,
    };
  }

  async moveDownTaskOfRunner(params: {taskId: string, runnerId: string}) {
    const { taskId, runnerId } = params;
    const error = await this.manager.moveDownTaskOfRunner(taskId, runnerId);

    return {
      code: error ? 500 : 200,
      result: error,
    };
  }

  async removeWorkflowRunner(params: {id: string}) {
    const { id } = params;
    const error = await this.manager.removeWorkflowRunner(id);

    return {
      code: error ? 500 : 200,
      result: error,
    };
  }

  async getWorkflowTaskDemoDir() {
    return {
      code: 200,
      result: workflowTaskDemoDir,
    };
  }
}