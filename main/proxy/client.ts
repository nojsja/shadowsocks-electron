import { EventEmitter } from "events";
import { MessageChannel } from "electron-re";
import { BrowserWindow } from "electron";
import os from 'os';
import { ChildProcessWithoutNullStreams, spawn } from "child_process";

import checkPortInUse from "../utils/checkPortInUse";
import { debounce, getSSLocalBinPath } from "../utils/utils";
import { Settings, SSRConfig, SSConfig } from "../types/extention";
import logger from "../logs";
import { Proxy } from './proxy';

let mainWindow: BrowserWindow | null = null;
export let connected = false;
const platform = os.platform();

export const getConnected = () => connected;

export const setMainWindow = (window: BrowserWindow) => {
  mainWindow = window;
};

export class Client extends EventEmitter {
  bin: string
  type: 'ss' | 'ssr'
  child: ChildProcessWithoutNullStreams | null
  error: null | Error | string
  params: string[]
  settings: Settings
  proxy?: Proxy

  constructor(settings: Settings, type: 'ssr' | 'ss') {
    super();
    this.type = type;
    this.bin = getSSLocalBinPath(type);
    this.params = [];
    this.error = '';
    this.settings = settings;
    this.child = null;
    this.onExited.bind(this);
    this.onConnected.bind(this);
    this.on('connected', this.onConnected);
    this.on('exited', debounce(this.onExited, 600));
    if (settings.mode !== 'Manual') {
      this.proxy = Proxy.createProxy(
        platform,
        platform === 'win32' ? settings.httpProxy.port : settings.localPort,
        settings.pacPort,
        settings.mode
      );
    }
  }

  async onConnected(cb?: (success: boolean) => void) {
    logger.info(`Started ${this.type}-local`);
    await this.proxy?.start();
    logger.info("Set proxy on");
    connected = true;
    mainWindow?.webContents.send("connected", true);
    cb && cb(true);
  }

  async onExited(cb?: (success: boolean) => void) {
    checkPortInUse([this.settings.localPort], '127.0.0.1')
    .then(async results => {
      if (results[0]?.isInUse) {
        cb && cb(true);
      } else {
        logger.info(`Exited ${this.bin} with error ${this.error}`);
        await this.proxy?.stop();
        logger.info("Set proxy off");

        connected = false;
        MessageChannel.sendTo(mainWindow?.id || 1, 'connected', false);

        cb && cb(false);
      }
    });
  }
}

export class SSClient extends Client {
  constructor(settings: Settings) {
    super(settings, 'ss');
    this.on('error', () => {

    });
  }

  parseParams(config: SSConfig) {
    this.params = [
      "-s",
      config.serverHost,
      "-p",
      config.serverPort.toString(),
      "-l",
      this.settings.localPort.toString(),
      "-k",
      config.password,
      "-m",
      config.encryptMethod,
      config.udp ? "-u" : "",
      config.fastOpen ? "--fast-open" : "",
      config.noDelay ? "--no-delay" : "",
      config.plugin ? "--plugin" : "",
      config.plugin ?? "",
      config.pluginOpts ? "--plugin-opts" : "",
      config.pluginOpts ?? "",
      this.settings.verbose ? "-v" : "",
      "-t",
      (config.timeout ?? "600").toString()
    ].filter(arg => arg !== '');
  }

