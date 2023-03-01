import {
  MenuItemConstructorOptions, BrowserWindow, IpcMain as _IpcMain,
  Tray, MenuItem, Menu,
} from 'electron';

import CONSTS from './core/LoadBalancer/consts';
import { WorkflowTaskOptions } from './core/workflow/types';

export type WorkflowTaskType = 'puppeteer-source' | 'crawler-source' | 'node-source' | 'processor-pipe' | 'effect-pipe';
export type WorkflowRunnerStatus = 'idle' | 'running' | 'success' | 'failed';
export type WorkflowTaskStatus = 'idle' | 'running' | 'success' | 'failed';
export type WorkflowTaskTimerType = 'schedule' | 'timer';

export interface WorkflowTaskTimer {
  enable: boolean;
  type?: WorkflowTaskTimerType;
  interval?: number; // minutes
  schedule?: string; // time schedule, unix cron format, such as '1 * * * * *'
}

export interface WorkflowTask {
  id: string;
  status: { value: WorkflowTaskStatus };
  type: WorkflowTaskType;
  scriptPath: string;
  timeout: number;
}

export interface WorkflowRunner {
  id: string;
  enable: boolean;
  ctime: number;
  status: { value: WorkflowRunnerStatus };
  timerOption: WorkflowTaskTimer;
  queue: WorkflowTask[];
}

export const encryptMethods = [
  "none",
  "aes-128-gcm",
  "aes-192-gcm",
  "aes-256-gcm",
  "rc4",
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

export interface Settings {
  selectedServer?: string | null;
  mode: Mode;
  verbose: boolean;
  localPort: number;
  pacPort: number;
  httpProxy: {
    enable: boolean,
    port: number
  },
  loadBalance: {
    enable: boolean,
    count: number,
    strategy: CONSTS
  },
  acl: {
    enable: boolean,
    url: string
  }
  gfwListUrl: string;
  autoLaunch: boolean;
}

export type Encryption = typeof encryptMethods[number];
export type Mode = "PAC" | "Global" | "Manual";

export interface Status {
  connected: boolean;
  loading: boolean;
  delay: number | null | '';
}

export interface Service {
  ipc: IpcMain
}

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
  win: null | BrowserWindow;
  tray: null | Tray;
  icon: string;
  trayIcon: string;
  trayMenu: Menu | null;
  menus: (MenuItem| MenuItemConstructorOptions)[];
  width: number;
  height: number;
  url: string;
  quitting: boolean;
  resizable: boolean;
  getStoreData: (name: string) => any;
  create: () => Promise<any>;
  createTray: () => Promise<any>;
  setLocaleTrayMenu: () => void;
  show: () => void;
  quit: () => void;
  hide: () => void;
  beforeQuitting: () => void;
}

export type ServiceResult = {
  code: number,
  result: any
};

export interface MainService extends Service {
  [attr: string]: IpcMain | ServiceHandler | any;
  isConnected: () => Promise<ServiceResult>;
  startClient: (params: { config: Config, settings: Settings }) => Promise<ServiceResult>;
  stopClient: () => Promise<ServiceResult>;
  startCluster: (params: { configs: Config[], settings: Settings }) => Promise<ServiceResult>;
  stopCluster: () => Promise<ServiceResult>;
  parseServerURL: (params: { text: string }) => Promise<ServiceResult>;
  parseSubscriptionURL: (params: { text: string }) => Promise<ServiceResult>;
  generateUrlFromConfig: (params: Config) => Promise<ServiceResult>;
}

export interface DesktopService extends Service {
  [attr: string]: IpcMain | ServiceHandler | any;
  createTransparentWindow: (params: RectPoint[]) => Promise<ServiceResult>;
  reloadMainWindow: (params: any) => Promise<ServiceResult>;
  setStartupOnBoot: (on: boolean) => Promise<ServiceResult>;
  openLogDir: (params: Config) => Promise<ServiceResult>;
}

export interface ThemeService extends Service {
  listenForUpdate: () => Promise<ServiceResult>;
  unlistenForUpdate: () => Promise<ServiceResult>;
  getSystemThemeInfo: () => Promise<ServiceResult>;
}

export interface WorkflowService extends Service {
  [attr: string]: IpcMain | ServiceHandler | any;
  getWorkflowRunners: () => Promise<ServiceResult>;
  getWorkflowRunner: (params: {id: string}) => Promise<ServiceResult>;
  runWorkflowRunner: (params: {id: string}) => Promise<ServiceResult>;
  stopWorkflowRunner: (params: {id: string}) => Promise<ServiceResult>;
  disableWorkflowRunner: (params: {id: string}) => Promise<ServiceResult>;
  enableWorkflowRunner: (params: {id: string}) => Promise<ServiceResult>;
  editWorkflowRunner: (params: {id: string, options: {
    enable?: boolean;
    timer?: {
      enable?: boolean;
      schedule?: string;
    };
  }}) => Promise<ServiceResult>;
  generateTaskOfRunner: (params: { task: Partial<WorkflowTaskOptions>, runnerId?: string }) => Promise<ServiceResult>;
  removeTaskOfRunner: (params: {taskId: string, runnerId: string}) => Promise<ServiceResult>;
  removeWorkflowRunner: (params: {id: string}) => Promise<ServiceResult>;
}

export type ServiceHandler = (params: any) => Promise<ServiceResult>

export interface IpcMainProcess {
  ipc: IpcMain
  mainService: MainService
  desktopService: DesktopService
}

export type IpcMain = _IpcMain;

export const plugins = ["v2ray-plugin", "kcptun", "define"] as const;
export type Plugin = typeof plugins[number] | string;
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

interface CommonConfig {
  id: string;
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
  definedPlugin?: string;
  definedPluginOpts?: string;
  definedPluginSIP003?: string;
  definedPluginOptsSIP003?: string;
}

export interface SSConfig extends CommonConfig {
  type?: string;
}

export interface SSRConfig extends CommonConfig {
  type?: string;
  protocol: typeof protocols[number];
  protocolParam: string;
  obfs: typeof obfs[number];
  obfsParam: string,
}

export type ProxyStatus = "off" | "on";
export type platform = "win32" | "darwin" | "linux";
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

export interface DefinedPluginProps {
  name: string;
  args: string;
  path: string;
}
