
import EventEmitter from 'events';

import {
  workflowRootDir,
  workflowTaskDir,
} from '@main/config';

export class Workflow extends EventEmitter {
  [key: string]: any;
  public readonly rootDir = workflowRootDir;
  public readonly taskDir = workflowTaskDir;
  public static readonly rootDir = workflowRootDir;
  public static readonly taskDir = workflowTaskDir;
}
