import fs from 'fs';
import _ from 'lodash';

import { Workflow } from './base';
import { WorkflowRunner } from './runner';
import {
  CronTableObject,
  WorkflowManagerStatus,
  WorkflowTaskOptions,
  WorkflowTaskTimer,
} from './types';
import { dateToCronTable } from '../../utils/utils';

export class WorkflowManager extends Workflow {
  constructor() {
    super();
    this.runners = [];
    this.runnerIds = [];
    this.status = 'uninitialized';
  }

  runners: WorkflowRunner[];
  runnerIds: string[];
  status: WorkflowManagerStatus;

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

    this.runnerIds.forEach(async (id) => {
      const runner = await WorkflowRunner.from(id);
      if (runner) {
        if (runner.enable) {
          runner.startTimer();
        }
        this.runners.push(runner);
      } else {
        failedTasks.push(id);
      }
    });

    this.status = 'initialized';
    this.emit('ready');

    // [suceed, failedTasks]
    return [!!failedTasks.length, failedTasks] as [boolean, string[]];
  }

  async ready() {
    return new Promise((resolve) => {
      if (this.status === 'initialized') {
        resolve(true);
      }
      this.once('ready', () => resolve(true));
    });
  }

  async getWorkflowRunners() {
    await this.ready();
    return this.runners;
  }

  async editWorkflowRunner(runnerId: string, options: {
    enable?: boolean;
    timer?: {
      enable?: boolean;
      type?: WorkflowTaskTimer['type'];
      interval?: number;
      schedule?: CronTableObject;
    };
  }) {
    const targetRunner = this.runners.find((runner) => runner.id === runnerId);
    const cloneRunner = _.clone(targetRunner);
    const timerType = options.timer?.type ?? cloneRunner?.timerOption?.type;
    const timerTouched = 'timer' in options;
    if (!targetRunner) return false;

    await this.ready();

    if ('enable' in options) {
      targetRunner.enable = !!options.enable;
    }
    if (timerTouched) {
      targetRunner.timerOption = {
        ...(cloneRunner?.timerOption ?? {}),
        type: timerType,
        enable: !!options.timer?.enable ?? cloneRunner?.enable ?? false,
        ...(
          timerType === 'schedule' && 'schedule' in (options!.timer || {})
        ) ? { schedule: dateToCronTable(options.timer?.schedule as CronTableObject) } : {},
        ...(
          timerType === 'timer' && 'interval' in (options.timer || {})
        ) ? { interval: options.timer?.interval } : {},
      };
    }

    try {
      await targetRunner.writeToMetaFile();
    } catch (error) {
      console.error(error);
      Object.assign(targetRunner, cloneRunner);
      return false;
    }

    if (targetRunner.enable && timerTouched) {
      targetRunner.stopTimer();
      targetRunner.startTimer();
    }

    return true;
  }

  async generateTaskOfRunner(task: Partial<WorkflowTaskOptions>, runnerId?: string) {
    let targetRunner: WorkflowRunner | null;

    await this.ready();

    if (runnerId) {
      targetRunner = this.runners.find((runner) => runner.id === runnerId) || null;
      if (!targetRunner) return false;
    } else {
      targetRunner = await WorkflowRunner.generate();
      if (!targetRunner) return false;
      this.runners.push(targetRunner);
    }

    const newTask = await targetRunner.pushTask(task);

    return newTask || false;
  }

  async removeTaskOfRunner(taskId: string, runnerId: string) {
    await this.ready();
    const targetRunner = this.runners.find((runner) => runner.id === runnerId);

    if (!targetRunner) return false;
    const removed = await targetRunner.removeTask(taskId);

    return removed;
  }

  async unload() {
    this.runners.forEach((runner) => {
      runner.stop();
    });
    this.runners = [];
    this.runnerIds = [];
    this.status = 'unloaded';
  }

}
