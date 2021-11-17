import path from 'path';

import { execAsync } from "../utils/utils";
import { ignoredHosts_win } from "./config";

const sysproxyPath = path.join((global as any).pathRuntime, `bin/win32/x64/sysproxy.exe`);

export const unsetProxy = async () => {
  const result = await execAsync(
    `${sysproxyPath} off`
  );
  return result.code === 0;
};

export const setPacProxy = async (url: string) => {
  const autoSet = await execAsync(
    `${sysproxyPath} pac ${url}`
  );
  return autoSet.code === 0;
};

export const setGlobalProxy = async (host: string, port: number) => {
  const manualSet = await execAsync(
    `${sysproxyPath} global ${host}:${port} ${ignoredHosts_win}`
  );

  return manualSet.code === 0;
};
