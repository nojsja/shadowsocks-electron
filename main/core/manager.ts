import electronIsDev from "electron-is-dev";
import { EventEmitter } from "events";
import os from 'os';

import { Config, Settings } from "../types/extention";
import logger from "../logs";

import checkPortInUse from "./helpers/port-checker";
import { SocketTransfer } from './socket-transfer';
import { SSClient, SSRClient } from "./client";
import { ALGORITHM } from "./LoadBalancer";
import pickPorts from "./helpers/port-picker";
import { Proxy } from "./proxy";

const platform = os.platform();

export class Manager extends EventEmitter {
  static mode: 'single' | 'cluster' = 'single';
  static proxy: Proxy | null
  static ssLocal: SSRClient | SSClient | null;
  static ssLoadBalancer: SSRClient | SSClient | null;
  static pool: (SSRClient | SSClient)[] = []
  static socketTransfer: SocketTransfer | null

  static async syncConnected(connected: boolean) {
    (global as any)?.win.webContents.send("connected", {
      status: connected,
      mode: Manager.mode
    });
  }

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
    if (Manager.ssLocal) {
      await Manager.kill(Manager.ssLocal);
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
    }

    if (Manager.pool.length) {
      await Manager.stopCluster();
    }

    if (Manager.socketTransfer) {
      await Manager.socketTransfer.stop();
    }

    if (Manager.proxy) {
      await Manager.disableProxy();
    }

    Manager.mode = mode;
  }

  static async enableProxy(settings: Settings) {
    Manager.proxy = Proxy.createProxy(
      platform,
      platform === 'win32' ? settings.httpProxy.port : settings.localPort,
      settings.pacPort,
      settings.mode
    );
    await Manager.proxy?.start();
  }

  static async disableProxy() {
    await Manager.proxy?.stop();
    Manager.proxy = null;
  }

   /**
   * @name startClient start single client mode
   * @param config ss/ssr config
   * @param settings global settings
   * @returns Promise<{ code: number, result: any }>
   *
   * total steps:
   *  - change mode to single
   *  - enable proxy
   *  - create client
   *  - connect client
   *  - sync status
   */
  static async startClient(config: Config, settings: Settings): Promise<{ code: number, result: any }> {
    /* change mode to single */
    return this.changeMode('single')
      /* enable proxy */
      .then(async () => {
        await Manager.enableProxy(settings);
      })
      /* create client */
      .then(() => Manager.spawnClient(config, settings))
      /* connect client */
      .then(rsp => {
        if (rsp.code === 200) {
          Manager.ssLocal = rsp.result;
          return (rsp.result as (SSRClient | SSClient)).connect();
        } else {
          return rsp;
        }
      })
      /* sync status */
      .then(rsp => {
        Manager.syncConnected(!!Manager.ssLocal?.connected);
        return rsp;
      })
      .catch(err => {
        Manager.disableProxy();
        return {
          code: 600,
          result: err?.toString()
        };
      });
  }

  static async stopClient() {
    await Manager.disableProxy();
    await Manager.kill(Manager.ssLocal);
    Manager.syncConnected(!!Manager.ssLocal?.connected);
  }

  /**
   * @name startCluster start cluster mode
   * @param configs subscription group
   * @param settings global settings
   * @returns Promise<{ code: number, result: any }>
   *
   * total steps:
   *  - change mode to cluster
   *  - enable proxy
   *  - select clients
   *  - connect clients and init socket transfer
   *  - sync status
   */
  static startCluster(configs: Config[], settings: Settings): Promise<{ code: number, result: any }> {
    return new Promise(resolve => {
      Manager
        .changeMode('cluster')
        /* enable proxy */
        .then(async () => {
          await Manager.enableProxy(settings);
        })
        /* select clients */
        .then(async () => {
          if (!configs.length) {
            throw new Error('No server configs found');
          }

          const ports = await pickPorts(
            settings.localPort + 1, 3,
            [settings.pacPort, settings.httpProxy.port]
          );

          return Promise.all(
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
        })
        /* connect clients and init socket transfer */
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
        /* sync status */
        .then(() => {
          Manager.syncConnected(true);
        })
        .then(() => {
          resolve({
            code: 200,
            result: Manager.pool.map(client => client.port)
          });
        })
        .catch(err => {
          console.error(err);
          Manager.disableProxy();
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
        .then(async () => {
          await Manager.disableProxy();
        })
        .then(() => {
          Manager.syncConnected(false);
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
