import { RootState } from "../types";

const defaultStore: RootState = {
  config: [],
  status: {
    connected: false,
    delay: 0,
    loading: false
  },
  settings: {
    selectedServer: null,
    mode: "PAC",
    verbose: false,
    localPort: 1080,
    pacPort: 1090,
    httpProxy: {
      enable: false,
      port: 1095
    },
    httpsProxy: {
      enable: false,
      port: 1096
    },
    gfwListUrl:
      "https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt",
    autoLaunch: false,
    lang: 'zh-CN'
  }
};

export default defaultStore;