  connect(config: SSConfig): Promise<{code: number, result: any}> {
    return new Promise(resolve => {
      this.parseParams(config);
      logger.info(`Exec command:${this.bin} ${this.params.join(' ')}`);

      this.child = spawn(
        this.bin,
        this.params
      );

      if (!this.child) return resolve({
        code: 500,
        result: `Failed to exec command [${this.bin}] with args [${JSON.stringify(this.params)}].`
      });

      this.child.stdout?.once("data", async () => {
        this.emit('connected', () => {
          resolve({
            code: 200,
            result: 'success'
          });
        });
      });

      this.child.stdout?.on("data", data => {
        logger.info(data);
      });

      this.child.stderr?.on('data', err => {
        this.error = err || null;
        console.log('child.stderr.on.data >> ');
        logger.error(err);
        this.emit('exited', (isAlive: boolean) => {
          if (!isAlive) {
            this.child?.kill();
          } else {
            this.emit('connected', () => {
              resolve({
                code: 200,
                result: 'success'
              });
            });
          }
        });
      });

      this.child.on("error", async (err) => {
        this.error = err || null;
        console.log('child.on.error >> ');
        logger.error(err);
        this.emit('exited', (isAlive: boolean) => {
          if (!isAlive) {
            this.child?.kill();
          } else {
            this.emit('connected', () => {
              resolve({
                code: 200,
                result: 'success'
              });
            });
          }
        });
      });

      this.child.on("exit", async () => {
        resolve({
          code: 500,
          result: String(this.error)
        });
        this.child = null;
      });
    });
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      this.child?.kill("SIGKILL");
      this.emit('exited', (isAlive: boolean) => {
        if (isAlive) {
          reject({
            code: 500,
            result: 'failed'
          });
        } else {
          resolve({
            code: 200,
            result: 'success'
          });
        }
      });
    });
  }
}

export class SSRClient extends Client {
  constructor(settings: Settings) {
    super(settings, 'ssr');
    this.on('error', () => {

    });
  }

  parseParams(config: SSRConfig) {
    this.params = [
      "-s",
      config.serverHost,
      "-p",
      config.serverPort.toString(),
      "-l",
      this.settings.localPort.toString(),
      "-k",
      config.password,
      "-m",
      config.encryptMethod,
      "-t",
      (config.timeout ?? "600").toString(),
      "-o",
      config.obfs,
      "-O",
      config.protocol,
      config.obfsParam ? `-g ${config.obfsParam}` : '',
      config.protocolParam ? `-G ${config.protocolParam}` : '',
      config.udp ? "-u" : "",
      config.fastOpen ? "--fast-open" : "",
      // config.noDelay ? "--no-delay" : "",
      this.settings.verbose ? "-v" : ""
    ].filter(arg => arg !== '');
  }

  connect(config: SSRConfig): Promise<{code: number, result: any}> {
    return new Promise(resolve => {
      this.parseParams(config);
      logger.info(`Exec command: ${this.bin} ${this.params.join(' ')}`);

      this.child = spawn(
        this.bin,
        this.params
      );


      if (!this.child) return resolve({
        code: 500,
        result: `Failed to exec command [${this.bin}] with args [${JSON.stringify(this.params)}].`
      });

      this.child.stdout?.once("data", async () => {
        this.emit('connected', () => {
          resolve({
            code: 200,
            result: 'success'
          });
        });
      });

      this.child.stdout?.on("data", data => {
        logger.info(data);
      });

      this.child.stderr?.on('data', err => {
        this.error = err || null;
        console.log('child.stderr.on.data >> ');
        logger.error(err);
        this.emit('exited', (isAlive: boolean) => {
          if (!isAlive) {
            this.child?.kill();
          } else {
            this.emit('connected', () => {
              resolve({
                code: 200,
                result: 'success'
              });
            });
          }
        });
      });

      this.child.on("error", async (err) => {
        this.error = err || null;
        console.log('child.on.error >> ');
        logger.error(err);
        this.emit('exited', (isAlive: boolean) => {
          if (!isAlive) {
            this.child?.kill();
          } else {
            this.emit('connected', () => {
              resolve({
                code: 200,
                result: 'success'
              });
            });
          }
        });
      });

      this.child.on("exit", async () => {
        resolve({
          code: 500,
          result: String(this.error)
        });
        this.child = null;
      });
    });
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      this.child?.kill("SIGKILL");
      this.emit('exited', (isAlive: boolean) => {
        if (isAlive) {
          reject({
            code: 500,
            result: 'failed'
          });
        } else {
          resolve({
            code: 200,
            result: 'success'
          });
        }
      });
    });
  }
}
