import fs from 'fs';
import _ from 'lodash';

import { Workflow } from './base';
import { WorkflowRunner } from './runner';
import { WorkflowBridge } from './bridge';

import {
  RunnerCreateError,
  RunnerNotFoundError,
  WorkflowManagerStatus,
  WorkflowTaskOptions,
} from './types';

export class WorkflowManager extends Workflow {
  constructor() {
    super();
    this.runners = [];
    this.runnerIds = [];
    this.status = 'uninitialized';
    this.bridge = new WorkflowBridge();
  }

  runners: WorkflowRunner[];
  runnerIds: string[];
  status: WorkflowManagerStatus;
  bridge: WorkflowBridge;

  async bootstrap() {
    try {
      const contents = await fs.promises.readdir(this.rootDir);
      const runnerFiles = contents.filter((content) => content.endsWith('.workflow.json'));
      this.runnerIds = runnerFiles.map((runnerFile) => runnerFile.replace('.workflow.json', ''));
    } catch (error) {
      console.error(error);
      return false;
    }
    return true;
  }

  async init() {
    const failedTasks: string[] = [];
    await this.bridge.init();
    this.runnerIds.forEach(async (id) => {
      const [error, runner] = await WorkflowRunner.from(id, this.bridge);
      if (runner) {
        if (runner.enable) {
          runner.startTimer();
        }
        this.runners.push(runner);
      } else {
        console.error(error);
        failedTasks.push(id);
      }
    });

    this.status = 'initialized';
    this.emit('ready');

    // [suceed, failedTasks]
    return [!failedTasks.length, failedTasks] as [boolean, string[]];
  }

  ready() {
    return new Promise((resolve) => {
      if (this.status === 'initialized') {
        resolve(true);
        return;
      }
      this.once('ready', () => resolve(true));
    });
  }

  async getWorkflowRunners() {
    await this.ready();
    return this.runners;
  }

  async getWorkflowRunner(runnerId: string) {
    await this.ready();
    return this.runners.find((runner) => runner.id === runnerId) ?? null;
  }

  async runWorkflowRunner(runnerId: string) {
    const targetRunner = this.runners.find((runner) => runner.id === runnerId);
    if (!targetRunner) return new RunnerNotFoundError(runnerId);

    await this.ready();
    const error = await targetRunner.start();

    return error;
  }

  async stopWorkflowRunner(runnerId: string) {
    const targetRunner = this.runners.find((runner) => runner.id === runnerId);
    if (!targetRunner) return new RunnerNotFoundError(runnerId);

    await this.ready();
    const error = await targetRunner.stop();

    return error;
  }

  async editWorkflowRunner(runnerId: string, options: {
    enable?: boolean;
    timer?: {
      enable?: boolean;
      schedule?: string;
    };
  }) {
    const targetRunner = this.runners.find((runner) => runner.id === runnerId);
    if (!targetRunner) return new RunnerNotFoundError(runnerId);

    const cloneRunner = _.clone(targetRunner);
    const timerEnable = options.timer?.enable ?? cloneRunner?.timerOption?.enable;
    const timerTouched = 'timer' in options;

    await this.ready();

    if ('enable' in options) {
      targetRunner.enable = !!options.enable;
    }
    if (timerTouched) {
      targetRunner.timerOption = {
        ...(cloneRunner?.timerOption ?? {}),
        enable: timerEnable,
        ...('schedule' in (options.timer || {})) ? { schedule: options.timer?.schedule } : {},
      };
    }

    try {
      await targetRunner.writeToMetaFile();
    } catch (error) {
      console.error(error);
      Object.assign(targetRunner, cloneRunner);
      return error as Error;
    }

    if (targetRunner.enable) {
      if (timerTouched) { // status changed
        if (targetRunner.timerOption.enable) { // restart timer
          targetRunner.stopTimer();
          targetRunner.startTimer();
        } else { // stop timer
          targetRunner.stopTimer();
        }
      }
    } else { // stop timer
      targetRunner.stopTimer();
    }

    return null;
  }

  async generateTaskOfRunner(task: Partial<WorkflowTaskOptions>, runnerId?: string) {
    let targetRunner: WorkflowRunner | null;

    await this.ready();

    if (runnerId) {
      targetRunner = this.runners.find((runner) => runner.id === runnerId) || null;
      if (!targetRunner) return new RunnerNotFoundError(runnerId);
    } else {
      [, targetRunner] = await WorkflowRunner.generate(null, this.bridge);
      if (!targetRunner) return new RunnerCreateError();
      this.runners.push(targetRunner);
    }

    const error = await targetRunner.pushTask(task);

    return error;
  }

  async removeTaskOfRunner(taskId: string, runnerId: string) {
    await this.ready();

    const targetRunner = this.runners.find((runner) => runner.id === runnerId);
    if (!targetRunner) return new RunnerNotFoundError(runnerId);
    const error = await targetRunner.removeTask(taskId);

    return error;
  }

  async unloadWorkflowRunners() {
    this.runners.forEach(async (runner) => {
      runner.stopTimer();
      await runner.stop();
    });
    this.status = 'unloaded';
    return null;
  }

  async reloadWorkflowRunners() {
    this.runners.forEach(async (runner) => {
      runner.startTimer();
      await runner.start();
    });
    this.status = 'initialized';
  }

  async clearWorkflowRunners() {
    const errors: Array<Error | null> = [];

    this.runners.forEach(async (runner) => {
      const error = await runner.remove();
      if (!error) {
        this.runners = this.runners.filter((runner) => runner.id !== runner.id);
        this.runnerIds = this.runnerIds.filter((id) => id !== runner.id);
      } else {
        errors.push(error);
      }
    });

    if (!errors.length) {
      this.status = 'uninitialized';
    }

    return errors;
  }

  async removeWorkflowRunner(runnerId: string) {
    await this.ready();

    const targetRunner = this.runners.find((runner) => runner.id === runnerId);
    if (!targetRunner) return new RunnerNotFoundError(runnerId);

    const error = await targetRunner.remove();
    if (!error) {
      this.runners = this.runners.filter((runner) => runner.id !== runnerId);
    }

    return error;
  }

  async enableWorkflowRunner(runnerId: string) {
    const targetRunner = this.runners.find((runner) => runner.id === runnerId);
    let error: Error | null = null;
    if (!targetRunner) return new RunnerNotFoundError(runnerId);

    targetRunner.enable = true;
    error = await targetRunner.writeToMetaFile();
    if (error) {
      targetRunner.enable = false;
      return error;
    }

    return null;
  }

  async disableWorkflowRunner(runnerId: string) {
    const targetRunner = this.runners.find((runner) => runner.id === runnerId);
    let error: Error | null = null;
    if (!targetRunner) return new RunnerNotFoundError(runnerId);

    targetRunner.enable = false;
    error = await targetRunner.writeToMetaFile();
    if (error) {
      targetRunner.enable = true;
      return error;
    }

    return null;
  }
}
