import { IpcMain } from 'electron';
import QRCode from 'qrcode';
import fs from 'fs';

import {
  MainService as MainServiceType,
  Config, Settings, ServiceResult,
  SSRConfig, OneOfConfig
} from '../type';
import { manager, http, pac } from '../core';
import tcpPing from '../core/helpers/tcp-ping';
import { getPathRuntime } from '../config';
import { parseServerGroup, parseSubscription, parseUrl } from '../utils';
import { ProxyURI } from '../core/helpers/proxy-url';
import checkPortInUse from '../core/helpers/port-checker';
import logger, { warning } from '../logs';
import { i18n } from '../electron';
import { PacServer } from '../core/pac';

const { Manager } = manager;
const { HttpProxyServer: HPS } = http;
const { PacServer: PS } = pac;

/* main service handler */
export class MainService implements MainServiceType {
  ipc: IpcMain

  constructor(ipc: IpcMain) {
    this.ipc = ipc;
  }

  async isConnected(): Promise<ServiceResult> {
    return Promise.resolve({
      code: 200,
      result: Manager.isConnected()
    });
  }

  async startClient(params: { config: Config, settings: Settings }): Promise<ServiceResult> {
    return Manager.startClient(params.config, params.settings);
  }

  async stopClient(): Promise<ServiceResult> {
    return new Promise((resolve) => {
      Manager.stopClient()
        .then(() => {
          resolve({
            code: 200,
            result: null
          });
        })
        .catch((error) => {
          resolve({
            code: 500,
            result: error.toString()
          });
        })
    });
  }

  async startCluster(params: { configs: Config[], settings: Settings }): Promise<ServiceResult> {
    return Manager.startCluster(params.configs, params.settings);
  }

  async stopCluster(): Promise<ServiceResult> {
    return Manager.stopCluster();
  }

  async parseServerGroup(params: { text: string }): Promise<ServiceResult> {
    return parseServerGroup(params.text).then((res) => ({
      code: res.error ? 500 : 200,
      result: res.error || res.result,
    }));
  }

  async parseServerURL(params: { text: string }): Promise<ServiceResult> {
    let result: OneOfConfig[] | string;
    let code;

    try {
      result = parseUrl(params.text);
      code = 200;
    } catch (error) {
      code = 500;
      result = error?.toString() ?? i18n.__('invalid_parameter');
    }

    return {
      code,
      result,
    };
  }

  async parseSubscriptionURL(params: { text: string }): Promise<ServiceResult> {
    const res = await parseSubscription(params.text);
    return {
      code: 200,
      result: {
        name: res.error ? '' : (res.name || ''),
        result: res.error ? [] : (res.result || []),
        url: params.text,
      }
    };
  }

  async generateUrlFromConfig(params: Config): Promise<ServiceResult> {
    let url = '';
    const result = {
      code: 200,
      result: {
        dataUrl: '',
        url: '',
        msg: ''
      },
    };

    switch (params.type) {
      case 'ss':
        url = ProxyURI.generateSS(
          params.serverHost, params.serverPort, params.encryptMethod,
          params.password, params.remark, false
        );
        break;
      case 'ssr':
        url = ProxyURI.generateSSR(
          params.serverHost, params.serverPort, params.encryptMethod,
          params.password, params.remark,
          params.protocol, params.protocolParam, (params as SSRConfig).obfs, (params as SSRConfig).obfsParam
        );
        break;
      default:
        result.code = 500;
        result.result.msg = `Invalid Config: ${JSON.stringify(params)}`;
        return result;
    }

    result.result.url = url;

    return new Promise((resolve) => {
      QRCode.toDataURL(url, function (err, _dataURL) {
        if (!err) {
          result.code = 200;
          result.result.dataUrl = _dataURL;
        } else {
          result.code = 500;
          result.result.msg = err.toString();
        }
        resolve(result);
      });
    });
  }

  async reGeneratePacFile(params: { url?: string, text?: string, settings: Settings }) {
    return new Promise(resolve => {
      return PS.downloadAndGeneratePac(params.url ?? '', params.text ?? '', params.settings).then(() => {
        resolve({
          code: 200,
          result: params.url
        });
      })
        .catch((err: Error) => {
          resolve({
            code: 500,
            result: err?.toString()
          });
        });
    });
  }

