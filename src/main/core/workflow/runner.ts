import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import schedule from 'node-schedule';

import { catcher } from '@common/utils';

import { Workflow } from './base';
import { WorkflowTask } from './task';
import { WorkflowBridge } from './bridge';
import {
  RunnerIsRunningError,
  TaskIsNotRunningError,
  WorkflowRunnerOptions,
  WorkflowTaskOptions,
  WorkflowTaskStatus,
  WorkflowTaskTimer,
  TaskNotFoundError,
} from './types';
import { TASK_TIMEOUT } from './consts';

export class WorkflowRunner extends Workflow {
  constructor(options: Partial<WorkflowRunnerOptions>, bridge: WorkflowBridge) {
    super();
    this.id = options.id ?? uuidv4();
    this.metaPath = path.resolve(this.rootDir, `${this.id}.workflow.json`);
    this.enable = options.enable ?? true;
    this.ctime = options.ctime ?? Date.now();
    this.status = this.proxyStatus({ value: options.status ?? 'idle' });
    this.timerOption = options.timer ?? { enable: false };
    this.tasks = options.tasks ?? [];
    this.queue = [];
    this.schedule = null;
    this.bridge = bridge;
  }

  id: string;
  metaPath: string;
  enable: boolean;
  ctime: number;
  status: { value: WorkflowTaskStatus };
  timerOption: WorkflowTaskTimer;
  tasks: string[];
  queue: WorkflowTask[];
  schedule: schedule.Job | null;
  bridge: WorkflowBridge;

  static getMetaPath(id: string) {
    return path.resolve(Workflow.rootDir, `${id}.workflow.json`);
  }

  static async generate(options: Partial<WorkflowRunnerOptions> | null, bridge: WorkflowBridge): Promise<[Error | null, WorkflowRunner | null]> {
    const runner = new WorkflowRunner(options ?? {}, bridge);

    try {
      await runner.writeToMetaFile();
      const tasks = await runner.initTasks();
      const succeed = tasks.every((task) => task);
      if (!succeed) throw new Error('workflow runner: init tasks failed!');
    } catch (error) {
      await runner.remove();
      return [error as Error, null];
    }

    return [null, runner];
  }

