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
      fs.promises.rm(task.taskPath, { recursive: true, force: true }).catch((e) => e);
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
      try {
        await fs.promises.access(this.taskPath, fs.constants.O_DIRECT);
      } catch (error) {
        await fs.promises.mkdir(this.taskPath, { recursive: true });
      }
      await fs.promises.writeFile(this.metaPath, metaData, 'utf-8');
    } catch (error) {
      return error as Error;
    }

    return null;
  }

  async writeToScriptFile(script: string) {
    try {
      try {
        await fs.promises.access(this.taskPath, fs.constants.O_DIRECT);
      } catch (error) {
        await fs.promises.mkdir(this.taskPath, { recursive: true });
      }
      await fs.promises.writeFile(this.scriptPath, script, 'utf-8');
    } catch (error) {
      return error as Error;
    }

    return null;
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

  setStatus(status: WorkflowTaskStatus) {
    this.status = status;
  }

  /**
   * @name start
   * @description Start the task
   * @returns [TaskExecutionError | TaskIsAbortedError | TaskIsRunningError | null, unknown | null]
   *
   */
  start(payload: unknown, options: object) {
    const tuple: [TaskExecutionError | TaskIsAbortedError | TaskIsRunningError | null, unknown | null] = [null, null];

    if (this.status === 'running') {
      console.warn('Task is already running: ', this.id);
      tuple[0] = new TaskIsRunningError(this.id);
      tuple[1] = null;
      return Promise.resolve(tuple);
    }

    this.status = 'running';
    this.abortCtrl = new AbortController();

    return new Promise<typeof tuple>((resolve) => {
      const abortCallback = () => {
        tuple[0] = new TaskIsAbortedError(this.id);
        tuple[1] = null;
        return resolve(tuple);
      };
      this.abortCtrl?.signal.addEventListener('abort', abortCallback);

      Promise
        .resolve(() => {
          if (this.abortCtrl?.signal.aborted) {
            throw new TaskIsAbortedError(this.id);
          }
        })
        .then(() => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          delete require.cache[this.scriptPath]; // clear module cache
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const scriptModule = require(this.scriptPath);
          return scriptModule(payload, options);
        })
        .then((moduleResults: unknown) => {
          if (this.abortCtrl?.signal.aborted) {
            throw new TaskIsAbortedError(this.id);
          }
          this.status = 'success';
          tuple[0] = null;
          tuple[1] = moduleResults;

          resolve(tuple);
        })
        .catch((err: unknown) => {
          if (err instanceof TaskIsAbortedError) {
            this.status = 'idle';
            tuple[0] = err;
          } else {
            this.status = 'failed';
            tuple[0] = new TaskExecutionError(this.id, (err as Error).message);
          }
          tuple[1] = null;

          resolve(tuple);
        })
        .finally(() => {
          tuple[0] && console.error(tuple[0]);
          this.abortCtrl?.signal.removeEventListener('abort', abortCallback);
        });
    });
  }

  /**
   * @name stop
   * @description Stop the task
   * @returns Promise<TaskIsNotRunningError | null>
   */
  stop(): Promise<TaskIsNotRunningError | null> {
    return new Promise((resolve) => {
      if (this.status !== 'running') {
        console.warn('Task is not running: ', this.id);
        return resolve(new TaskIsNotRunningError(this.id));
      }
      const abortCallback = () => {
        this.status = 'idle';
        this.abortCtrl?.signal.removeEventListener('abort', abortCallback);
        resolve(null);
      };

      this.abortCtrl?.signal.addEventListener('abort', abortCallback);
      this.abortCtrl?.abort();
    });
  }

  async remove(): Promise<Error | null> {
    try {
      await fs.promises.rm(this.taskPath, { recursive: true, force: true });
    } catch (error) {
      return error as Error;
    }

    return null;
  }
}
