import electronIsDev from "electron-is-dev";
import { EventEmitter } from "events";
import os from 'os';
import { BrowserWindow } from "electron";

import { i18n } from '../electron';
import logger, { info, warning } from "../logs";

import { SocketTransfer } from './socket-transfer';
import { SSClient, SSRClient } from "./client";
import pickPorts from "./helpers/port-picker";
import { Proxy } from "./proxy";
import randomPicker from "./helpers/random-picker";
import { Target } from "./LoadBalancer/types";
import { Config, Settings, ServiceResult } from "../types/extention";
import { ALGORITHM } from "./LoadBalancer";
import {
  StartClientInterceptor, StartClusterInterceptor,
  Interceptor,
} from "./helpers/interceptor";

const platform = os.platform();
const startClientStep = new StartClientInterceptor();
const startClusterStep = new StartClusterInterceptor();

export class Manager {
  static mode: 'single' | 'cluster' = 'single'; // running mode
  static proxy: Proxy | null; // proxy
  static ssLocal: SSRClient | SSClient | null; // single mode client
  static pool: (SSRClient | SSClient)[] = []; // cluster clients pool
  static socketTransfer: SocketTransfer | null; // cluster tcp gateway
  static clusterConfig: Config[]; // cluster server configs
  static event: EventEmitter = new EventEmitter(); // event center
  static deadMap: { [key: string]: number } = {}; // dead client records
  static heartbeat: number = 15e3;
  static trafficTimer: NodeJS.Timer;

  static syncConnected(connected: boolean) {
    Manager.event.emit('manager:server-status', {
      status: connected,
      mode: Manager.mode
    });
    if ((global as any)?.win?.webContents) {
      (global as any).win.webContents.send("connected", {
        status: connected,
        mode: Manager.mode
      });
    }
  }

  static syncTraffic() {
    if (
      !(global as any)?.win?.webContents
      || !((global as any).win as BrowserWindow).isVisible()
      || !Manager.socketTransfer
    ) {
      return;
    }
    (global as any)?.win.webContents.send("traffic", {
      traffic: Manager.socketTransfer.bytesTransfer
    });
  }

  /**
   * @name healCluster heal unhealthy cluster nodes
   * @param targets ports group that need to be healed
   * @returns Promise<void>
   *
   * total steps:
   *  - get healthy/unhealthy cluster nodes
   *  - set healthy cluster nodes to pool / socket transfer
   *  - disconnect unhealthy cluster nodes
   *  - recreate some nodes from configs
   *  - connect those nodes
   *  - put connected new nodes socket into socket-transfer and pool, failed nodes only put into pool
   */
  static async healCluster(targets: Target[]) {
    const abnormalPorts: (number | string)[] = [];
    const abnormalClients: (SSRClient | SSClient)[] = [];
    const normalClients: (SSRClient | SSClient)[] = [];

    targets.forEach(target => {
      if (Manager.deadMap[target.confId as string] !== undefined) {
        // when healed over than 3 times, make it be dead, reduce system resources.
        Manager.deadMap[target.confId as string] += 1;
      } else {
        Manager.deadMap[target.confId as string] = 1;
      }
      abnormalPorts.push(target.id)
    });

    /* get healthy/unhealthy cluster nodes */
    Manager.pool.forEach(client => {
      if (abnormalPorts.includes(client.settings.localPort)) {
        return abnormalClients.push(client);
      }
      if (!client.connected) {
        abnormalPorts.push(client.settings.localPort);
        return abnormalClients.push(client);
      }
      normalClients.push(client);
    });

    warning.bold(
      '>> abnormal clients that need to heal: ',
      abnormalClients.map(client => client.settings.localPort)
    );

    info.underline(
      `>> ${normalClients.length} normal clients: `,
      normalClients.map(client => client.settings.localPort)
    );

    warning('>> dead client map: ', JSON.stringify(Manager.deadMap, null, 2));

    if (!abnormalClients.length) return;

    /* set healthy cluster nodes to pool / socket transfer */
    Manager.pool = normalClients;
    Manager.socketTransfer?.setTargetsWithFilter((target) => {
      return !abnormalPorts.includes(target.id);
    });

    /* disconnect unhealthy cluster nodes */
    return Promise
      .all(abnormalClients.map(client => client.disconnect()))
      .then((results) => {
        const pendingClients: (SSRClient | SSClient)[] = [];
        results.forEach((result, i) => {
          if (result.code === 200) {
            pendingClients.push(abnormalClients[i]);
          } else {
            Manager.pool.push(abnormalClients[i]);
            Manager.socketTransfer?.pushTargets([
              {
                id: abnormalClients[i].settings.localPort,
                confId: abnormalClients[i].config.id
              }
            ]);
          }
        });

        if (!pendingClients.length)
          throw new Error('Healer: No pending clients');

        return pendingClients;
      })
      /* recreate some nodes from configs */
      .then((pendingClients: (SSRClient | SSClient)[]) => {
        info.underline(
          '>> pending clients: ',
          pendingClients.map(client => `${client.config.serverHost}:${client.config.serverPort}`)
        );
        const filterIds = [
          ...pendingClients.map(client => client.config.id),
          ...Manager.pool.map(client => client.config.id)
        ];

        return Promise.all(
          randomPicker(
            Manager.clusterConfig.filter(conf => !filterIds.includes(conf.id)),
            pendingClients.length
          )
            .map((config, i) => {
              info.underline('>> healer pick: ', `${config.serverHost}:${config.serverPort}`);
              return Manager.spawnClient(
                config,
                pendingClients[i].settings
              );
            })
        );
      })
      /* connect those nodes */
      .then(async (results) => {
        const failedClients: (SSRClient | SSClient)[] = [];
        const createdClients = results
          .filter(rsp => {
            if (rsp.code === 200) {
              return true;
            } else {
              failedClients.push(rsp.result as (SSRClient | SSClient))
              return false;
            }
          })
          .map(rsp => rsp.result as (SSRClient | SSClient));
        const cons = await Promise.all(createdClients.map(client => client.connect()));
        let hasSuccess = 0;

        info.underline(
          '>> reconnected clients: ',
          createdClients.map(client => `${client.config.serverHost}:${client.config.serverPort}`)
        );

        /* push connected new nodes to pool / socket transfer */
        Manager.pool.push(...failedClients);
        cons.forEach((c, i) => {
          Manager.pool.push(createdClients[i]);
          if (c.code === 200 && c.result?.port) {
            Manager.socketTransfer?.pushTargets([
              {
                id: createdClients[i].settings.localPort,
                confId: createdClients[i].config.id
              }
            ]);
            hasSuccess += 1;
          } else {
            createdClients[i].connected = false;
          }
        });

        if (!Manager.pool.length) {
          Manager.syncConnected(false);
          throw new Error('Warning: Pool is empty')
        }

        if (!hasSuccess) {
          throw new Error('Cluster heal failed');
        }

        info.underline(`>> Cluster heal ${hasSuccess} nodes!`);
        info.underline(`>> Pool now have ${Manager.pool.length} nodes.`);
      })
      .catch(err => {
        warning(err?.message);
      });
  }

