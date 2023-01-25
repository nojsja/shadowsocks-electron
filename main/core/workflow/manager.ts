import fs from 'fs';
import { Workflow } from './base';
import { WorkflowRunner } from './runner';
import { WorkflowManagerStatus, WorkflowTaskOptions } from './types';

export class WorkflowManager extends Workflow {
  constructor() {
    super();
    this.runners = [];
    this.runnerIds = [];
    this.status = 'uninitialized';
  }

  runners: WorkflowRunner[];
  runnerIds: string[];
  status: WorkflowManagerStatus;

  async bootstrap() {
    try {
      const contents = await fs.promises.readdir(this.rootDir);
      const runnerFiles = contents.filter((content) => content.endsWith('.workflow.json'));
      this.runnerIds = runnerFiles.map((runnerFile) => runnerFile.replace('.workflow.json', ''));
    } catch (error) {
      console.error(error);
      return false;
    }
    return true;
  }

  async init() {
    const failedTasks: string[] = [];

    this.status = 'initialized';
    this.runnerIds.forEach(async (id) => {
      const runner = await WorkflowRunner.from(id);
      if (runner) {
        this.runners.push(runner);
      } else {
        failedTasks.push(id);
      }
    });

    // [suceed, failedTasks]
    return [!!failedTasks.length, failedTasks];
  }

  async generateTaskOfRunner(task: Partial<WorkflowTaskOptions>, runnerId?: string) {
    let targetRunner: WorkflowRunner | null;

    if (runnerId) {
      targetRunner = this.runners.find((runner) => runner.id === runnerId) || null;
      if (!targetRunner) return false;
    } else {
      targetRunner = await WorkflowRunner.generate();
      if (!targetRunner) return false;
      this.runners.push(targetRunner);
    }

    const newTask = await targetRunner.pushTask(task);

    return newTask || false;
  }

  async removeTaskOfRunner(taskId: string, runnerId: string) {
    const targetRunner = this.runners.find((runner) => runner.id === runnerId);

    if (!targetRunner) return false;
    const removed = await targetRunner.removeTask(taskId);

    return removed;
  }

  async unload() {
    this.status = 'unloaded';
    this.runners.forEach((runner) => {
      runner.stop();
    });
    this.runners = [];
    this.runnerIds = [];
  }

}
