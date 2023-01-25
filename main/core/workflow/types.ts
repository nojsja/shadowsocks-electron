
export type WorkflowTaskType = 'puppeteer-source' | 'node-source' | 'processor-pipe' | 'effect-pipe';
export type WorkflowTaskStatus = 'idle' | 'running' | 'success' | 'failed';
export type WorkflowRunnerStatus = 'idle' | 'running' | 'success' | 'failed';
export type WorkflowManagerStatus = 'uninitialized' | 'initialized' | 'unloaded';
export interface WorkflowTaskTimer {
  enable: boolean;
  interval?: number;
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

