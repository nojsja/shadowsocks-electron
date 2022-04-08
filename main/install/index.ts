import fs from "fs-extra";
import path from "path";
import { session } from "electron";
import isDev from "electron-is-dev";

import logger from "../logs";
import { generatePacWithoutPort } from "../proxy/pac";
import { getChromeExtensionsPath } from '../utils/utils';
import { getPathRuntime } from "../config";

export const pacDir = getPathRuntime('pac');
export const binDir = getPathRuntime('bin');

const loadExtensionsManually = (paths: string[]) => {
  paths.forEach(async (_path) => {
    if (fs.existsSync(_path)) {
      await session.defaultSession.loadExtension(_path);
    }
  })
}

const loadExtensionsWithInstaller = async () => {
  const installExtension = require('electron-devtools-installer');
  const { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } = installExtension;

  installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
    .then((name: string) => console.log(`Added Extension:  ${name}`))
    .catch((err: Error) => console.log('An error occurred: ', err));
}

export const setupAfterInstall = async (manually?: boolean) => {
  if (manually && isDev) {
    // react / redux devtool
    getChromeExtensionsPath([
      'fmkadmapgofadopljbjfkapdkoienihi',
      'lmhkpmbekcpmknklioeibfkpmmfibljd'
    ]).then(async (paths) => {
      if (paths && paths.length) {
        loadExtensionsManually(paths)
      }
    });
  } else if (!manually && isDev) {
    loadExtensionsWithInstaller();
  }
};

export const setupIfFirstRun = async () => {
  try {
    const firstRun = !(await fs.pathExists(path.resolve(pacDir, "pac.txt")));

    if (!firstRun) {
      return;
    }

    logger.info("First run detected");

    const data = await fs.readFile(path.resolve(pacDir, "gfwlist.txt"));
    const text = data.toString("ascii");
    await generatePacWithoutPort(text);
  } catch (err) {
    logger.error(err as object);
  }
};
