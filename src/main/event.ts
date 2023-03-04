import { app as _app, nativeTheme } from 'electron';
import EventEmitter from 'events';
import { SyncHook, AsyncParallelHook } from 'tapable';
import { type NativeTheme } from 'electron/main';
import ElectronStore from 'electron-store';

import { IpcMainWindowType } from './type';
import IpcMainWindow from './window/MainWindow';

export type LifeCycles = 'beforeReady' | 'ready' | 'afterReady' | 'beforeQuit';

export class AppEvent extends EventEmitter {
  constructor(app: Electron.App) {
    super();
    this.app = app;
    this.handlers = {
      store: new ElectronStore(),
      theme: nativeTheme,
    };
    this.initEventListeners();
  }

  app: Electron.App;
  lifeCycles: LifeCycles[] = ['beforeReady', 'ready', 'afterReady', 'beforeQuit'];
  hooks = {
    beforeReady: new SyncHook(['app']),
    ready: new SyncHook(['app']),
    afterReady: new AsyncParallelHook(['app']),
    beforeQuit: new SyncHook(['app']),
  }
  handlers: {
    ipcMainWindow?: IpcMainWindowType;
    store: ElectronStore;
    theme: NativeTheme;
  }

  registryHooksSync(point: LifeCycles, name: string, fn: (args_0: any) => void) {
    this.hooks[point].tap(name, fn);
  }

  registryHooksAsyncWhenReady(name: string, fn: (args_0: any) => void) {
    this.hooks.afterReady.tapAsync(name, fn);
  }

  registryListenerForThemeUpdate(listener: (event: { sender: { shouldUseDarkColors: boolean  } }) => void, eventType?: 'on' | 'once') {
    this.handlers.theme[eventType ?? 'on']('updated', listener);
  }

  unregistryListenerForThemeUpdate(listener: (event: { sender: { shouldUseDarkColors: boolean  } }) => void) {
    this.handlers.theme.off('updated', listener);
  }

  beforeReady() {
    this.hooks.beforeReady.call(this.app);
  }

  ready(){
    this.hooks.ready.call(this.app);
  }

  afterReady(callback: (err: Error | null, app: Electron.App) => void) {
    this.hooks.afterReady.callAsync(this.app, (err) => {
      if(err) return callback(err, this.app);
      callback(null, this.app);
    });
  }

  beforeQuit() {
    this.hooks.ready.call(this.app);
  }

  initIpcMainWindow() {
    this.handlers.ipcMainWindow = new IpcMainWindow(
      this.getStoreData,
      {
        width: 460,
        height: 540,
      }
    );
    this.handlers.ipcMainWindow.createTray();
    return this.handlers.ipcMainWindow.create();
  }

  initEventListeners() {
    this.on('ipcMainWindow:quit', () => {
      this.handlers.ipcMainWindow?.quit();
    });
    this.on('ipcMainWindow:hide', () => {
      this.handlers.ipcMainWindow?.hide();
    });
    this.on('ipcMainWindow:set-locale', () => {
      appEventCenter.handlers.ipcMainWindow?.setLocaleTrayMenu();
    });
    this.on('sendToWeb', (name: string, args: unknown) => {
      this.handlers?.ipcMainWindow?.win?.webContents.send(name, args);
    });
  }

  getNativeTheme(){
    return {
      shouldUseDarkColors: this.handlers.theme.shouldUseDarkColors,
      shouldUseHighContrastColors: this.handlers.theme.shouldUseHighContrastColors,
      shouldUseInvertedColorScheme: this.handlers.theme.shouldUseInvertedColorScheme
    };
  }

  getStoreData(name: string) {
    try {
      const data = JSON.parse(this.handlers.store.get('persist:root') as string);
      return name ? JSON.parse(data[name]) : JSON.parse(data);
    } catch (error) {
      return {};
    }
  }
}

export const appEventCenter = new AppEvent(_app);
