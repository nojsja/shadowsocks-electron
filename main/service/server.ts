import { IpcMain, clipboard } from 'electron';
import QRCode from 'qrcode';

import {
  MainService as MainServiceType,
  Config, Settings, ServiceResult, SSRConfig
} from '../types/extention';
import { ProxyURI } from '../utils/ProxyURI';
import { startClient, stopClient, isConnected } from '../proxy';
import { createHttpServer, stopHttpServer } from '../proxy/http';
import tcpPing from '../utils/tcp-ping';

/* main service handler */
export class MainService implements MainServiceType {
  ipc: IpcMain

  constructor(ipc: IpcMain) {
    this.ipc = ipc;
  }

  async isConnected(): Promise<ServiceResult> {
    return Promise.resolve({
      code: 200,
      result: isConnected()
    });
  }

  async startClient(params: { config: Config, settings: Settings }): Promise<ServiceResult> {
    return startClient(params.config, params.settings);
  }

  async stopClient(): Promise<ServiceResult> {
    return new Promise((resolve) => {
      stopClient()
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

  async parseClipboardText(params: { text: string }): Promise<ServiceResult> {
    const text = params.text || clipboard.readText('clipboard');
    const parsedInfo = ProxyURI.parse(text);

    const result: Config[] = parsedInfo.map(info => {
      const base = {
        remark: info.remark || info.host,
        serverHost: info.host,
        serverPort: info.port,
        password: info.password || '',
        encryptMethod: info.authscheme,
        timeout: 60
      };
      if (info.type === 'ssr') {
        return ({
          ...base,
          type: info.type as any,
          protocol: info.protocol || '',
          protocolParam: info.protocolParam || '',
          obfs: info.obfs || '',
          obfsParam: info.obfsParam
        }) as SSRConfig;
      }
      return ({
        ...base,
        type: info.type as any,
      }) as SSRConfig
    });

    console.log(result);

    return Promise.resolve({
      code: 200,
      result
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
          params.password, params.remark
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

  // async startHttpsProxyServer(params: { port: number, proxyPort: number }) {
  //   return new Promise(resolve => {
  //     return createHttpsServer({...params, host: '127.0.0.1'}, (error) => {
  //       resolve({
  //         code: error ? 500 : 200,
  //         result: error ?? ''
  //       });
  //     });
  //   });
  // }

  async startHttpProxyServer(params: { port: number, proxyPort: number }) {
    return new Promise(resolve => {
      return createHttpServer({...params, host: '127.0.0.1'}, (error) => {
        resolve({
          code: error ? 500 : 200,
          result: error ?? ''
        });
      });
    });
  }

  // async stopHttpsProxyServer(params: { port: number }) {
  //   return new Promise(resolve => {
  //     return stopHttpsServer(params.port, '127.0.0.1', (error) => {
  //       resolve({
  //         code: error ? 500 : 200,
  //         result: error ?? ''
  //       });
  //     });
  //   });
  // }

  async stopHttpProxyServer(params: { port: number }) {
    return new Promise(resolve => {
      return stopHttpServer(params.port, '127.0.0.1', (error) => {
        resolve({
          code: error ? 500 : 200,
          result: error ?? ''
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
}