  static async from(id: string, bridge: WorkflowBridge): Promise<[Error | null, WorkflowRunner | null]> {
    try {
      const isExists = await WorkflowRunner.isExist(id);
      if (isExists) {
        const metaPath = WorkflowRunner.getMetaPath(id);
        const metaData = JSON.parse(await fs.promises.readFile(metaPath, 'utf-8')) as Partial<WorkflowRunnerOptions>;
        const runner = new WorkflowRunner(metaData, bridge);
        const tasks = await runner.loadTasks();
        const succeed = tasks.every((task) => task);
        if (!succeed) throw new Error('workflow runner: load tasks failed!');
        return [null, runner];
      }
      throw new Error('workflow runner: not exists!');
    } catch (error) {
      console.error(error);
      return [error as Error, null];
    }
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
      ctime: this.ctime,
      timer: this.timerOption,
      tasks: this.tasks,
    }, null, 2);

    try {
      // check if root dir exists
      await fs.promises.access(this.rootDir, fs.constants.F_OK);
    } catch (error) {
      const [err] = await catcher(fs.promises.mkdir(this.rootDir, { recursive: true }));
      if (err) return err;
    }

    const [err] = await catcher(fs.promises.writeFile(this.metaPath, metaData, 'utf-8'));
    if (err) return err;

    return null;
  }

  get isRunning() {
    return this.status.value === 'running';
  }

  get isIdle() {
    return this.status.value === 'idle';
  }

  get isSuccess() {
    return this.status.value === 'success';
  }

  get isFailed() {
    return this.status.value === 'failed';
  }

  get isEmpty() {
    return this.tasks.length === 0;
  }

  get length() {
    return this.tasks.length;
  }

  private initTasks() {
    return Promise.all(
      this.tasks.map((taskId) => WorkflowTask.generate({
        id: taskId,
        timeout: TASK_TIMEOUT,
      }))
    ).then((tasks) => {
      this.queue = tasks.filter(Boolean) as WorkflowTask[];
      this.queue.forEach((task) => {
        task.addListener('status:changed', this.watchTaskStatus);
      });
      return tasks;
    });
  }

  private proxyStatus(statusObj: { value: WorkflowTaskStatus }) {
    const handler = {
      set: (target: typeof statusObj, key: string, value: any) => {
        if (key === 'value') {
          this.bridge.dispatch('workflow:status', { runnerId: this.id, status: value });
          target[key] = value;
          return true;
        }
        return false;
      },
    };
    return new Proxy(statusObj, handler);
  }

  private watchTaskStatus = (taskObj: { status: WorkflowTaskStatus; id: string }) => {
    const { status, id } = taskObj;
    this.bridge.dispatch('workflow:task-status', { runnerId: this.id, taskId: id, status });
  }

  private loadTasks() {
    return Promise.all(
      this.tasks.map((taskId) => WorkflowTask.from(taskId))
    ).then((tasks) => {
      this.queue = tasks.filter(Boolean) as WorkflowTask[];
      this.queue.forEach((task) => {
        task.addListener('status:changed', this.watchTaskStatus);
      });
      return tasks;
    });
  }

  async pushTask(options: Partial<WorkflowTaskOptions>) {
    const task = await WorkflowTask.generate({
      timeout: TASK_TIMEOUT,
      ...options,
    });

    if (task) {
      this.tasks.push(task.id);
      const error = await this.writeToMetaFile();

      if (error) { // sync error then rollback
        this.tasks = this.tasks.filter((taskId) => taskId !== task.id);
        await task.remove();
        return error;
      }

      task.addListener('status:changed', this.watchTaskStatus);
      this.queue.push(task);
      return error;
    }

    return null;
  }

  async removeTask(id: string) {
    const index = this.tasks.findIndex((taskId) => taskId === id);
    let targetTask: WorkflowTask | null = null;
    let error: Error | null = null;

    if (index > -1) {
      targetTask = this.queue[index];
      error = await targetTask.stop();
      if (!(error instanceof TaskIsNotRunningError)) return error;

      error = await targetTask.remove();
      if (error) return error;

      this.tasks.splice(index, 1)[0];
      error = await this.writeToMetaFile();
      this.queue.splice(index, 1);

      if (error) return error;
    }

    return null;
  }

  async moveUpTask(id: string) {
    const index = this.tasks.findIndex((taskId) => taskId === id);
    let targetTask: WorkflowTask | null = null;
    let targetTaskId: string;

    if (index > 0) {
      targetTask = this.queue.splice(index, 1)[0];
      targetTaskId = this.tasks.splice(index, 1)[0];
      this.queue.splice(index - 1, 0, targetTask);
      this.tasks.splice(index - 1, 0, targetTaskId);
      return this.writeToMetaFile();
    }

    return null;
  }

  async moveDownTask(id: string) {
    const index = this.tasks.findIndex((taskId) => taskId === id);
    let targetTask: WorkflowTask | null = null;
    let targetTaskId: string;

    if (index > -1 && (index < (this.length - 1))) {
      targetTask = this.queue.splice(index, 1)[0];
      targetTaskId = this.tasks.splice(index, 1)[0];
      this.queue.splice(index + 1, 0, targetTask);
      this.tasks.splice(index + 1, 0, targetTaskId);
      return this.writeToMetaFile();
    }

    return null;
  }

  startTimer() {
    const timerOption = this.timerOption;

    if (!timerOption.enable) return;
    if (!timerOption.schedule) return;
    this.schedule = schedule.scheduleJob(timerOption.schedule, () => {
      this.start();
    });
  }

  stopTimer() {
    this.schedule && this.schedule.cancel();
  }

  async start() {
    if (this.isRunning) return new RunnerIsRunningError(this.id);
    this.status.value = 'running';

    try {
      Promise.allSettled(this.queue.map(async (task) => {
        await task.reset();
      }));
      await this.queue.reduce(
        async (memo, task) => {
          const payload = await memo;
          const [error, result] = await task.start(
            payload,
            this.bridge.context?.[task.type] as { [key: string]: unknown },
          );
          if (error) throw error;
          return result;
        },
        Promise.resolve() as Promise<unknown>,
      );
    } catch (error) {
      this.status.value = 'failed';
      return error as Error;
    }

    this.status.value = 'success';
    return null;
  }

  async startOneTask(id: string, payload: unknown) {
    const targetTask = this.queue.find(({ taskId }) => taskId === id);

    if (!targetTask) return new TaskNotFoundError(id);

    const [error] = await targetTask.start(
      payload,
      this.bridge.context?.[targetTask.type] as { [key: string]: unknown },
    );

    return error;
  }

  async stopOneTask(id: string) {
    const targetTask = this.queue.find(({ taskId }) => taskId === id);

    if (!targetTask) return new TaskNotFoundError(id);
    const result = await targetTask.stop();

    return result;
  }

  async stop(): Promise<Error | null> {
    try {
      await this.queue.reduce(
        async (memo, task) => {
          await memo;
          if (task.isRunning) {
            await task.stop();
          }
        },
        Promise.resolve(),
      );
    } catch (error) {
      return error as Error;
    }

    return null;
  }

  async remove(): Promise<Error | null> {
    try {
      this.stopTimer();
      await this.queue.reduce(
        async (memo, task) => {
          await memo;

          const errorWhenStop = await task.remove();
          if (errorWhenStop) throw errorWhenStop;

          const errorWhenRemove = await task.remove();
          if (errorWhenRemove) throw errorWhenRemove;
        },
        Promise.resolve(),
      );
      await fs.promises.rm(this.metaPath, { recursive: true, force: true });
    } catch (error) {
      return error as Error;
    }

    return null;
  }
}
