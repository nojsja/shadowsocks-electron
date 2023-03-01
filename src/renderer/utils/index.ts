import { Config, GroupConfig, NotificationOptions } from '../types';
import { MessageChannel } from 'electron-re';

import { persistStore } from '../App';
import { getFirstLanguage } from '../i18n';

export function saveDataURLAsFile(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  document.body.appendChild(link);
  link.setAttribute("type", "hidden");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
  document.body.removeChild(link);
}

export function getDefaultLang(): string {
  return getFirstLanguage(persistStore.get('lang') as string);
}

export function getScreenCapturedResources(): Promise<Electron.DesktopCapturerSource[]> {
  return MessageChannel.invoke('main', 'service:desktop', {
    action: 'getScreenCapturedResources',
    params: {
      types: ['screen'],
      width: window.screen.width,
      height: window.screen.height,
      devicePixelRatio: window.devicePixelRatio
    }
  }).then(res => {
    if (res.code === 200) {
      return res.result;
    }
    return [];
  });
}

export function openNotification(options: NotificationOptions) {
  MessageChannel.invoke('main', 'service:desktop', {
    action: 'openNotification',
    params: options
  });
}

export function findAndCallback(server: undefined | (Config | GroupConfig)[], id: string, callback?: (rsp: Config) => void) : undefined | (Config | GroupConfig) {
  if (!server || !server.length) {
    return;
  }
  for (let i = 0; i < server.length; i++) {
    if (server[i].id === id) {
      callback && callback(server[i] as Config);
      return server[i];
    }
    if ('servers' in server[i]) {
      const conf = findAndCallback((server[i] as GroupConfig).servers, id, callback);
      if (conf) {
        return conf;
      }
    }
  }
}

export function findAndModify(server: undefined | (Config | GroupConfig)[], id: string, conf: (Config | GroupConfig)) : (Config | GroupConfig)[] {
  if (!server || !server.length) {
    return [];
  }
  for (let i = 0; i < server.length; i++) {
    if (server[i].id === id) {
      server.splice(i, 1, {...server[i], ...conf});
      break;
    }
    if ('servers' in server[i]) {
      findAndModify((server[i] as GroupConfig).servers, id, conf);
    }
  }

  return server;
}

export function debounce(fn: (...args: any[]) => any, delay: number) {
  let timer: NodeJS.Timeout | undefined;

  return function(this: unknown, ...args: any[]){
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  }
}

export function throttle(fn: (...args: any[]) => any, delay: number) {
  let timer: NodeJS.Timeout | undefined;

  return function(this: unknown, ...args: any[]){
    if (timer) {
      return;
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = undefined;
    }, delay);
  }
}
