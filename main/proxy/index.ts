import electronIsDev from "electron-is-dev";

import { Config, Settings, SSRConfig, SSConfig } from "../types/extention";
import logger from "../logs";

import checkPortInUse from "../utils/checkPortInUse";
import {  SSClient, SSRClient, getConnected } from "./client";

let ssLocal: SSRClient | SSClient | null;

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
      } else if(config.type === 'ss') {
        ssLocal= new SSClient(settings);
        return (ssLocal as SSClient).connect(config as SSConfig);
      } else {
        return Promise.resolve({
          code: 600,
          result: `Unknown shadowsocks client type: ${config.type}`
        });
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
  return getConnected();
};
