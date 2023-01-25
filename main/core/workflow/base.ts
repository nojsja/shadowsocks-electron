
import EventEmitter from 'events';
import {
  workflowRootDir,
  workflowTaskDir,
} from '../../config';

export class Workflow extends EventEmitter {
  public readonly rootDir = workflowRootDir;
  public readonly taskDir = workflowTaskDir;
  public static readonly rootDir = workflowRootDir;
  public static readonly taskDir = workflowTaskDir;
}
