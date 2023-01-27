
export type WorkflowTaskType = 'puppeteer-source' | 'node-source' | 'processor-pipe' | 'effect-pipe';
export type WorkflowTaskStatus = 'idle' | 'running' | 'success' | 'failed';
export type WorkflowRunnerStatus = 'idle' | 'running' | 'success' | 'failed';
export type WorkflowManagerStatus = 'uninitialized' | 'initialized' | 'unloaded';
export type WorkflowTaskTimerType = 'schedule' | 'timer';

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
  type?: WorkflowTaskTimerType;
  interval?: number; // minutes
  schedule?: string; // time schedule, unix cron format, such as '1 * * * * *'
}

export interface WorkflowTaskOptions {
  id: string;
  type: WorkflowTaskType;
  status: WorkflowTaskStatus;
  script: string;
}

export interface WorkflowRunnerOptions {
  id: string;
  enable: boolean;
  status: WorkflowRunnerStatus;
  timer: WorkflowTaskTimer;
  tasks: string[];
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
