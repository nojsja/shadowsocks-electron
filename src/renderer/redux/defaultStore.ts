import { ALGORITHM, RootState } from '@renderer/types';

const defaultStore: RootState = {
  notifications: [],
  config: [],
  status: {
    connected: false,
    delay: 0,
    loading: false,
    waiting: false,
    traffic: { KB: 0, MB: 0, GB: 0 },
  },
  settings: {
    fixedMenu: false,
    selectedServer: null,
    serverMode: 'single',
    loadBalance: {
      enable: false,
      count: 3,
      strategy: ALGORITHM.POLLING,
    },
    clusterId: '',
    mode: 'Manual',
    darkMode: false,
    autoTheme: false,
    verbose: false,
    localPort: 1080,
    pacPort: 1090,
    openAIAPIKey: '',
    acl: {
      enable: false,
      url: '',
    },
    httpProxy: {
      enable: false,
      port: 1095,
      enableAIProxy: true,
    },
    gfwListUrl:
      'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt',
    autoLaunch: false,
    autoHide: false,
    lang: 'zh-CN',
  },
};

export default defaultStore;
