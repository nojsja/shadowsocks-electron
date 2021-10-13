import { MenuItemConstructorOptions } from "electron/main";
import { BrowserWindow, IpcMain as _IpcMain, Tray, MenuItem } from 'electron';

export interface Service {
  ipc: IpcMain
}

export type TrayMenu = (MenuItem | MenuItemConstructorOptions)[]

export interface TransparentWindowType {
  icon: string
  url: string
  win: null | BrowserWindow
  width: number
  height: number
  create: (params: { fillRect: rectPoint[] }) => Promise<any>
  destroy: () => void
}

export interface IpcMainWindowType {
  win: null | BrowserWindow
  tray: null | Tray
  icon: string
  trayIcon: string
  trayMenu: TrayMenu
  width: number
  height: number
  quitting: boolean
  create: () => Promise<any>
  createTray: () => Promise<any>
  show: () => void
  quit: () => void
  hide: () => void
  beforeQuitting: () => void
}

export interface MainService extends Service {
  [attr: string]: IpcMain | ServiceHandler | any
  isConnected: () => Promise<ServiceResult>
  startClient: (params: { config: Config, settings: Settings }) => Promise<ServiceResult>
  stopClient: () => Promise<ServiceResult>
  parseClipboardText: (params: { text: string }) => Promise<ServiceResult>
  generateUrlFromConfig: (params: Config) => Promise<ServiceResult>
}

export interface DesktopService extends Service {
  [attr: string]: IpcMain | ServiceHandler | any
  createTransparentWindow: (params: rectPoint[]) => Promise<ServiceResult>
  reloadMainWindow: (params: any) => Promise<ServiceResult>
  setStartupOnBoot: (on: boolean) => Promise<ServiceResult>
  openLogDir: (params: Config) => Promise<ServiceResult>
}

export type ServiceResult = {
  code: number,
  result: any
};

export type ServiceHandler = (params: any) => Promise<ServiceResult>

export interface IpcMainProcess {
  ipc: IpcMain
  mainService: MainService
  desktopService: DesktopService
}

export type IpcMain = _IpcMain;

export const encryptMethods = [
  "aes-128-gcm",
  "aes-192-gcm",
  "aes-256-gcm",
  "rc4-md5",
  "aes-128-cfb",
  "aes-192-cfb",
  "aes-256-cfb",
  "aes-128-ctr",
  "aes-192-ctr",
  "aes-256-ctr",
  "bf-cfb",
  "camellia-128-cfb",
  "camellia-192-cfb",
  "camellia-256-cfb",
  "chacha20-ietf-poly1305",
  "xchacha20-ietf-poly1305",
  "salsa20",
  "chacha20",
  "chacha20-ietf"
] as const;

export type Encryption = typeof encryptMethods[number];

export const plugins = ["v2ray-plugin", "kcptun"] as const;

export type Plugin = typeof plugins[number];

export type ACL = "bypass";

export interface Config {
  id?: string;
  remark?: string;
  serverHost: string;
  serverPort: number;
  password: string;
  encryptMethod: Encryption | string;
  timeout?: number;
  acl?: ACL;
  fastOpen?: boolean;
  noDelay?: boolean;
  maxOpenFile?: number;
  udp?: boolean;
  plugin?: Plugin;
  pluginOpts?: string;
  type?: 'ss' | 'ssr' | 'http';
  protocol?: string;
  protocolParam?: string;
}

export type Mode = "PAC" | "Global" | "Manual";

export interface Settings {
  selectedServer?: string | null;
  mode: Mode;
  verbose: boolean;
  localPort: number;
  pacPort: number;
  gfwListUrl: string;
  autoLaunch: boolean;
};

export type rectPoint = { x: number, y: number, width: number, height: number };