  async startHttpProxyServer(params: { port: number, proxyPort: number }) {
    return new Promise(resolve => {
      HPS.stopHttpServer(params.port, '127.0.0.1');
      return HPS.createHttpServer({ ...params, host: '127.0.0.1' }, (error) => {
        resolve({
          code: error ? 500 : 200,
          result: (error && error.toString()) ?? ''
        });
      });
    });
  }

  async stopHttpProxyServer(params: { port: number }) {
    return new Promise(resolve => {
      return HPS.stopHttpServer(params.port, '127.0.0.1', (error) => {
        resolve({
          code: error ? 500 : 200,
          result: (error && error.toString()) ?? ''
        });
      });
    });
  }

  async startPacServer(params: { pacPort: number, reload: boolean }) {
    return new Promise(resolve => {
      PS.stopPacServer();
      try {
        Manager.proxy?.start();
      } catch (error) {
        logger.error(`>> Start desktop proxy error: ${error}`);
      }
      checkPortInUse([params.pacPort], '127.0.0.1')
        .then(results => {
          if (results[0]?.isInUse) {
            warning(`Pac port ${params.pacPort} is in use`);
            throw new Error(`${i18n.__('port_already_in_use')} ${params.pacPort}`);
          }
        })
        .then(() => {
          PS.startPacServer(params.pacPort);
        })
        .then(() => {
          resolve({
            code: 200,
            result: 'success'
          });
        })
        .catch(error => {
          resolve({
            code: 500,
            result: error && error.toString()
          });
        })
    });
  }

  async stopPacServer() {
    return new Promise(resolve => {
      PS.stopPacServer();
      try {
        Manager.proxy?.stop();
      } catch (error) {
        logger.error(`>> Stop desktop proxy error: ${error}`);
      }
      resolve({
        code: 200,
        result: '',
      });
    });
  }

  async updateUserPacRules(params: { rules: string }) {
    return new Promise(resolve => {
      PacServer.updateUserPacRules(params.rules)
        .then(() => {
          resolve({
            code: 200,
            result: '',
          });
        })
        .catch((error) => {
          resolve({
            code: 500,
            result: error?.toString() || i18n.__('invalid_parameter'),
          });
        });
    });
  }

  async getUserPacRules() {
    return new Promise(resolve => {
      PacServer.getUserPacRules()
        .then(rules => {
          resolve({
            code: 200,
            result: rules
          });
        })
        .catch(() => {
          resolve({
            code: 200,
            result: ''
          });
        });
    });
  }

  async updateGlobalPacRules(params: { rules: string }) {
    return new Promise(resolve => {
      PacServer.updateGlobalPacRules(params.rules)
        .then(() => {
          resolve({
            code: 200,
            result: '',
          });
        })
        .catch((error) => {
          resolve({
            code: 500,
            result: error?.toString() || i18n.__('invalid_parameter'),
          });
        });
    });
  }

  async getGlobalPacRules() {
    return new Promise(resolve => {
      PacServer.getGlobalPacRules()
        .then(rules => {
          resolve({
            code: 200,
            result: rules
          });
        })
        .catch(() => {
          resolve({
            code: 200,
            result: ''
          });
        });
    });
  }

  async updateLocalFileContent(params: { path: string, content: string, }) {
    try {
      await fs.promises.writeFile(params.path, params.content);
    } catch (error: any) {
      return Promise.resolve({
        code: 500,
        result: error?.toString() || i18n.__('invalid_parameter'),
      });
    }

    return Promise.resolve({
      code: 200,
      result: params.path,
    });
  }

  async getLocalFileContent(params: { path: string }) {
    let content = '';

    try {
      content = await fs.promises.readFile(params.path, 'utf-8');
    } catch (error: any) {
      return Promise.resolve({
        code: 500,
        result: error?.toString() || i18n.__('invalid_parameter'),
      });
    }

    return Promise.resolve({
      code: 200,
      result: content,
    });
  }

  async tcpPing(params: { host: string, port: number }) {
    return new Promise(resolve => {
      tcpPing({
        host: params.host,
        port: params.port
      }).then(([result, records]) => {
        resolve({
          code: 200,
          result: {
            ...result,
            records: records
          }
        });
      });
    })
  }

  async setAclConfFile(params: { text: string }): Promise<ServiceResult> {
    return new Promise((resolve) => {
      fs.writeFile(
        getPathRuntime('acl.conf'),
        params.text,
        (err) => {
          if (err) return resolve({
            code: 500,
            result: err.toString()
          });
          resolve({
            code: 200,
            result: getPathRuntime('acl.conf')
          });
        }
      );
    });
  }
}
