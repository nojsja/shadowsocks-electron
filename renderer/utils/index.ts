import { desktopCapturer } from 'electron';
import { notificationOptions } from '../types';
import { MessageChannel } from 'electron-re';

export function saveDataURLAsFile(dataUrl: string, fileName: string) {
  var link = document.createElement("a");
  document.body.appendChild(link);
  link.setAttribute("type", "hidden");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
  document.body.removeChild(link);
}

export function getDefaultLang(): string {
  return localStorage.getItem('lang') || navigator.language || 'zh-CN';
}

export function getScreenCapturedResources(): Promise<Electron.DesktopCapturerSource[]> {
  return desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: window.screen.width * window.devicePixelRatio,
      height: window.screen.height * window.devicePixelRatio
    }
  });
}

export function openNotification(options: notificationOptions) {
  MessageChannel.invoke('main', 'service:desktop', {
    action: 'openNotification',
    params: options
  });
}
