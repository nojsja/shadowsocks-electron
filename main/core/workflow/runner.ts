import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import schedule from 'node-schedule';

import { Workflow } from './base';
import { WorkflowTask } from './task';
import { WorkflowBridge } from './bridge';
import {
  RunnerIsRunningError,
  WorkflowRunnerOptions,
  WorkflowTaskOptions,
  WorkflowTaskStatus,
  WorkflowTaskTimer,
} from './types';

export class WorkflowRunner extends Workflow {
  constructor(options: Partial<WorkflowRunnerOptions>, bridge: WorkflowBridge) {
    super();
    this.id = options.id ?? uuidv4();
    this.metaPath = path.resolve(this.rootDir, `${this.id}.workflow.json`);
    this.enable = options.enable ?? true;
    this.status = options.status ?? 'idle';
    this.timerOption = options.timer ?? { enable: false };
    this.tasks = options.tasks ?? [];
    this.queue = [];
    this.timer = null;
    this.schedule = null;
    this.bridge = bridge;
  }

  id: string;
  metaPath: string;
  enable: boolean;
  status: WorkflowTaskStatus;
  timerOption: WorkflowTaskTimer;
  tasks: string[];
  queue: WorkflowTask[];
  timer: NodeJS.Timer | null;
  schedule: schedule.Job | null;
  bridge: WorkflowBridge;

  static getMetaPath(id: string) {
    return path.resolve(Workflow.rootDir, `${id}.workflow.json`);
  }

  static async generate(options: Partial<WorkflowRunnerOptions> | null, bridge: WorkflowBridge) {
    const runner = new WorkflowRunner(options ?? {}, bridge);
    try {
      await runner.writeToMetaFile();
      const tasks = await runner.initTasks();
      const succeed = tasks.every((task) => task);
      if (!succeed) throw new Error('workflow runner: init tasks failed!');
      runner.queue = tasks as WorkflowTask[];
    } catch (error) {
      fs.promises.unlink(runner.metaPath).catch((e) => e);
      return null;
    }
    return runner;
  }

  static async from(id: string, bridge: WorkflowBridge) {
    try {
      const isExists = await WorkflowRunner.isExist(id);
      if (isExists) {
        const metaPath = WorkflowRunner.getMetaPath(id);
        const metaData = JSON.parse(await fs.promises.readFile(metaPath, 'utf-8')) as Partial<WorkflowRunnerOptions>;
        const runner = new WorkflowRunner(metaData, bridge);
        const tasks = await runner.loadTasks();
        const succeed = tasks.every((task) => task);
        if (!succeed) throw new Error('workflow runner: load tasks failed!');
        runner.queue = tasks as WorkflowTask[];
        return runner;
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  static async isExist(id: string) {
    try {
      const statInfo = await fs.promises.stat(WorkflowRunner.getMetaPath(id));
      return statInfo.isFile();
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async writeToMetaFile() {
    const metaData = JSON.stringify({
      id: this.id,
      enable: this.enable,
      timer: this.timerOption,
      tasks: this.tasks,
    });

    await fs.promises.writeFile(this.metaPath, metaData, 'utf-8');
  }

  get isRunning() {
    return this.status === 'running';
  }

  get isIdle() {
    return this.status === 'idle';
  }

  get isSuccess() {
    return this.status === 'success';
  }

  get isFailed() {
    return this.status === 'failed';
  }

  private initTasks() {
    return Promise.all(
      this.tasks.map((taskId) => WorkflowTask.generate({
        id: taskId,
      }))
    );
  }

  private loadTasks() {
    return Promise.all(
      this.tasks.map((taskId) => WorkflowTask.from(taskId))
    );
  }

  async pushTask(options: Partial<WorkflowTaskOptions>) {
    const task = await WorkflowTask.generate(options);
    if (task) {
      this.tasks.push(task.id);
      this.queue.push(task);
      try {
        await this.writeToMetaFile();
      } catch (error) {
        console.error(error);
        return error as Error;
      }
    }

    return null;
  }

  async removeTask(id: string) {
    const index = this.tasks.findIndex((taskId) => taskId === id);
    let targetTask: WorkflowTask | null = null;

    if (index > -1) {
      this.tasks.splice(index, 1);
      targetTask = this.queue.splice(index, 1)[0];
      try {
        await targetTask.stop();
        await this.writeToMetaFile();
      } catch (error) {
        console.error(error);
        return error as Error;
      }
    }

    return null;
  }

  startTimer() {
    const timerOption = this.timerOption;
    const minute = 60 * 1000;
    if (!timerOption.enable) return;

    if (timerOption.type === 'timer') {
      if (!timerOption.interval) return;
      this.timer = setInterval(() => {
        this.start();
      }, (+timerOption.interval) * minute);
      return;
    }

    if (timerOption.type === 'schedule') {
      if (!timerOption.schedule) return;
      this.schedule = schedule.scheduleJob(timerOption.schedule, () => {
        this.start();
      });
    }
  }

  stopTimer() {
    this.timer && clearInterval(this.timer);
    this.schedule && this.schedule.cancel();
  }

  async start() {
    if (this.isRunning) return new RunnerIsRunningError(this.id);
    this.status = 'running';

    try {
      await this.queue.reduce(
        async (memo, task) => {
          const payload = await memo;
          const [error, result] = await task.start(
            payload,
            this.bridge.context?.[task.type] ?? {},
          );
          if (error) throw error;
          return result;
        },
        Promise.resolve() as Promise<unknown>,
      );
    } catch (error) {
      this.status = 'failed';
      return error as Error;
    }

    this.status = 'success';
    return null;
  }

  async stop(): Promise<Error | null> {
    if (this.queue.every((task) => !task.isRunning)) return null;

    try {
      await this.queue.reduce(
        async (memo, task) => {
          await memo;
          await task.stop();
        },
        Promise.resolve(),
      );
    } catch (error) {
      return error as Error;
    }

    return null;
  }
}
