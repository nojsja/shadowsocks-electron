import { ChildProcess, spawn } from "child_process";
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
import { buildParamsForSS, buildParamsForSSR, getSSLocalBinPath } from "../utils/utils";

const platform = os.platform();
let mainWindow: BrowserWindow | null = null;
let ssLocal: ChildProcess | null = null;
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
        startPacServer(pacPort ?? 1090);
        await gsettings.setPacProxy(
          `http://localhost:${pacPort ?? 1090}/proxy.pac`
        );
      }
      break;
  }
};

const spawnClient = async (config: Config, settings: Settings) : Promise<{code: number, result: any}> => {
  console.log(config);
  const sslocalPath = getSSLocalBinPath(config.type ?? 'ss');
  let error: Error;
  const args = (config.type === 'ssr') ?
    buildParamsForSSR(config as SSRConfig, { localPort: settings.localPort, verbose: settings.verbose }) :
    buildParamsForSS(config as SSConfig, { localPort: settings.localPort, verbose: settings.verbose }) ;

  return new Promise((resolve) => {
    console.log(`check port ${settings.localPort} usage...`);
    checkPortInUse([settings.localPort], '127.0.0.1')
      .then(results => {
        if (results && results[0] && results[0].isInUse) {
          resolve({
            code: 600,
            result: results[0]
          });
          return;
        }

        logger.info(`Exec command: \`${sslocalPath} ${args.filter(args => !!args).join(' ')}\``);

        ssLocal = spawn(
          sslocalPath,
          args.filter(arg => arg !== '')
        );

        if (!ssLocal) return resolve({
          code: 500,
          result: `Failed to exec command [${sslocalPath}] with args [${JSON.stringify(args)}].`
        });

        ssLocal.stdout?.once("data", async () => {
          logger.info("Started ss-local");

          await setProxy("on", settings.mode, settings.localPort, settings.pacPort);
          logger.info("Set proxy on");

          connected = true;
          mainWindow?.webContents.send("connected", true);

          resolve({
            code: 200,
            result: null
          });
        });

        ssLocal.stdout?.on("data", data => {
          logger.info(data);
        });
        ssLocal.stderr?.on('data', err => {
          error = err;
          logger.error(err);
          ssLocal?.kill();
        });
        ssLocal.on("error", async (err) => {
          error = err;
          logger.error(err);
          ssLocal?.kill();
        });
        ssLocal.on("exit", async (code, signal) => {
          logger.info(`Exited ${sslocalPath} with code ${code} or signal ${signal}`);

          await setProxy("off");
          logger.info("Set proxy off");

          connected = false;
          MessageChannel.sendTo(mainWindow?.id || 1, 'connected', false);

          resolve({
            code: 500,
            result: error?.toString() ?? `Exited ${sslocalPath} with code ${code} or signal ${signal}`
          });

          ssLocal = null;
        });
      })
      .catch(err => {
        resolve({
          code: 500,
          result: {
            error: err.toString()
          }
        });
      });
  });

};

const killClient = async () => {
  ssLocal?.kill("SIGKILL");
  logger.info("Killed ss-local");
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
