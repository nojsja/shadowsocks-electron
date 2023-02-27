import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { resolve } from 'path';

import { DefinedPluginProps } from '../type';
import logger from '../logs';
import { getPluginsPath } from '../utils';
import { debounce } from './utils';

export class DefinedPlugin extends EventEmitter {
  status: 'running' | 'stopped' | 'error' = 'stopped';
  name: string
  child: ChildProcess | null;
  path: string;
  args: string;
  error: Error | null;
  onDebouncedExited: () => void;
  onDebouncedError: (error: Error) => void;
  constructor({ name, path, args }: DefinedPluginProps) {
    super();
    this.name = name;
    this.error = null;
    this.path = resolve(getPluginsPath(''), path);
    this.args = args;
    this.status = 'stopped';
    this.child = null;
    this.onDebouncedExited = debounce(this.onExited, 600);
    this.onDebouncedError = debounce(this.onError, 600);
  }

  private handleEvents() {
    this.child?.on("error", async (err) => {
      this.onDebouncedError(err);
    });

    this.child?.on("exit", async () => {
      this.onDebouncedExited();
    });
  }

  private onError = (err: Error) => {
    this.status = 'error';
    this.emit('error', err);
    logger.info(`DefinedPlugin error: ${err.message}`);
  }

  private onExited = async () => {
    this.status = 'stopped';
    this.emit('exited');
    logger.info(`DefinedPlugin exited:${this.path}`);
  }

  stop = () => {
    try {
      this.child?.kill();
    } catch (error) {
      logger.error(`DefinedPlugin: failed to stop ${this.name}. ${error}`);
    }
  }

  start = () => {
    this.child = spawn(this.path, this.args.split(' '));
    this.status = 'running';
    logger.info(`DefinedPlugin running: ${this.path}`);
    this.handleEvents();
  }

}