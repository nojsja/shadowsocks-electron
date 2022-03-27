import tapable, { SyncHook, AsyncParallelHook } from 'tapable';

export interface ElectronApp {
  hooks: {
    beforeReady: SyncHook<unknown, void, tapable.UnsetAdditionalOptions>;
    ready: SyncHook<unknown, void, tapable.UnsetAdditionalOptions>;
    afterReady: AsyncParallelHook<unknown, tapable.UnsetAdditionalOptions>;
    beforeQuit: SyncHook<unknown, void, tapable.UnsetAdditionalOptions>;
  }
  registryHooksSync: (point: LifeCycles, name: string, fn: (args_0: any) => void) => void;
  registryHooksAsyncWhenReady: (name: string, fn: (args_0: any) => void) => void;
  beforeReady: (app: Electron.App) => void;
  ready: (app: Electron.App) => void;
  afterReady: (app: Electron.App, callback: (err: Error | null, app: Electron.App) => void) => void;
  beforeQuit: (app: Electron.App) => void;
}

export type LifeCycles = 'beforeReady' | 'ready' | 'afterReady' | 'beforeQuit';

export default class App implements ElectronApp {
  hooks = {
    beforeReady: new SyncHook(['app']),
    ready: new SyncHook(['app']),
    afterReady: new AsyncParallelHook(['app']),
    beforeQuit: new SyncHook(['app']),
  }
  lifeCycles: LifeCycles[] = ['beforeReady', 'ready', 'afterReady', 'beforeQuit'];
  constructor() {}

  registryHooksSync(point: LifeCycles, name: string, fn: (args_0: any) => void) {
    this.hooks[point].tap(name, fn);
  }

  registryHooksAsyncWhenReady(name: string, fn: (args_0: any) => void) {
    this.hooks.afterReady.tapAsync(name, fn);
  }

  beforeReady(app: Electron.App) {
    this.hooks.beforeReady.call(app);
  }

  ready(app: Electron.App){
    this.hooks.ready.call(app);
  }

  afterReady(app: Electron.App, callback: (err: Error | null, app: Electron.App) => void) {
    this.hooks.afterReady.callAsync(app, (err) => {
      if(err) return callback(err, app);
      callback(null, app);
    });
  }

  beforeQuit(app: Electron.App) {
    this.hooks.ready.call(app);
  }
}
