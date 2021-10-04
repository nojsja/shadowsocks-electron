import { ChildProcess, spawn } from "child_process";
import { BrowserWindow } from "electron";
import os from "os";

import { Config, Settings, Mode } from "../types/extention";
import logger from "../logs";
import * as networksetup from "./networksetup";
import * as gsettings from "./gsettings";
import { startPacServer, stopPacServer } from "../server";
import { generateFullPac } from "../pac";
import { setupIfFirstRun, binDir } from "../install";
import { MessageChannel } from "electron-re";
import checkPortInUse from "../utils/checkPortInUse";
import { getSSLocalBinPath } from "../utils/utils";

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
  const sslocalPath = getSSLocalBinPath();
  const args = [
    "-s",
    config.serverHost,
    "-p",
    config.serverPort.toString(),
    "-l",
    settings.localPort.toString(),
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
    settings.verbose ? "-v" : "",
    "-t",
    (config.timeout ?? "60").toString()
  ];

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
        ssLocal = spawn(
          sslocalPath,
          args.filter(arg => arg !== ''),
          {
            cwd: binDir
          }
        );

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
        ssLocal.on("error", err => {
          logger.error(err);
        });
        ssLocal.on("exit", async (code, signal) => {
          logger.info(`Exited ss-local with code ${code} or signal ${signal}`);

          await setProxy("off");
          logger.info("Set proxy off");

          connected = false;
          MessageChannel.sendTo(mainWindow?.id || 1, 'connected', false);

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
