import { type AbortController } from 'node-abort-controller';
export type WorkflowTaskType = 'puppeteer-source' | 'crawler-source' | 'node-source' | 'processor-pipe' | 'effect-pipe';
export type WorkflowTaskStatus = 'idle' | 'running' | 'success' | 'failed';
export type WorkflowRunnerStatus = 'idle' | 'running' | 'success' | 'failed';
export type WorkflowManagerStatus = 'uninitialized' | 'initialized' | 'unloaded';
export type WorkflowTaskTimerType = 'schedule' | 'timer';

export interface LoadBrowserPageContext {
  $timeout?: number;
  $abortCtrl: AbortController;
}

export type CronTableObject = {
  seconds?: number;
  minutes?: number;
  hours?: number;
  date?: number;
  month?: number;
  day?: number;
};

export interface WorkflowTaskTimer {
  enable: boolean;
  schedule?: string; // time schedule, unix cron format, such as '1 * * * * *'
}

export interface WorkflowTaskOptions {
  id: string;
  type: WorkflowTaskType;
  status: WorkflowTaskStatus;
  script: string;
  timeout: number;
}

export interface WorkflowRunnerOptions {
  id: string;
  enable: boolean;
  ctime: number;
  status: WorkflowRunnerStatus;
  timer: WorkflowTaskTimer;
  tasks: string[];
}

export class RunnerNotFoundError extends Error {
  constructor(id: string) {
    super(`Workflow Runner ${id} not found.`);
    this.name = 'RunnerNotFoundError';
  }
}

export class RunnerIsRunningError extends Error {
  constructor(id: string) {
    super(`Workflow Runner ${id} is already running.`);
    this.name = 'RunnerIsRunningError';
  }
}

export class RunnerCreateError extends Error {
  constructor() {
    super(`Workflow Runner create failed.`);
    this.name = 'RunnerCreateError';
  }
}

export class TaskNotFoundError extends Error {
  constructor(taskId: string) {
    super(`Workflow Task ${taskId} not found.`);
    this.name = 'TaskNotFoundError';
  }
}

export class TaskIsRunningError extends Error {
  constructor(taskId: string) {
    super(`Workflow Task ${taskId} is already running.`);
    this.name = 'TaskIsRunningError';
  }
}

export class TaskIsNotRunningError extends Error {
  constructor(taskId: string) {
    super(`Workflow Task ${taskId} is not running.`);
    this.name = 'TaskIsNotRunningError';
  }
}

export class TaskIsAbortedError extends Error {
  constructor(taskId: string) {
    super(`Workflow Task ${taskId} is aborted.`);
    this.name = 'TaskIsAbortedError';
  }
}

export class TaskExecutionError extends Error {
  constructor(taskId: string, message: string) {
    super(`Workflow Task ${taskId} execution error: ${message}`);
    this.name = 'TaskExecutionError';
  }
}
