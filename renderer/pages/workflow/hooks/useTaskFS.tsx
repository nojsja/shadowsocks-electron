import fs from 'fs';
import { NodeTaskQueue, NodeTask } from '@renderer/utils/task-queue';

const taskQueue = new NodeTaskQueue(4);

export default (filePath: string) => {

  const read = (_filePath?: string) => {
    return new Promise<string>((resolve, reject) => {
      const task = new NodeTask(() => fs.promises.readFile(_filePath ?? filePath, 'utf-8'), {
        onSuccess: (content) => {
          resolve(content as string);
        },
        onError: (err) => {
          reject(err);
        },
      });
      taskQueue.add(task);
    });
  };

  const write = (content: string, _filePath?: string) => {
    return new Promise<void>((resolve, reject) => {
      const task = new NodeTask(() => fs.promises.writeFile(_filePath ?? filePath, content, 'utf-8'), {
        onSuccess: () => {
          resolve();
        },
        onError: () => {
          reject();
        },
      });
      taskQueue.add(task);
    });
  };

  return {
    read,
    write,
  };
};
