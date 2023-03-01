type execFunc = (...args: unknown[]) => Promise<unknown>;
type cbFunc = (...args: unknown[]) => void;
type errorFunc = (err: Error) => void;

export class NodeTask {
  private readonly fn: execFunc;
  private readonly cbfn?: cbFunc;
  private readonly errfn?: errorFunc;

  constructor(fn: execFunc, options?: { onSuccess?: cbFunc, onError?: errorFunc }) {
    this.fn = fn;
    this.cbfn = options?.onSuccess;
    this.errfn = options?.onError;
  }

  public run(...args: unknown[]) {
    return this.fn(...args);
  }

  public callback(content: unknown) {
    this.cbfn?.(content);
  }

  public error(err: Error) {
    this.errfn?.(err);
  }
}

/**
 * @name NodeTaskQueue
 * @description [node async task queue class with concurrency control]
 * @param {number} concurrency [concurrency]
 */
export class NodeTaskQueue {
  private readonly concurrency: number;
  private readonly queue: NodeTask[];
  private readonly running: NodeTask[];

  constructor(concurrency: number) {
    this.concurrency = concurrency;
    this.queue = [];
    this.running = [];
  }

  public add(task: NodeTask) {
    this.queue.push(task);
    this.next();
  }

  private next() {
    while (this.running.length < this.concurrency && this.queue.length) {
      const task = this.queue.shift();
      if (task) {
        this.running.push(task);
        task
          .run()
          .then((content: unknown) => {
            task.callback(content);
            this.running.splice(this.running.indexOf(task), 1);
            this.next();
          })
          .catch((err) => {
            task.error(err);
            this.running.splice(this.running.indexOf(task), 1);
            this.next();
          });
      }
    }
  }
}
