import { execAsync } from "../../utils/utils";
import { ignoredHosts_win } from "./config";
import { getPathRuntime } from '../../config';

export const unsetProxy = async () => {
  const result = await execAsync(
    `${getPathRuntime(`bin/win32/x64/sysproxy.exe`)} set 1 - -`
  );
  return result.code === 0;
};

export const setPacProxy = async (url: string) => {
  const autoSet = await execAsync(
    `${getPathRuntime(`bin/win32/x64/sysproxy.exe`)} pac ${url}`
  );
  return autoSet.code === 0;
};

export const setGlobalProxy = async (host: string, port: number) => {
  const manualSet = await execAsync(
    `${getPathRuntime(`bin/win32/x64/sysproxy.exe`)} global ${host}:${port} ${ignoredHosts_win}`
  );

  return manualSet.code === 0;
};
