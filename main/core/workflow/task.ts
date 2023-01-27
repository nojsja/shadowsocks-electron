import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AbortController } from 'node-abort-controller';

import { Workflow } from './base';
import { TaskExecutionError, TaskIsAbortedError, TaskIsNotRunningError, TaskIsRunningError, WorkflowTaskOptions, WorkflowTaskStatus, WorkflowTaskType } from './types';

export class WorkflowTask extends Workflow {
  constructor(options: Partial<WorkflowTaskOptions>) {
    super();
    this.id = options.id ?? uuidv4();
    this.type = options.type ?? 'node-source';
    this.status = options.status ?? 'idle';
    this.taskPath = path.resolve(this.taskDir, this.id);
    this.scriptPath = path.resolve(this.taskPath, 'index.js');
    this.metaPath = path.resolve(this.taskPath, 'meta.json');
    this.abortCtrl = null;
  }

  id: string;
  status: WorkflowTaskStatus;
  type: WorkflowTaskType;
  scriptPath: string;
  taskPath: string;
  metaPath: string;
  abortCtrl: AbortController | null = null;

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

    await fs.promises.writeFile(this.metaPath, metaData, 'utf-8');
  }

  async writeToScriptFile(script: string) {
    await fs.promises.writeFile(this.scriptPath, script, 'utf-8');
  }

  /**
   * @name start
   * @description Start the task
   * @returns [TaskExecutionError | TaskIsAbortedError | TaskIsRunningError | null, unknown | null]
   *
   */
  async start(): Promise<[TaskExecutionError | TaskIsAbortedError | TaskIsRunningError | null, unknown | null]> {
    if (this.status === 'running') {
      console.warn('Task is already running: ', this.id);
      return [new TaskIsRunningError(this.id), null];
    }
    this.status = 'running';
    this.abortCtrl = new AbortController();

    return new Promise(async (resolve) => {
      const abortCallback = async () => {
        resolve([new TaskIsAbortedError(this.id), null]);
      };
      this.abortCtrl?.signal.addEventListener('abort', abortCallback);

      try {
        const scriptModule = require(this.scriptPath);
        if (this.abortCtrl?.signal.aborted) return;

        const result = await scriptModule.default();
        if (this.abortCtrl?.signal.aborted) return;

        this.status = 'success';
        resolve([null, result]);
      } catch (error: unknown) {
        console.error(error);
        this.status = 'failed';
        resolve([new TaskExecutionError(this.id, (error as Error).message), null])
      }

      this.abortCtrl?.signal.removeEventListener('abort', abortCallback);
    });
  };

  /**
   * @name stop
   * @description Stop the task
   * @returns [TaskIsNotRunningError | null, boolean]
   */
  async stop(): Promise<[TaskIsNotRunningError | null, boolean]> {
    return new Promise((resolve) => {
      if (this.status !== 'running') {
        console.warn('Task is not running: ', this.id);
        return resolve([new TaskIsNotRunningError(this.id), false]);
      }
      const abortCallback = () => {
        this.status = 'idle';
        resolve([null, true])
        this.abortCtrl?.signal.removeEventListener('abort', abortCallback);
      };
      this.abortCtrl?.signal.addEventListener('abort', abortCallback);
      this.abortCtrl?.abort();
    });
  }
}
