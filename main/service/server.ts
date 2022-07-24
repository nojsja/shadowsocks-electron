import { IpcMain, clipboard } from 'electron';
import QRCode from 'qrcode';
import fs from 'fs';

import {
  MainService as MainServiceType,
  Config, Settings, ServiceResult, ClipboardParseType, SSRConfig
} from '../types/extention';
import { manager, http, pac } from '../core';
import tcpPing from '../core/helpers/tcp-ping';
import { getPathRuntime } from '../config';
import { parseSubscription, parseUrl } from '../utils/utils';
import { ProxyURI } from '../core/helpers/proxy-url';
import checkPortInUse from "../core/helpers/port-checker";
import { warning } from '../logs';
import { i18n } from '../electron';
import { PacServer } from '../core/pac';

const { Manager } = manager;
const { HttpProxyServer : HPS } = http;
const { PacServer : PS } = pac;

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
        .catch(error => {
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

  async parseClipboardText(params: { text: string, type: ClipboardParseType }): Promise<ServiceResult> {
    const text = params.text || clipboard.readText('clipboard');
    const type = params.type || 'url';

    if (type === 'url') return Promise.resolve({
      code: 200,
      result: parseUrl(text)
    });

    if (type === 'subscription') {
      return parseSubscription(text).then(res => {
        if (res.error) {
          return {
            code: 200,
            result: {
              name: '',
              result: [],
              url: text
            }
          };
        }
        return {
          code: 200,
          result: {
            name: res.name || '',
            result: res.result || [],
            url: text
          }
        };
      });
    }

    return Promise.resolve({
      code: 200,
      result: {
        name: '',
        result: []
      }
    });
  }

  async generateUrlFromConfig(params: Config): Promise<ServiceResult> {
    let url: string = '';
    let result: {
      code: number
      result: {
        dataUrl: string
        url: string
        msg?: string
      }
    } = {
      code: 200,
      result: {
        dataUrl: '',
        url: '',
        msg: ''
      }
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
        break;
    }

    return new Promise((resolve) => {
      if (url) {
        result.result.url = url;
        QRCode.toDataURL(url, function (err, _dataURL) {
          if (!err) {
            result.result.dataUrl = _dataURL;
          } else {
            result.code = 500;
            result.result.msg = err.toString();
          }
          resolve(result);
        });
      } else {
        result.code = 500;
        result.result.msg = `Invalid Conf: ${JSON.stringify(params)}`;
        resolve(result);
      }
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
      return HPS.createHttpServer({...params, host: '127.0.0.1'}, (error) => {
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

  async startPacServer(params: { pacPort: number }) {
    return new Promise(resolve => {
      PS.stopPacServer();
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
      resolve({
        code: 200,
        result: ''
      });
    });
  }

  async updateUserPacRules(params: { rules: string }) {
    await PacServer.updateUserRules(params.rules);
    return Promise.resolve({
      code: 200,
      result: ''
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
        .catch((err: Error) => {
          resolve({
            code: 500,
            result: err?.message
          });
        });
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
    return new Promise(resolve => {
      return new Promise((resolve, reject) => {
        fs.writeFile(
          getPathRuntime('acl.conf'),
          params.text,
          (err => {
            if (err) reject(err);
            resolve({
              code: 200,
              result: getPathRuntime('acl.conf')
            });
          })
        );
      });
    })
  }
}
