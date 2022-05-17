import { RootState } from "../types";

const defaultStore: RootState = {
  notifications: [],
  config: [],
  status: {
    connected: false,
    delay: 0,
    loading: false,
    waiting: false,
  },
  settings: {
    fixedMenu: false,
    selectedServer: null,
    mode: "Manual",
    darkMode: false,
    verbose: false,
    localPort: 1080,
    pacPort: 1090,
    acl: {
      enable: false,
      text: ""
    },
    httpProxy: {
      enable: false,
      port: 1095
    },
    gfwListUrl:
      "https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt",
    autoLaunch: false,
    autoHide: false,
    lang: 'zh-CN'
  }
};

export default defaultStore;
