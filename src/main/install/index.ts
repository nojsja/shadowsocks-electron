import fs from 'fs';
import { session } from 'electron';
import isDev from 'electron-is-dev';
import { createRequire } from 'module';

import { getChromeExtensionsPath } from '@main/utils';

const require = createRequire(import.meta.url);

const loadExtensionsManually = (paths: string[]) => {
  paths.forEach(async (_path) => {
    if (!_path) return;
    try {
      await fs.promises.access(_path, fs.constants.F_OK);
      session.defaultSession.loadExtension(_path);
    } catch (error) {
      console.warn(error);
    }
  });
};

const loadExtensionsWithInstaller = async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
        loadExtensionsManually(paths);
      }
    });
  } else if (!manually && isDev) {
    loadExtensionsWithInstaller();
  }
};
