import os from 'os';
import path from 'path';
import { app } from 'electron';
import isDev from 'electron-is-dev';

const electronAppPath = app.getPath('appData');

export const isInspect = process.env.INSPECT;
export const platform = os.platform();
export const isMacOS = platform === 'darwin';
export const packageName = 'shadowsocks-electron';
export const appDataPath = path.join(electronAppPath, packageName);
export const pathRuntime = path.join(appDataPath, 'runtime/');
export const pathExecutable =
  isDev ?
  app.getAppPath() :
  (
    isMacOS ?
      path.join(path.dirname(app.getPath('exe')), '..') :
      path.dirname(app.getPath('exe'))
  );

export const getPathRoot = (p: string) => path.join(appDataPath, p);
export const getPathRuntime = (p: string) => path.join(pathRuntime, p);

export default {
  packageName,
  platform,
  isInspect,
  isMacOS,
  appDataPath,
  pathRuntime,
  pathExecutable,
  getPathRoot,
  getPathRuntime
};
