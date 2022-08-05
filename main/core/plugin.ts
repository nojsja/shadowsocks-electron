import { ChildProcess, fork } from "child_process";
import { EventEmitter } from "events";
import fs from 'fs';

import { DefinedPluginProps } from "../types/extention";
import { debounce } from "../utils/utils";

export class DefinedPlugin extends EventEmitter {
  status: "running" | "stopped" | "error" = "stopped";
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
    this.path = path;
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
  }

  private onExited = async () => {
    this.status = 'stopped';
    this.emit('exited');
  }

  stop = () => {
    try {
      this.child?.kill();
    } catch (error) {
      console.error(`DefinedPlugin: failed to stop ${this.name}. ${error}`);
    }
  }

  start = () => {
    fs
      .promises
      .stat(this.path)
      .then((stat) => {
        if (stat.isFile()) {
          this.child = fork(this.path, this.args.split(" "));
          this.status = 'running';
          this.handleEvents();
        } else {
          throw new Error(`DefinedPlugin: ${this.path} is not a executable file.`);
        }
      })
      .catch((error) => {
        this.onError(error);
      });
  }

}