import path from 'path';
import { BrowserService, ChildProcessPool, MessageChannel, LoadBalancer } from 'electron-re';
import electronIsDev from 'electron-is-dev';

import { ElectronApp } from "../app";

export default (electronApp: ElectronApp) => {
  electronReServiceTest(electronApp);
};


export const electronReServiceTest = (electronApp: ElectronApp) => {
  if (!electronIsDev) return;

  electronApp.registryHooksAsyncWhenReady('electronReServiceTest', async (app: Electron.App) => {
    console.log('hooks: >> electronReServiceTest');
    try {
      const testService = new BrowserService('test', path.join(__dirname, '../test/test.service.js'), {
        dev: true,
        webPreferences: {
          webSecurity: false
        }
      });
      await testService.connected();
      // testService.openDevTools();

      const pool = new ChildProcessPool({
        path: path.join(__dirname, '../test/test.child.js'),
        max: 2,
        strategy: LoadBalancer.ALGORITHM.POLLING
      });
      pool.send('test1', { message: 'hello world' });

      setTimeout(() => {
        MessageChannel.invoke('test', 'test:notify', {});
      }, 3e3);

    } catch (error) {
      console.trace(error);
    }
  });
};
