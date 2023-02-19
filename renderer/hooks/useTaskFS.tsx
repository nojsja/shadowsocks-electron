import fs from 'fs';
import { NodeTaskQueue, NodeTask } from '@renderer/utils/task-queue';
import { useCallback } from 'react';

const taskQueue = new NodeTaskQueue(4);

export const useTaskFS = (filePath?: string) => {

  const read = useCallback((_filePath?: string) => {
    return new Promise<string>((resolve, reject) => {
      const targetPath = _filePath ?? filePath;
      if (!targetPath) return reject(new Error('No file path provided'));

      const task = new NodeTask(() => fs.promises.readFile(targetPath, 'utf-8'), {
        onSuccess: (content) => {
          resolve(content as string);
        },
        onError: (err) => {
          reject(err);
        },
      });

      taskQueue.add(task);
    });
  }, []);

  const write = useCallback((content: string, _filePath?: string) => {
    return new Promise<void>((resolve, reject) => {
      const targetPath = _filePath ?? filePath;
      if (!targetPath) return reject();

      const task = new NodeTask(() => fs.promises.writeFile(targetPath, content, 'utf-8'), {
        onSuccess: () => {
          resolve();
        },
        onError: () => {
          reject();
        },
      });

      taskQueue.add(task);
    });
  }, []);

  return {
    read,
    write,
  };
};

export default useTaskFS;
