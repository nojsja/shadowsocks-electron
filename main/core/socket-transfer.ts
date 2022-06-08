import net from 'net';
import { EventEmitter } from 'events';

import LoadBalancer, { ALGORITHM } from './LoadBalancer';
import shadowChecker from './helpers/shadow-checker';
import { Target } from './LoadBalancer/types';
import { info } from '../logs';

export interface SocketTransferOptions {
  port?: number;
  strategy?: ALGORITHM;
  targets: Target[];
  heartbeat?: number;
}

export class SocketTransfer extends EventEmitter {
  public bytesTransfer = 0;
  private port: number;
  private targets: Target[];
  private timer: NodeJS.Timeout;
  private server: net.Server;
  private lb: LoadBalancer;
  private strategy: ALGORITHM
  private heartbeat: number

  constructor(options: SocketTransferOptions) {
    super();
    this.heartbeat = options.heartbeat || 60e3*5; // 5min
    this.port = options.port || 1080;
    this.server = this.init();
    this.server.on('error', this.onError);
    this.targets = options.targets;
    this.strategy = options.strategy || ALGORITHM.POLLING;
    this.lb = new LoadBalancer({
      algorithm: this.strategy,
      targets: this.targets,
    });
    this.timer = setInterval(this.healthCheck, this.heartbeat);
  }

  private init() {
    return net.createServer((c) => {
      const target = this.lb.pickOne();

      console.log('pick target -> ', target.id);

      if (!target || !target.id) {
        this.onLoadBalancerError(new Error('no available target!'));
        return c.end('socket transfer not ready!');
      }

      c.on('end', () => {
        this.bytesTransfer += (c.bytesRead + c.bytesWritten);
      });
      c.on('error', this.onLocalError);

      const remote = net.createConnection({ port: +target.id }, () => {
        c.pipe(remote);
        remote.pipe(c);
      });

      remote.on('error', (error) => this.onRemoteError(error, +target.id));

    });
  }

  private onLoadBalancerError = (error: Error) => {
    console.error('loadbalancer-error:', error);
    this.emit('error:loadbalancer', { error });
  }

  private onLocalError = (error: Error) => {
    console.error('local-error:', error);
    this.emit('error:server:local', { error });
  }

  private onRemoteError = (error: Error, port: number) => {
    console.error('remote-error:', error, port);
    this.emit('error:server:remote', {
      error,
      port
    });
  }

  private healthCheck = () => {
    if (this.targets.length === 0) return;
    Promise
      .all(this.targets.map(target => shadowChecker('127.0.0.1', target.id as number)))
      .then(results => {
        info('>> health check results:', results);
        const failed: Target[] = [];
        results.forEach((pass, i) => {
          if (!pass) {
            failed.push(this.targets[i]);
          }
        });
        if (failed.length) {
          this.emit('health:check:failed', failed);
        }
      })
      .catch(error => {
        console.error('healthCheck:', error);
        this.emit('error:health:heck', { error });
      });
  }

  private onError = (error: Error) => {
    console.error('server-error:', error);
    this.emit('error:socket:transfer', { error });
  }

  public stopHealthCheck() {
    clearInterval(this.timer);
  }

  public listen = (port?: number) => {
    if (port) this.port = port;

    return new Promise((resolve => {
      this.server.listen(this.port, () => {
        resolve(port);
        info('SocketTransfer listening on port', this.port);
      });
    }));
  }

  public unlisten = async () => {
    return new Promise<Error | void>(resolve => {
      if (!this.server) return resolve();
      this.server.close((error) => {
        resolve(error);
      });
      setTimeout(() => {
        resolve(new Error('unlisten timeout'));
      }, 500);
    });
  }

  public stop = async () => {
    this.stopHealthCheck();
    await this.unlisten();
  }

  public pushTargets = (targets: Target[]) => {
    this.targets.push(...targets);
    this.lb.setTargets(this.targets);
  }

  public setTargets = (targets: Target[]) => {
    this.targets = targets;
    this.lb.setTargets(targets);
  }

  public setTargetsWithFilter = (filter: (targets: Target) => boolean) => {
    this.targets = this.targets.filter(filter);
    this.setTargets(this.targets)
  }

  public getTargets = () => {
    return [...this.targets];
  }
}
