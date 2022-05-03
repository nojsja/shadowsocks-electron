export const encryptMethods = [
  "none",
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

export const serverTypes = ['ss', 'ssr'];

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

export type Encryption = typeof encryptMethods[number];

export const plugins = [
  {
    name: "v2ray-plugin",
    tips: "please_confirm_v2ray-plugin_installed_on_your_system"
  },
  {
    name: "kcptun",
    tips: "please_confirm_kcptun_installed_on_your_system"
  }] as const;

export type Plugin = typeof plugins[number];

export type ACL = {
  enable: boolean,
  text: string
};

export type CloseOptions = 'qrcode' | 'url' | 'manual' | 'share' | 'subscription' | '';

export type ClipboardParseType = 'url' | 'subscription';

export type NotificationOptions = {
  title?: string, body: string, subtitle?: string, urgency?: "normal" | "critical" | "low" | undefined
};

export interface SSConfig {
  id: string;
  type: string;
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
  id: string;
  type: string;
  remark?: string;
  serverHost: string;
  serverPort: number;
  password: string;
  encryptMethod: Encryption | string;
  protocol: typeof protocols[number];
  protocolParam: string;
  obfs: typeof obfs[number],
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

export type Config = SSConfig & SSRConfig;

export interface GroupConfig {
  id: string,
  name: string,
  servers: Config[],
  type: string
};

export type Mode = "PAC" | "Global" | "Manual";

export interface Settings {
  selectedServer?: string | null;
  mode: Mode;
  verbose: boolean;
  fixedMenu: boolean;
  darkMode: boolean;
  localPort: number;
  pacPort: number;
  httpProxy: {
    enable: boolean,
    port: number
  },
  acl: ACL,
  gfwListUrl: string;
  autoLaunch: boolean;
  lang: string;
}

export interface Status {
  connected: boolean;
  loading: boolean;
  waiting: boolean;
  delay: number | null | '';
}

export interface RootState {
  config: (Config | GroupConfig)[];
  status: Status;
  settings: Settings;
}
