import { EventEmitter } from "events";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";

import checkPortInUse from "./helpers/port-checker";
import { debounce, getSSLocalBinPath } from "../utils/utils";
import { Settings, SSRConfig, SSConfig, ServiceResult } from "../types/extention";
import logger from "../logs";
import { DefinedPlugin } from "./plugin";

export class Client extends EventEmitter {
  bin: string
  type: 'ss' | 'ssr'
  child: ChildProcessWithoutNullStreams | null
  definedPlugins: DefinedPlugin[]
  error: null | Error | string
  params: string[]
  settings: Settings
  connected: boolean
  port: number
  onDebouncedExited: (fn?: (isAlive: boolean) => void) => void

  constructor(settings: Settings, type: 'ssr' | 'ss') {
    super();
    this.type = type;
    this.bin = getSSLocalBinPath(type);
    this.params = [];
    this.error = '';
    this.settings = settings;
    this.port = settings.localPort;
    this.child = null;
    this.onExited.bind(this);
    this.onConnected.bind(this);
    this.connected = false;
    this.onDebouncedExited = debounce(this.onExited, 600);
    this.definedPlugins = [];
    this.handleEvents();
  }

  protected connectPlugin(name: string, path: string, args: string) {
    this.definedPlugins.push(
      new DefinedPlugin({
        name,
        path,
        args,
      })
    );
  }

  private handleEvents() {
    this.on('connected', (isAlive: boolean) => {
      this.definedPlugins.forEach((plugin) => {
        if (isAlive) {
          plugin.start();
        } else {
          plugin.stop();
        }
      });
      if (!isAlive) {
        this.definedPlugins = [];
      }
    });
  }

  protected async onConnected() {
    logger.info(`Started ${this.type}-local`);
    this.connected = true;
    this.emit('connected', true);
  }

  protected async onExited(cb?: (success: boolean) => void) {
    checkPortInUse([this.settings.localPort], '127.0.0.1')
    .then(async results => {
      if (results[0]?.isInUse) {
        this.connected = true;
        this.emit('connected', true);
        cb && cb(true);
      } else {
        logger.info(`Exited ${this.bin} with error ${this.error}`);

        this.connected = false;
        this.emit('connected', false);
        cb && cb(false);
      }
    });
  }
}

export class SSClient extends Client {
  config: SSConfig

  constructor(settings: Settings, config: SSConfig) {
    super(settings, 'ss');
    this.config = config;
  }

  parseParams(config: SSConfig) {
    const { acl } = this.settings;
    const isAclEnabled = acl.enable && acl.url;
    const embedPluginEnabled = config.plugin && config.plugin !== 'define';

    this.params = [
      "-s",
      config.serverHost,
      "-p",
      config.serverPort.toString(),
      "-b",
      "127.0.0.1",
      "-l",
      this.port.toString(),
      "-k",
      config.password,
      "-m",
      config.encryptMethod,
      config.udp ? "-u" : "",
      config.fastOpen ? "--fast-open" : "",
      config.noDelay ? "--no-delay" : "",
      embedPluginEnabled ? "--plugin" : "",
      embedPluginEnabled ? (config.plugin ?? '') : '',
      (embedPluginEnabled && config.pluginOpts) ? "--plugin-opts" : "",
      embedPluginEnabled ? `"${config.pluginOpts ?? ''}"` : "",
      this.settings.verbose ? "-v" : "",
      "-t",
      (config.timeout ?? "600").toString(),
      isAclEnabled ? `--acl` : "",
      isAclEnabled ? `${acl.url}` : ""
    ].filter(arg => arg !== '' && arg !== '""');
  }

