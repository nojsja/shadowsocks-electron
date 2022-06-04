import electronIsDev from "electron-is-dev";
import { EventEmitter } from "events";

import { Config, Settings } from "../types/extention";
import logger from "../logs";

import checkPortInUse from "./helpers/port-checker";
import { SocketTransfer } from './socket-transfer';
import { SSClient, SSRClient } from "./client";
import { ALGORITHM } from "./LoadBalancer";
import pickPorts from "./helpers/port-picker";

export class Manager extends EventEmitter {
  static mode: 'single' | 'cluster' = 'single';
  static ssLocal: SSRClient | SSClient | null;
  static ssLoadBalancer: SSRClient | SSClient | null;
  static pool: (SSRClient | SSClient)[] = []
  static socketTransfer: SocketTransfer | null

  static async spawnClient(config: Config, settings: Settings): Promise<{ code: number, result: any }> {
    if (electronIsDev) console.log(config);

    return new Promise(resolve => {
      checkPortInUse([settings.localPort], '127.0.0.1')
        .then(results => {
          if (results[0]?.isInUse) {
            return resolve({
              code: 600,
              result: results[0]
            });
          }
          if (config.type === 'ssr') {
            resolve({
              code: 200,
              result: new SSRClient(settings, config)
            });
          } else if (config.type === 'ss') {
            resolve({
              code: 200,
              result: new SSClient(settings, config)
            });
          } else {
            resolve({
              code: 600,
              result: `Unknown shadowsocks client type: ${config.type}`
            });
          }
        });
    });
  }

  static async kill(client: SSRClient | SSClient | null) {
    if (!client) return Promise.resolve();

    Manager.ssLocal = null;
    await client.disconnect()?.then(
      () => {
        logger.info(`Killed ${Manager.ssLocal?.type || 'ss'}-local`);
      },
      () => {
        logger.info(`Killed ${Manager.ssLocal?.type || 'ss'}-local failed`);
      }
    );
  };

  static isConnected() {
    if (Manager.mode === 'single') {
      return !!Manager.ssLocal?.connected;
    }
    return Manager.pool.find(client => client.connected);
  }

  static async changeMode(mode: 'single' | 'cluster') {
    if (Manager.mode === 'single') {
      if (Manager.ssLocal) {
        await Manager.kill(Manager.ssLocal);
        await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      }
      await Manager.stopClient();
    } else {
      await Manager.stopCluster();
    }

    if (Manager.pool.length) {
      await Manager.stopCluster();
    }

    if (Manager.ssLocal) {
      await Manager.stopClient();
    }

    if (Manager.socketTransfer) {
      await Manager.socketTransfer.stop();
    }

    Manager.mode = mode;
  }

  static async startClient(config: Config, settings: Settings): Promise<{ code: number, result: any }> {
    return this.changeMode('single')
      .then(() => Manager.spawnClient(config, settings))
      .then(rsp => {
        if (rsp.code === 200) {
          Manager.ssLocal = rsp.result;
          return (rsp.result as (SSRClient | SSClient)).connect();
        } else {
          return rsp;
        }
      });
  }

  static async stopClient() {
    await Manager.kill(Manager.ssLocal);
  }

  static startCluster(configs: Config[], settings: Settings): Promise<{ code: number, result: any }> {
    return new Promise(resolve => {
      Manager
        .changeMode('cluster')
        .then(() => {
          if (!configs.length) {
            throw new Error('No server configs found');
          }
          return pickPorts(
            settings.localPort + 1, 3,
            [settings.pacPort, settings.httpProxy.port]
          ).then(ports => {
            return Promise
              .all(
                configs
                  .filter((config, i) => {
                    return i < ports.length;
                  })
                  .map((config, i) => {
                    return Manager.spawnClient(
                      config,
                      { ...settings, localPort: ports[i] }
                    );
                  })
              );
          });
        })
        .then(async (results) => {
          Manager.pool =
            results
              .filter(results => results.code === 200)
              .map(rsp => rsp.result as (SSRClient | SSClient));

          if (!Manager.pool.length) {
            throw new Error('Pool is empty')
          }

          const cons = await Promise.all(Manager.pool.map(client => client.connect()));
          const successPorts = cons.filter(c => (c.code === 200 && c.result?.port)).map(c => c.result?.port);
          if (!successPorts.length) {
            throw new Error('Cluster connect failed');
          }

          Manager.socketTransfer = new SocketTransfer({
            port: settings.localPort,
            strategy: ALGORITHM.POLLING,
            targets: successPorts.map(port => ({ id: port })),
          });

          await Manager.socketTransfer.listen();
        })
        .then(() => {
          resolve({
            code: 200,
            result: Manager.pool.map(client => client.port)
          });
        })
        .catch(err => {
          console.error(err);
          resolve({
            code: 500,
            result: err?.toString()
          });
        });
    });
  }

  static stopCluster(): Promise<{ code: number, result: any }> {
    return new Promise(resolve => {
      Promise
        .all(Manager.pool.map(client => Manager.kill(client)))
        .then(async () => {
          Manager.pool = [];
          await Manager.socketTransfer?.stop();
          Manager.socketTransfer = null;
        })
        .then(() => {
          resolve({
            code: 200,
            result: ''
          });
        })
        .catch(error => {
          resolve({
            code: 500,
            result: error?.toString()
          })
        });
    })
  }

}
