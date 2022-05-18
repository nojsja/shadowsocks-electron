import { MenuItemConstructorOptions } from "electron/main";
import { BrowserWindow, IpcMain as _IpcMain, Tray, MenuItem, Menu } from 'electron';

import { Encryption } from './index';

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
  create: (params: { fillRect: RectPoint[] }) => Promise<any>
  destroy: () => void
}

export interface IpcMainWindowType {
  win: null | BrowserWindow
  tray: null | Tray
  icon: string
  trayIcon: string
  trayMenu: Menu | null
  menus: TrayMenu
  width: number
  height: number
  url: string;
  quitting: boolean;
  resizable: boolean;
  create: () => Promise<any>
  createTray: () => Promise<any>
  setLocaleTrayMenu: () => void
  show: () => void
  quit: () => void
  hide: () => void
  beforeQuitting: () => void
}

export type ServiceResult = {
  code: number,
  result: any
};

export interface MainService extends Service {
  [attr: string]: IpcMain | ServiceHandler | any
  isConnected: () => Promise<ServiceResult>
  startClient: (params: { config: Config, settings: Settings }) => Promise<ServiceResult>
  stopClient: () => Promise<ServiceResult>
  parseClipboardText: (params: { text: string, type: ClipboardParseType }) => Promise<ServiceResult>
  generateUrlFromConfig: (params: Config) => Promise<ServiceResult>
}

export interface DesktopService extends Service {
  [attr: string]: IpcMain | ServiceHandler | any
  createTransparentWindow: (params: RectPoint[]) => Promise<ServiceResult>
  reloadMainWindow: (params: any) => Promise<ServiceResult>
  setStartupOnBoot: (on: boolean) => Promise<ServiceResult>
  openLogDir: (params: Config) => Promise<ServiceResult>
}

export interface ThemeService extends Service {
  listenForUpdate: () => Promise<ServiceResult>
  unlistenForUpdate: () => Promise<ServiceResult>
}

export type ServiceHandler = (params: any) => Promise<ServiceResult>

export interface IpcMainProcess {
  ipc: IpcMain
  mainService: MainService
  desktopService: DesktopService
}

export type IpcMain = _IpcMain;

export const plugins = ["v2ray-plugin", "kcptun"] as const;
export type Plugin = typeof plugins[number];
export type ACL = boolean;
export type Config = SSConfig & SSRConfig;
export type OneOfConfig = SSConfig | SSRConfig;
export type MonoSubscription = MonoSubscriptionSS | MonoSubscriptionSSR;
export type SubscriptionParserStore = SubscriptionParserConfig[];
export type SubscriptionParserConfig = {
  name: string,
  test: RegExp,
  parse: (data: any) => OneOfConfig[]
}

export interface SubscriptionResult {
  name: string,
  server: MonoSubscription[],
  version: number
}

export interface MonoSubscriptionSSR {
  id: string,
  remarks: string,
  name: string,
  server: string,
  server_port: number,
  password: string,
  method: string,
  protocol: string,
  protocol_param: string,
  obfs: string,
  obfs_param: string,
}

export interface MonoSubscriptionSS {
  id: string,
  remarks: string,
  name: string,
  server: string,
  server_port: number,
  password: string,
  method: string,
}

export type ClipboardParseType = 'url' | 'subscription';

export const obfs = ['plain', 'http_simple', 'http_post', 'tls1.2_ticket_auth'];

export const protocols = [
  "origin",
  "verify_deflate",
  "auth_sha1_v4",
  "auth_aes128_md5",
  "auth_aes128_sha1",
  "auth_chain_a",
  "auth_chain_b",
  "auth_chain_c",
  "auth_chain_d",
];

export interface SSConfig {
  id?: string;
  type?: string;
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
}

export interface SSRConfig {
  id?: string;
  type?: string;
  remark?: string;
  serverHost: string;
  serverPort: number;
  password: string;
  encryptMethod: Encryption | string;
  protocol: typeof protocols[number];
  protocolParam: string;
  obfs: typeof obfs[number];
  obfsParam: string,
  timeout?: number;
  acl?: ACL;
  fastOpen?: boolean;
  noDelay?: boolean;
  maxOpenFile?: number;
  udp?: boolean;
  plugin?: Plugin;
  pluginOpts?: string;
}

export type Mode = "PAC" | "Global" | "Manual";

export type ProxyStatus = "off" | "on";

export type platform = "win32" | "darwin" | "linux";

export interface Settings {
  selectedServer?: string | null;
  mode: Mode;
  verbose: boolean;
  localPort: number;
  pacPort: number;
  httpProxy: {
    enable: false,
    port: 1095
  },
  gfwListUrl: string;
  autoLaunch: boolean;
};

export type RectPoint = { x: number, y: number, width: number, height: number };

export type WindowInfo = {
  devicePixelRatio: number,
  width: number,
  height: number,
  types: string[]
};

export type InnerCallback = (params: Error | null) => void;

export type contextAction = {
  label: string,
  action: string,
  accelerator: string,
}
