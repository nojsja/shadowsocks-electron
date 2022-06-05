import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import jsqr from 'jsqr';
import uuid from "uuid/v1";
import { MessageChannel } from 'electron-re';

import { ActionRspText, ClipboardParseType, Config, GroupConfig, RootState, Settings } from "../../types";
import { findAndCallback, getScreenCapturedResources } from '../../utils';
import { overrideSetting, setSetting } from './settings';
import { setStatus } from './status';
import { enqueueSnackbar } from './notifications';

export const ADD_CONFIG = "ADD_CONFIG";
export const ADD_SUBSCRIPTION = "ADD_SUBSCRIPTION";
export const UPDATE_SUBSCRIPTION = "UPDATE_SUBSCRIPTION";
export const REMOVE_CONFIG = "REMOVE_CONFIG";
export const EDIT_CONFIG = "EDIT_CONFIG";
export const WIPE_CONFIG = "WIPE_CONFIG";
export const OVERRIDE_CONFIG = "OVERRIDE_CONFIG";
export const TOP = "TOP";
export const MOVE_UP = "MOVE_UP";
export const MOVE_DOWN = "MOVE_DOWN";
export const MOVE_TO = "MOVE_TO";

export const addConfig = (id: string, config: Config) => {
  return {
    type: ADD_CONFIG,
    id,
    config
  };
};

export const backupConfigurationToFile = (params: any, info: ActionRspText): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    MessageChannel.invoke('main', 'service:desktop', {
      action: 'backupConfigurationToFile',
      params
    }).then(rsp => {
      if (rsp.code === 200) {
        return dispatch(enqueueSnackbar(info.success, { variant: 'success' }));
      }
      dispatch(enqueueSnackbar(info.error[rsp.code] ?? info.error.default, { variant: "warning" }));
    });
  }
}

export const restoreConfigurationFromFile =
  (info: ActionRspText): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    MessageChannel.invoke('main', 'service:desktop', {
      action: 'restoreConfigurationFromFile',
      params: {}
    })
    .then((rsp) => {
      if (rsp.code === 200) {
        dispatch(enqueueSnackbar(info.success, { variant: "success" }));
        dispatch(wipeConfig());
        if (rsp.result.config?.length) {
          rsp.result.config.forEach((conf: Config) => {
            dispatch(addConfig(conf.id, conf))
          });
        }
        if (rsp.result.settings) {
          dispatch(overrideSetting(rsp.result.settings));
        }
      } else {
        dispatch(enqueueSnackbar(info.error[rsp.code] ?? info.error.default, { variant: "warning" }));
      }
    });
  }
}

export const updateSubscription = (id: string, url: string, info: ActionRspText): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    dispatch(setStatus('waiting', true));
    MessageChannel.invoke('main', 'service:main', {
      action: 'parseClipboardText',
      params: {
        text: url,
        type: 'subscription'
      }
    })
    .then((rsp) => {
      setTimeout(() => dispatch(setStatus('waiting', false)), 1e3);
      if (rsp.code === 200) {
        if (rsp.result?.result?.length) {
          dispatch({
            type: UPDATE_SUBSCRIPTION,
            id: id,
            config: {
              name: rsp.result.name || 'new subscription',
              servers: (rsp.result.result as Config[]).map(server => {
                server.id = uuid();
                return server;
              }),
            }
          });
          return dispatch(enqueueSnackbar(info.success, { variant: 'success' }));
        }
      }
      dispatch(enqueueSnackbar(info.error.default, { variant: 'error' }));
    });
  }
};

export const startCluster =
  (config: (GroupConfig | Config)[], id: string, settings: Settings, info: ActionRspText): ThunkAction<void, RootState, unknown, AnyAction> => {
    return (dispatch) => {
      findAndCallback(config, id, (c: Config) => {
        const { servers: configs } = c as any;
        MessageChannel.invoke('main', 'service:main', {
          action: 'startCluster',
          params: {
            configs,
            settings
          }
        })
          .then((rsp) => {
            if (rsp.code === 200) {
              dispatch(setSetting('nodeMode', 'cluster'));
              dispatch(setSetting('clusterId', id));
              return dispatch(enqueueSnackbar(info.success, { variant: "success" }));
            } else {
              return dispatch(enqueueSnackbar(info.error.default, { variant: "error" }));
            }
          });
      });
    }
  }

export const stopCluster =
  (item: GroupConfig, settings: Settings, info: ActionRspText): ThunkAction<void, RootState, unknown, AnyAction> => {
    return (dispatch) => {
      MessageChannel.invoke('main', 'service:main', {
        action: 'stopCluster',
        params: {}
      })
        .then((rsp) => {
          if (rsp.code === 200) {
            dispatch(setSetting('nodeMode', 'single'));
            dispatch(setSetting('clusterId', ''));
            return dispatch(enqueueSnackbar(info.success, { variant: "success" }));
          } else {
            return dispatch(enqueueSnackbar(info.error.default, { variant: "error" }));
          }
        });
    }
  }


