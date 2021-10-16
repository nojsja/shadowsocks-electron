import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { BrowserWindow } from "electron";
import os from "os";

import { Config, Settings, Mode, SSRConfig, SSConfig } from "../types/extention";
import logger from "../logs";
import * as networksetup from "../helpers/networksetup";
import * as gsettings from "../helpers/gsettings";
import { startPacServer, stopPacServer } from "./pac";
import { generateFullPac } from "./pac";
import { setupIfFirstRun } from "../install";
import { MessageChannel } from "electron-re";
import checkPortInUse from "../utils/checkPortInUse";
import { debounce, getSSLocalBinPath } from "../utils/utils";
import { EventEmitter } from "events";
import electronIsDev from "electron-is-dev";

const platform = os.platform();
let mainWindow: BrowserWindow | null = null;
let ssLocal: SSRClient | SSClient | null;
let connected = false;

export const setMainWindow = (window: BrowserWindow) => {
  mainWindow = window;
};

const setProxy = async (
  status: "on" | "off",
  mode?: Mode,
  localPort?: number,
  pacPort?: number
) => {
  if (mode === "Manual") {
    return;
  }

  switch (platform) {
    case "darwin":
      if (status === "off") {
        await networksetup.unsetProxy();
        stopPacServer();
      } else if (mode === "Global") {
        await networksetup.setGlobalProxy("127.0.0.1", localPort ?? 1080);
      } else if (mode === "PAC") {
        await setupIfFirstRun();
        await generateFullPac(localPort ?? 1080);
        await stopPacServer();
        startPacServer(pacPort ?? 1090);
        await networksetup.setPacProxy(
          `http://localhost:${pacPort ?? 1090}/proxy.pac`
        );
      }
      break;
    case "linux":
      if (status === "off") {
        await gsettings.unsetProxy();
        stopPacServer();
      } else if (mode === "Global") {
        await gsettings.setGlobalProxy("127.0.0.1", localPort ?? 1080);
      } else if (mode === "PAC") {
        await setupIfFirstRun();
        await generateFullPac(localPort ?? 1080);
        await stopPacServer();
        startPacServer(pacPort ?? 1090);
        await gsettings.setPacProxy(
          `http://localhost:${pacPort ?? 1090}/proxy.pac`
        );
      }
      break;
  }
};

class Client extends EventEmitter {
  bin: string
  type: 'ss' | 'ssr'
  child: ChildProcessWithoutNullStreams | null
  error: null | Error | string
  params: string[]
  settings: Settings

  constructor(settings: Settings, type: 'ssr' | 'ss') {
    super();
    this.type = type;
    this.bin = getSSLocalBinPath(type);
    this.params = [];
    this.error = '';
    this.settings = settings;
    this.child = null;
    this.on('connected', this.onConnected);
    this.on('exited', debounce(this.onExited, 600));
  }

  async onConnected(cb?: (success: boolean) => void) {
    logger.info(`Started ${this.type}-local`);
    await setProxy("on", this.settings.mode, this.settings.localPort, this.settings.pacPort);
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
        logger.info(`Exited ${this.bin} with error ${this.error}.`);
        await setProxy("off");
        logger.info("Set proxy off");

        connected = false;
        MessageChannel.sendTo(mainWindow?.id || 1, 'connected', false);

        cb && cb(false);
      }
    });
  }
}

class SSClient extends Client {
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
    this.child?.kill("SIGKILL");
    mainWindow?.webContents.send("connected", false);
  }
}

class SSRClient extends Client {
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
      config.plugin ? "--plugin" : "",
      config.plugin ?? "",
      config.pluginOpts ? "--plugin-opts" : "",
      config.pluginOpts ?? "",
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
    this.child?.kill("SIGKILL");
    mainWindow?.webContents.send("connected", false);
  }
}

const spawnClient = async (config: Config, settings: Settings) : Promise<{code: number, result: any}> => {
  if (electronIsDev) {
    console.log(config);
  }
  return checkPortInUse([settings.localPort], '127.0.0.1')
    .then(results => {
      if (results[0]?.isInUse) {
        return Promise.resolve({
          code: 600,
          result: results[0]
        });
      }
      if (config.type === 'ssr') {
        ssLocal = new SSRClient(settings);
        return (ssLocal as SSRClient).connect(config as SSRConfig);
      } else {
        ssLocal= new SSClient(settings);
        return (ssLocal as SSClient).connect(config as SSConfig);
      }
    });
};

const killClient = async () => {
  ssLocal?.disconnect();
  logger.info(`Killed ${ssLocal?.type || 'ss'}-local`);
};

export const startClient = async (config: Config, settings: Settings): Promise<{ code: number, result: any }> => {
  if (!ssLocal) {
    return spawnClient(config, settings);
  } else {
    await killClient();
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
    return spawnClient(config, settings);
  }
};

export const stopClient = async () => {
  await killClient();
};

export const isConnected = () => {
  return connected;
};