  connect(config: SSConfig = this.config): Promise<{code: number, result: any}> {
    return new Promise(resolve => {
      this.parseParams(config);
      if (config.definedPlugin) {
        this.connectPlugin(config.definedPlugin, config.definedPlugin, config.definedPluginOpts ?? '');
      }
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
        this.onConnected();
        resolve({
          code: 200,
          result: {
            info: 'success',
            port: this.port
          }
        });
      });

      this.child.stdout?.on("data", data => {
        logger.info(data.toString());
      });

      this.child.stderr?.on('data', err => {
        this.error = err || null;
        console.log('child.stderr.on.data >> ');
        logger.error(err);
        this.onDebouncedExited((isAlive: boolean) => {
          if (!isAlive) {
            this.child?.kill();
          } else {
            this.onConnected();
            resolve({
              code: 200,
              result: {
                info: 'success',
                port: this.port
              }
            });
          }
        })
      });

      this.child.on("error", async (err) => {
        this.error = err || null;
        console.log('child.on.error >> ');
        logger.error(err);
        this.onDebouncedExited((isAlive: boolean) => {
          if (!isAlive) {
            this.child?.kill();
          } else {
            resolve({
              code: 200,
              result: {
                info: 'success',
                port: this.port
              }
            });
            this.onConnected();
          }
        });
      });

      this.child.on("exit", async () => {
        this.connected = false;
        this.emit('connected', false);
        resolve({
          code: 500,
          result: String(this.error)
        });
        this.child = null;
      });
    });
  }

  disconnect() {
    return new Promise<ServiceResult>((resolve, reject) => {
      this.child?.kill("SIGKILL");
      this.child?.once('exit', () => {
        this.onDebouncedExited((isAlive: boolean) => {
          if (isAlive) {
            reject({
              code: 500,
              result: 'failed'
            });
          } else {
            this.connected = false;
            this.emit('connected', false);
            resolve({
              code: 200,
              result: 'success'
            });
          }
        });
      });
    });
  }
}

export class SSRClient extends Client {
  config: SSRConfig

  constructor(settings: Settings, config: SSRConfig) {
    super(settings, 'ssr');
    this.config = config;
  }

  parseParams(config: SSRConfig) {
    const { acl } = this.settings;
    const isAclEnabled = acl.enable && acl.url;
    this.params = [
      "-s",
      config.serverHost,
      "-p",
      config.serverPort.toString(),
      "-b",
      "127.0.0.1",
      "-l",
      this.port.toString(),
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
      this.settings.verbose ? "-v" : "",
      isAclEnabled ? `--acl` : "",
      isAclEnabled ? `${acl.url}` : ""
    ].filter(arg => arg !== '');
  }

  connect(config: SSRConfig = this.config): Promise<{code: number, result: any}> {
    return new Promise(resolve => {
      this.parseParams(config);
      if (config.definedPlugin) {
        this.connectPlugin(config.definedPlugin, config.definedPlugin, config.definedPluginOpts ?? '');
      }
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
        resolve({
          code: 200,
          result: {
            info: 'success',
            port: this.port
          }
        });
        this.onConnected();
      });

      this.child.stdout?.on("data", data => {
        logger.info(data);
      });

      this.child.stderr?.on('data', err => {
        this.error = err || null;
        console.log('child.stderr.on.data >> ');
        logger.error(err);
        this.onDebouncedExited((isAlive: boolean) => {
          if (!isAlive) {
            this.child?.kill();
          } else {
            resolve({
              code: 200,
              result: {
                info: 'success',
                port: this.port
              }
            });
            this.onConnected();
          }
        });
      });

      this.child.on("error", async (err) => {
        this.error = err || null;
        console.log('child.on.error >> ');
        logger.error(err);
        this.onDebouncedExited((isAlive: boolean) => {
          if (!isAlive) {
            this.child?.kill();
          } else {
            resolve({
              code: 200,
              result: {
                info: 'success',
                port: this.port
              }
            });
            this.onConnected();
          }
        });
      });

      this.child.on("exit", async () => {
        this.connected = false;
        this.emit('connected', false);
        resolve({
          code: 500,
          result: String(this.error)
        });
        this.child = null;
      });
    });
  }

  disconnect() {
    return new Promise<ServiceResult>((resolve, reject) => {
      this.child?.kill("SIGKILL");
      this.child?.once("exit", () => {
        this.onDebouncedExited((isAlive: boolean) => {
          if (isAlive) {
            reject({
              code: 500,
              result: 'failed'
            });
          } else {
            this.connected = false;
            this.emit('connected', false);
            resolve({
              code: 200,
              result: 'success'
            });
          }
        });
      })
    });
  }
}
