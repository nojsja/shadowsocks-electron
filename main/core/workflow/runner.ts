import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import schedule from 'node-schedule';

import { Workflow } from './base';
import { WorkflowTask } from './task';
import {
  WorkflowRunnerOptions,
  WorkflowTaskOptions,
  WorkflowTaskStatus,
  WorkflowTaskTimer,
} from './types';

export class WorkflowRunner extends Workflow {
  constructor(options: Partial<WorkflowRunnerOptions>) {
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

  static getMetaPath(id: string) {
    return path.resolve(Workflow.rootDir, `${id}.workflow.json`);
  }

  static async generate(options?: Partial<WorkflowRunnerOptions>) {
    const runner = new WorkflowRunner(options ?? {});
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

  static async from(id: string) {
    try {
      const isExists = await WorkflowRunner.isExist(id);
      if (isExists) {
        const metaPath = WorkflowRunner.getMetaPath(id);
        const metaData = JSON.parse(await fs.promises.readFile(metaPath, 'utf-8')) as Partial<WorkflowRunnerOptions>;
        const runner = new WorkflowRunner(metaData);
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

  initTasks() {
    return Promise.all(
      this.tasks.map((taskId) => WorkflowTask.generate({
        id: taskId,
      }))
    );
  }

  loadTasks() {
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
        return false;
      }
    }

    return true;
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
        return false;
      }
    }

    return targetTask || false;
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
    console.log('start');
  }

  async stop() {
    console.log('stop');
  }
}
