import { app, BrowserWindow, dialog } from 'electron';
import path from 'path';
import {
  BrowserService,
  ChildProcessPool,
  MessageChannel,
  LoadBalancer,
} from 'electron-re';
import electronIsDev from 'electron-is-dev';

import { i18n } from '@main/i18n';
import { AppEvent, appEventCenter } from '@main/event';
import { ssPrefix, ssProtocol, ssrPrefix, ssrProtocol } from '@main/config';
import { warning } from '@main/helpers/logger';
import { workflowManager } from '@main/service/workflow';

const tasks: Array<(electronApp: AppEvent) => void> = [];

const electronReServiceTest = (electronApp: AppEvent) => {
  if (!electronIsDev) return;

  electronApp.registryHooksAsyncWhenReady('electronReServiceTest', async () => {
    console.log('hooks: >> electron-re service test');
    try {
      const testService = new BrowserService(
        'test',
        path.join(__dirname, '../test/test.service.js'),
        {
          dev: true,
          webPreferences: {
            webSecurity: false,
          },
        },
      );
      await testService.connected();
      // testService.openDevTools();

      const pool = new ChildProcessPool({
        path: path.join(__dirname, '../test/test.child.js'),
        max: 2,
        strategy: LoadBalancer.ALGORITHM.POLLING,
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

const setAsDefaultProtocolClient = () => {
  const args = [];

  const addServerConfirm = (url: string) => {
    dialog
      .showMessageBox({
        type: 'info',
        message: `${i18n.t('would_you_want_to_add_the_server')}\n${url}`,
        buttons: [i18n.t('confirm'), i18n.t('cancel')],
        defaultId: 0,
      })
      .then(({ response }) => {
        if (response === 0) {
          ((global as any).win as BrowserWindow).show();
          appEventCenter.emit('sendToWeb', 'event:stream', {
            action: 'add-server',
            args: url,
          });
        }
      })
      .catch((e) => console.log(e));
  };

  const handleUrl = (url: string) => {
    if (!app.isReady()) {
      app.once('ready', async () => {
        await new Promise((resolve) => setTimeout(resolve, 2e3));
        addServerConfirm(url);
      });
    } else {
      addServerConfirm(url);
    }
  };

  const handleArgv = (argv: string[]) => {
    const offset = app.isPackaged ? 1 : 2;
    const url = argv.find((arg, i) => {
      return (
        i >= offset && (arg.startsWith(ssPrefix) || arg.startsWith(ssrPrefix))
      );
    });
    if (url) handleUrl(url);
  };

  if (electronIsDev) args.push(path.resolve(process.argv[1]));
  args.push('--');

  if (!app.isDefaultProtocolClient(ssrProtocol)) {
    app.setAsDefaultProtocolClient(ssrProtocol, process.execPath, args);
  }
  if (!app.isDefaultProtocolClient(ssProtocol)) {
    app.setAsDefaultProtocolClient(ssProtocol, process.execPath, args);
  }

  handleArgv(process.argv);

  // Windows, Not supported on Linux
  app.on('second-instance', (event, argv) => {
    if (process.platform === 'win32') {
      handleArgv(argv);
    }
  });

  // macOS
  app.on('open-url', (event, urlStr) => {
    handleUrl(urlStr);
  });
};

const initWorkflow = async (electronApp: AppEvent) => {
  electronApp.registryHooksAsyncWhenReady('initWorkflow', async () => {
    console.log('hooks: >> init workflow');
    try {
      await workflowManager.bootstrap();
      const [succeed, failedTasks] = await workflowManager.init();
      if (!succeed) {
        warning(`workflow init failed: ${failedTasks.join()}`);
      }
    } catch (error) {
      warning(`workflow init failed: ${error}`);
    }
  });
};

tasks.push(electronReServiceTest, setAsDefaultProtocolClient, initWorkflow);

export default (electronApp: AppEvent) => {
  tasks.forEach((task) => {
    task(electronApp);
  });
};
