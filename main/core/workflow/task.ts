import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { Workflow } from './base';
import { WorkflowTaskOptions, WorkflowTaskStatus, WorkflowTaskType } from './types';

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

  async start() {
    console.log('start');
  }

  async stop() {
    console.log('stop');
  }
}