export const parseClipboardText = (text: string | null, type: ClipboardParseType, info: ActionRspText): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    dispatch(setStatus('waiting', true));
    MessageChannel.invoke('main', 'service:main', {
      action: 'parseClipboardText',
      params: {
        text,
        type
      }
    })
    .then((rsp) => {
      setTimeout(() => dispatch(setStatus('waiting', false)), 1e3);
      if (rsp.code === 200) {
        if ((type === 'subscription')) {
          if (rsp.result?.result?.length) {
            dispatch(addSubscription(uuid(), rsp.result.url, {
              name: rsp.result.name || 'new subscription',
              servers: (rsp.result.result as Config[]).map(server => {
                server.id = uuid();
                return server;
              }),
            }))
            return dispatch(enqueueSnackbar(info.success, { variant: 'success' }));
          }
        } else {
          if (rsp.result?.length) {
            dispatch(addConfig(uuid(), rsp.result[0]));
            return dispatch(enqueueSnackbar(info.success, { variant: 'success' }));
          }
        }
      }
      return dispatch(enqueueSnackbar(info.error[rsp.code] ?? info.error.default, { variant: "error" }));
    });
  }
};

export const getQrCodeFromScreenResources = (info: ActionRspText): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    dispatch(setStatus('waiting', true))
    getScreenCapturedResources().then((resources: Electron.DesktopCapturerSource[]) => {
      if (resources?.length) {
        const qrs: {x: number, y: number, width: number, height: number}[] = [];
        const values: string[] = [];
        resources.forEach(resource => {
          const size = resource.thumbnail.getSize();
          const capturedData = jsqr(resource.thumbnail.getBitmap() as any, size.width, size.height);
          if (capturedData?.data) {
            values.push(capturedData.data);
            qrs.push({
              x: capturedData.location.topLeftCorner.x,
              y: capturedData.location.topLeftCorner.y,
              width: capturedData.location.topRightCorner.x - capturedData.location.topLeftCorner.x,
              height: capturedData.location.bottomLeftCorner.y - capturedData.location.topLeftCorner.y,
            });
          }
        });
        if (qrs.length) {
          MessageChannel.invoke('main', 'service:desktop', {
            action: 'createTransparentWindow',
            params: qrs
          }).then(() => {
            values.forEach(value => {
              dispatch(parseClipboardText(value, 'url', info));
            });
          });
        } else {
          dispatch(enqueueSnackbar(info.error.default, { variant: 'error' }));
        }
      } else {
        dispatch(enqueueSnackbar(info.error.default, { variant: 'error' }));
      }
    }).catch(error => {
      dispatch(enqueueSnackbar(error && error.toString(), { variant: 'error' }));
    }).finally(() => {
      setTimeout(() => dispatch(setStatus('waiting', false)), 1e3);
    });
  }
};

/* parse and get ss/ssr config from clipboard */
export const addConfigFromClipboard =
  (info: ActionRspText): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    dispatch(parseClipboardText(null, 'url', info));
  }
};

export const addSubscriptionFromClipboard =
  (info: ActionRspText): ThunkAction<void, RootState, unknown, AnyAction> => {
    return (dispatch) => {
      dispatch(parseClipboardText(null, 'subscription', info));
    }
  };

/* generate ss/ssr url from config */
export const generateUrlFromConfig =
  (params: Config) => {
    return MessageChannel.invoke('main', 'service:main', {
      action: 'generateUrlFromConfig',
      params
    });
}

export const removeConfig = (id: string, config: Config | GroupConfig) => {
  return {
    type: REMOVE_CONFIG,
    id,
    config
  };
};

type PartialGroupConfig = {
  name: string;
  servers: Config[];
}

export const addSubscription = (id: string, url: string, config: PartialGroupConfig) => {
  return {
    type: ADD_SUBSCRIPTION,
    id,
    config,
    url
  }
};

export const editConfig = (id: string, config: Config) => {
  return {
    type: EDIT_CONFIG,
    id,
    config
  };
};

export const moveConfig = (id: string, target: string) => {
  return {
    type: MOVE_TO,
    id,
    target,
  };
};

export const wipeConfig = () => {
  return {
    type: WIPE_CONFIG
  };
}

export const top = (id: string) => {
  return {
    type: TOP,
    id
  }
};

export const moveUp = (id: string) => {
  return {
    type: MOVE_UP,
    id
  }
};

export const moveDown = (id: string) => {
  return {
    type: MOVE_DOWN,
    id
  }
};

export type AddConfigAction = ReturnType<typeof addConfig>;
export type RemoveConfigAction = ReturnType<typeof removeConfig>;
export type EditConfigAction = ReturnType<typeof editConfig>;
export type MoveConfigAction = ReturnType<typeof moveConfig>;
export type AddSubscriptionAction = ReturnType<typeof addSubscription>;
