import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AbortController } from 'node-abort-controller';
import vm from 'vm';

import { Workflow } from './base';
import {
  TaskExecutionError,
  TaskIsAbortedError,
  TaskIsNotRunningError,
  TaskIsRunningError,
  WorkflowTaskOptions,
  WorkflowTaskStatus,
  WorkflowTaskType
} from './types';
import { TASK_TIMEOUT } from './consts';
import { WorkflowBridgeConsole } from './bridge';

export class WorkflowTask extends Workflow {
  constructor(options: Partial<WorkflowTaskOptions>) {
    super();
    this.id = options.id ?? uuidv4();
    this.type = options.type ?? 'node-source';
    this.status = this.proxyStatus({ value: options.status ?? 'idle' });
    this.taskPath = path.resolve(this.taskDir, this.id);
    this.scriptPath = path.resolve(this.taskPath, 'index.js');
    this.metaPath = path.resolve(this.taskPath, 'manifest.json');
    this.abortCtrl = null;
    this.timeout = options.timeout ?? -1;
  }

  id: string;
  status: { value:  WorkflowTaskStatus };
  type: WorkflowTaskType;
  scriptPath: string;
  taskPath: string;
  metaPath: string;
  abortCtrl: AbortController | null;
  timeout: number;

  static getMetaPath(id: string) {
    return path.resolve(Workflow.taskDir, id, 'manifest.json');
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
        const task = new WorkflowTask(
          Object.assign(
            metaData,
            {
              timeout: metaData.timeout ?? TASK_TIMEOUT
            }
          )
        );
        return task;
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  static async isExist(id: string) {
    try {
      const statInfo = await fs.promises.stat(path.resolve(
        Workflow.taskDir,
        id,
        'manifest.json'
      ));
      return statInfo.isFile();
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  private proxyStatus(statusObj: { value: WorkflowTaskStatus }) {
    const handler = {
      set: (target: typeof statusObj, key: string, value: any) => {
        if (key === 'value') {
          target[key] = value;
          this.emit('status:changed', { id: this.id, status: value });
          return true;
        }
        return false;
      },
    };
    return new Proxy(statusObj, handler);
  }

  async writeToMetaFile() {
    const metaData = JSON.stringify({
      id: this.id,
      type: this.type,
      taskPath: this.taskPath,
      scriptPath: this.scriptPath,
      metaPath: this.metaPath,
      timeout: this.timeout,
    }, null, 2);

    try {
      try {
        await fs.promises.access(this.taskPath, fs.constants.F_OK);
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
        await fs.promises.access(this.taskPath, fs.constants.F_OK);
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

  setStatus(status: WorkflowTaskStatus) {
    this.status.value = status;
  }

  /**
   * @name start
   * @description Start the task
   * @returns [TaskExecutionError | TaskIsAbortedError | TaskIsRunningError | null, unknown | null]
   *
   */
  start(payload: unknown, options?: { [key: string]: unknown }) {
    const tuple: [TaskExecutionError | TaskIsAbortedError | TaskIsRunningError | null, unknown | null] = [null, null];
    const timeout = this.timeout > 0 ? this.timeout : undefined;
    let timer: NodeJS.Timeout;

    if (this.status.value === 'running') {
      console.warn('Task is already running: ', this.id);
      tuple[0] = new TaskIsRunningError(this.id);
      tuple[1] = null;
      return Promise.resolve(tuple);
    }

    this.status.value = 'running';
    this.abortCtrl = new AbortController();

    return new Promise<typeof tuple>((resolve) => {
      const abortCallback = () => {
        tuple[0] = new TaskIsAbortedError(this.id);
        tuple[1] = null;
        clearTimeout(timer);
        return resolve(tuple);
      };

      this.abortCtrl?.signal.addEventListener('abort', abortCallback, { once: true });

      if (timeout) {
        timer = setTimeout(() => {
          this.stop();
        }, timeout);
      }

      Promise
        .resolve(() => {
          if (this.abortCtrl?.signal.aborted) {
            throw new TaskIsAbortedError(this.id);
          }
        })
        .then(async () => {
          const scriptContents = await fs.promises.readFile(this.scriptPath, 'utf-8');
          // prevent escaping from sandbox
          const isolatedContext = Object.create(null);
          const $console = options?.$console as WorkflowBridgeConsole ?? {};

          Object.assign(isolatedContext, {
            ...(options ?? {}),
            $taskId: this.id,
            $content: payload,
            $timeout: timeout,
            $abortCtrl: this.abortCtrl,
            console: new Proxy($console, {
              get: (target, prop: string) => {
                return (...args: unknown[]) => {
                  target?.[prop as keyof WorkflowBridgeConsole]?.(this.id, ...args);
                };
              },
            }),
          });

          // micro tasks run immediately after the script has been evaluated
          const result = vm.runInNewContext(
            scriptContents,
            vm.createContext(isolatedContext),
            { timeout, microtaskMode: 'afterEvaluate', filename: 'index.js' }
          );

          return typeof result === 'function' ? result() : result;
        })
        .then((moduleResults: unknown) => {
          if (this.abortCtrl?.signal.aborted) {
            throw new TaskIsAbortedError(this.id);
          }
          this.status.value = 'success';
          tuple[0] = null;
          tuple[1] = moduleResults;

          resolve(tuple);
        })
        .catch((err: unknown) => {
          if (err instanceof TaskIsAbortedError) {
            this.status.value = 'idle';
            tuple[0] = err;
          } else {
            this.status.value = 'failed';
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
      if (this.status.value !== 'running') {
        console.warn('Task is not running: ', this.id);
        return resolve(new TaskIsNotRunningError(this.id));
      }
      const abortCallback = () => {
        this.status.value = 'idle';
        resolve(null);
      };

      this.abortCtrl?.signal.addEventListener('abort', abortCallback, { once: true });
      this.abortCtrl?.abort();
    });
  }

  async reset() {
    if (this.isRunning) {
      await this.stop();
    }
    this.setStatus('idle');
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