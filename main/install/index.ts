import fs from "fs-extra";
import path from "path";
import { app, session } from "electron";
import isDev from "electron-is-dev";
import installExtension, { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

import logger from "../logs";
import { generatePacWithoutPort } from "../proxy/pac";
import { getChromeExtensionsPath } from '../utils/utils';

export const appDir = isDev
  ? path.resolve(__dirname, "../../")
  : path.resolve(__dirname, "../../../../");
export const appDataDir = app.getPath("userData");

export const binDir = path.resolve(appDataDir, "bin");
export const pacDir = path.resolve(appDataDir, "pac");

const loadExtensionsManually = (paths: string[]) => {
  paths.forEach(async (_path) => {
    if (fs.existsSync(_path)) {
      await session.defaultSession.loadExtension(_path);
    }
  })
}

const loadExtensionsWithInstaller = async () => {
  installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
}

export const setupAfterInstall = async (manually?: boolean) => {
  // paths
  try {
    const newInstall = !(
      (await fs.pathExists(binDir)) && (await fs.pathExists(pacDir))
    );

    if (newInstall) {
      logger.info("New install detected");
      logger.info("Copying bin & pac to APPDATA...");

      await fs.copy(path.resolve(appDir, "bin"), binDir);
      await fs.copy(path.resolve(appDir, "pac"), pacDir);

      logger.info("Copied bin & pac");
    }

  } catch (err) {
    logger.error(err as object);
  }

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
