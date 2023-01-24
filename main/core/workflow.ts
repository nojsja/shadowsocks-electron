import EventEmitter from 'events';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  workflowRootDir,
  workflowTaskDir,
} from '../config';

export type WorkflowTaskType = 'puppeteer-source' | 'node-source' | 'processor-pipe' | 'effect-pipe';
export type WorkflowTaskStatus = 'idle' | 'running' | 'success' | 'failed';
export type WorkflowRunnerStatus = 'idle' | 'running' | 'success' | 'failed';
export interface WorkflowTaskTimer {
  enable: boolean;
  interval?: number;
}

interface WorkflowTaskOptions {
  id: string;
  type: WorkflowTaskType;
  status: WorkflowTaskStatus;
  script: string;
}

interface WorkflowRunnerOptions {
  id: string;
  enable: boolean;
  status: WorkflowRunnerStatus;
  timer: WorkflowTaskTimer;
  tasks: string[];
}

export class Workflow extends EventEmitter {
  public readonly rootDir = workflowRootDir;
  public readonly taskDir = workflowTaskDir;
  public static readonly rootDir = workflowRootDir;
  public static readonly taskDir = workflowTaskDir;
}

export class WorkflowTask extends Workflow {
  constructor(options: Partial<WorkflowTaskOptions>) {
    super();
    this.id = options.id ?? uuidv4();
    this.type = options.type ?? 'node-source';
    this.status = options.status ?? 'idle';
    this.taskPath = path.resolve(this.taskDir, this.id);
    this.scriptPath = path.resolve(this.taskPath, 'index.js');
    this.metaPath = path.resolve(this.taskPath, 'meta.json');
  }

  id: string;
  status: WorkflowTaskStatus;
  type: WorkflowTaskType;
  scriptPath: string;
  taskPath: string;
  metaPath: string;

  static getMetaPath(id: string) {
    return path.resolve(Workflow.taskDir, id, 'meta.json');
  }

  static async generate(options: Partial<WorkflowTaskOptions>) {
    const task = new WorkflowTask(options);
    try {
      await task.writeToMetaFile();
      await task.writeToScriptFile(options.script ?? '');
    } catch (error) {
      fs.promises.unlink(task.metaPath).catch((e) => e);
      fs.promises.unlink(task.scriptPath).catch((e) => e);
      return null;
    }
    return task;
  }

  static async from(id: string) {
    try {
      const isExists = await WorkflowTask.isExist(id);
      if (isExists) {
        const metaPath = WorkflowTask.getMetaPath(id);
        const metaData = JSON.parse(await fs.promises.readFile(metaPath, 'utf-8')) as Partial<WorkflowTaskOptions>;
        return new WorkflowTask(metaData);
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  static async isExist(id: string) {
    try {
      const statInfo = await fs.promises.stat(path.resolve(Workflow.taskDir, id, 'meta.json'));
      return statInfo.isFile();
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async writeToMetaFile() {
    const metaData = JSON.stringify({
      id: this.id,
      type: this.type,
      taskPath: this.taskPath,
      scriptPath: this.scriptPath,
      metaPath: this.metaPath,
    });

    try {
      await fs.promises.writeFile(this.metaPath, metaData, 'utf-8'),
        this.emit('init:succeed', this.id);
    } catch (error) {
      console.log(error);
      this.emit('init:failed', this.id, error);
    }
  }

  async writeToScriptFile(script: string) {
    try {
      await fs.promises.writeFile(this.scriptPath, script, 'utf-8');
      this.emit('write:succeed', this.id);
    } catch (error) {
      console.log(error);
      this.emit('write:failed', this.id, error);
    }
  }

  start() {
    console.log('start');
  }

  stop() {
    console.log('stop');
  }
}

export class WorkflowRunner extends Workflow {
  constructor(options: Partial<WorkflowRunnerOptions>) {
    super();
    this.id = options.id ?? uuidv4();
    this.metaPath = path.resolve(this.rootDir, `${this.id}.workflow.json`)
    this.enable = options.enable ?? true;
    this.status = options.status ?? 'idle';
    this.timer = options.timer ?? { enable: false };
    this.tasks = options.tasks ?? [];
    this.queue = [];
  }

  id: string;
  metaPath: string;
  enable: boolean;
  status: WorkflowTaskStatus;
  timer: WorkflowTaskTimer;
  tasks: string[];
  queue: WorkflowTask[];

  static getMetaPath(id: string) {
    return path.resolve(Workflow.rootDir, `${id}.workflow.json`);
  }

  static async generate(options: Partial<WorkflowRunnerOptions>) {
    const runner = new WorkflowRunner(options);
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
      timer: this.timer,
      tasks: this.tasks,
    });

    try {
      await fs.promises.writeFile(this.metaPath, metaData, 'utf-8'),
        this.emit('init:succeed', this.id);
    } catch (error) {
      console.log(error);
      this.emit('init:failed', this.id, error);
    }
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

  start() {
    console.log('start');
  }

  stop() {
    console.log('stop');
  }
}