  static async spawnClient(config: Config, settings: Settings): Promise<{ code: number, result: unknown }> {
    if (electronIsDev && Manager.mode === 'single') console.log(config);

    return new Promise(resolve => {
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
          result: `${i18n.__('unknown_shadowsocks_client_type')} ${config.type}`
        });
      }
    });
  }

  static async kill(client: SSRClient | SSClient | null) {
    if (!client) return Promise.resolve();

    Manager.ssLocal = null;
    await client.disconnect()?.then(
      () => {
        logger.info(`>> Killed ${Manager.ssLocal?.type || 'ss'}-local`);
      },
      () => {
        logger.info(`>> Killed ${Manager.ssLocal?.type || 'ss'}-local failed`);
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
      settings.localPort,
      settings.pacPort,
      settings.mode
    );
    try {
      await Manager.proxy?.start();
    } catch (error) {
      logger.error(`>> Enable desktop proxy error: ${error}`);
    }
  }

  static async disableProxy() {
    try {
      await Manager.proxy?.stop();
    } catch (error) {
      logger.error(`>> Disable desktop proxy error: ${error}`);
    }
    Manager.proxy = null;
  }

  /**
  * @name startClient start single client mode
  * @param config ss/ssr config
  * @param settings global settings
  * @returns Promise<ServiceResult>
  *
  * total steps:
  *  - change mode to single
  *  - enable proxy
  *  - create client
  *  - connect client
  *  - init socket transfer
  *  - sync status
  */
  static startClient = Interceptor.useAsyncSeries(
    /* worker */
    async (config: Config, settings: Settings): Promise<ServiceResult> => {
      return Promise.resolve()
        .then(async () => {
          const ports = await pickPorts(
            settings.localPort + 1, 1,
            [settings.pacPort, settings.httpProxy.port]
          );
          if (!ports.length) {
            throw new Error(i18n.__('no_available_ports'));
          }
          return ports[0];
        })
        /* create client */
        .then((port: number) => Manager.spawnClient(config, { ...settings, localPort: port }))
        /* connect client */
        .then(async (rsp) => {
          if (rsp.code !== 200) {
            throw new Error(rsp.result as string);
          }
          Manager.ssLocal = rsp.result as (SSRClient | SSClient);
          return (rsp.result as (SSRClient | SSClient)).connect();
        })
        /* init socket transfer */
        /* sync status */
        .then(async (rsp) => {
          if (rsp.code !== 200) {
            throw new Error(i18n.__('server_connect_failed'));
          }
          Manager.socketTransfer = new SocketTransfer({
            port: settings.localPort,
            strategy: ALGORITHM.POLLING,
            targets: [{
              id: (Manager.ssLocal as (SSClient | SSRClient)).settings.localPort,
              confId: (Manager.ssLocal as (SSClient | SSRClient)).config.id
            }],
            heartbeat: [10e3, 15e3, 30e3, 60e3, 60e3 * 3, 60e3 * 5]
          });
          Manager.socketTransfer.on('health:check:failed', (targets: Target[]) => {
            warning.underline('health:check:failed >>', targets[0].id);
          });

          await Manager.socketTransfer.listen();
          Manager.syncConnected(!!Manager.ssLocal?.connected);

          clearInterval(Manager.trafficTimer);
          Manager.trafficTimer = setInterval(Manager.syncTraffic, Manager.heartbeat);
          Manager.syncTraffic();

          return {
            code: 200,
            result: 'success'
          };
        });
    },
    /* interceptors */
    [startClientStep],
    /* fallback */
    (err) => {
      warning(err);
      Manager.disableProxy();
      Manager.syncConnected(false);
    }
  )

  static async stopClient() {
    await Manager.kill(Manager.ssLocal);
    await Manager.disableProxy();
    if (Manager.socketTransfer) {
      await Manager.socketTransfer?.stop();
    }
    Manager.socketTransfer = null;
    clearInterval(Manager.trafficTimer);
    Manager.syncConnected(!!Manager.ssLocal?.connected);
  }

  /**
   * @name startCluster start cluster mode
   * @param configs subscription group
   * @param settings global settings
   * @returns Promise<ServiceResult>
   *
   * total steps:
   *  - change mode to cluster
   *  - enable proxy
   *  - pick clients
   *  - connect clients and init socket transfer
   *  - sync status
   */
  static startCluster = Interceptor.useAsyncSeries(
    /* worker */
    async (configs: Config[], settings: Settings): Promise<ServiceResult> => {
      return new Promise(resolve => {
        return Promise.resolve()
          /* pick clients */
          .then(async () => {
            if (!configs.length) {
              throw new Error(i18n.__('no_server_configs_found'));
            }

            Manager.clusterConfig = configs;
            const ports = await pickPorts(
              settings.localPort + 1, settings.loadBalance.count,
              [settings.pacPort, settings.httpProxy.port]
            );

            return Promise.all(
              randomPicker(configs, ports.length)
                .map((config, i) => {
                  info.underline('>> pick: ', config.remark);
                  return Manager.spawnClient(
                    config,
                    { ...settings, localPort: ports[i] }
                  );
                })
            );
          })
          /* connect clients */
          /* init socket transfer */
          .then(async (results) => {
            Manager.pool =
              results
                .filter(results => results.code === 200)
                .map(rsp => rsp.result as (SSRClient | SSClient));

            if (!Manager.pool.length) {
              throw new Error(i18n.__('connections_pool_is_empty_tips'))
            }

            const cons = await Promise.all(Manager.pool.map(client => client.connect()));
            const targets: { id: number, confId: string }[] = [];

            cons.forEach((con, i) => {
              if (con.code === 200 && con.result?.port) {
                targets.push({
                  id: con.result?.port,
                  confId: Manager.pool[i].config.id
                });
              }
            });

            if (!targets.length) {
              throw new Error(i18n.__('cluster_connect_failed'));
            }

            Manager.socketTransfer = new SocketTransfer({
              port: settings.localPort,
              strategy: settings.loadBalance.strategy,
              targets,
              heartbeat: [10e3, 15e3, 30e3, 60e3, 60e3 * 3, 60e3 * 5],
            });

            Manager.socketTransfer.on('health:check:failed', Manager.healCluster);

            await Manager.socketTransfer.listen();
          })
          /* sync status */
          .then(() => {
            Manager.syncConnected(true);
            clearInterval(Manager.trafficTimer);
            Manager.trafficTimer = setInterval(Manager.syncTraffic, Manager.heartbeat);
            Manager.syncTraffic();
          })
          .then(() => {
            resolve({
              code: 200,
              result: Manager.pool.map(client => client.port)
            });
          })
      });
    },
    /* interceptors */
    [startClusterStep],
    /* fallback */
    (err) => {
      warning(err);
      Manager.syncConnected(false);
      Manager.disableProxy();
    }
  )

  static stopCluster(): Promise<ServiceResult> {
    return new Promise(resolve => {
      if (Manager?.socketTransfer) {
        Manager.socketTransfer.off('health:check:failed', Manager.healCluster)
      }

      Promise
        .all(Manager.pool.map(client => Manager.kill(client)))
        .then(async () => {
          Manager.pool = [];
          if (Manager.socketTransfer) {
            await Manager.socketTransfer?.stop();
          }
          Manager.socketTransfer = null;
          Manager.clusterConfig = [];
          Manager.deadMap = {};
          clearInterval(Manager.trafficTimer);
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
