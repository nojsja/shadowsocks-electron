import fs from 'fs';
import { NodeTaskQueue, NodeTask } from '@renderer/utils/task-queue';

const taskQueue = new NodeTaskQueue(4);

export default (filePath: string) => {

  const read = () => {
    return new Promise<string>((resolve, reject) => {
      const task = new NodeTask(() => fs.promises.readFile(filePath, 'utf-8'), {
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

  const write = (content: string) => {
    return new Promise<void>((resolve, reject) => {
      const task = new NodeTask(() => fs.promises.writeFile(filePath, content, 'utf-8'), {
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
