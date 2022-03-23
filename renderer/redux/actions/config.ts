import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import jsqr from 'jsqr';
import uuid from "uuid/v1";
import { MessageChannel } from 'electron-re';

import { clipboardParseType, Config, GroupConfig, RootState } from "../../types";
import { getScreenCapturedResources } from '../../utils';
import { overrideSetting } from './settings';

export const ADD_CONFIG = "ADD_CONFIG";
export const ADD_SUBSCRIPTION = "ADD_SUBSCRIPTION";
export const REMOVE_CONFIG = "REMOVE_CONFIG";
export const EDIT_CONFIG = "EDIT_CONFIG";
export const WIPE_CONFIG = "WIPE_CONFIG";
export const OVERRIDE_CONFIG = "OVERRIDE_CONFIG";
export const MOVE_UP = "MOVE_UP";
export const MOVE_DOWN = "MOVE_DOWN";

export const addConfig = (id: string, config: Config) => {
  return {
    type: ADD_CONFIG,
    id,
    config
  };
};

export const backupConfigurationToFile = (params: any, callback?: (attr: boolean) => void) => {
  MessageChannel.invoke('main', 'service:desktop', {
    action: 'backupConfigurationToFile',
    params
  })
  .then((rsp) => {
    if (rsp.code === 200) {
      callback && callback(true);
    } else {
      callback && callback(false);
    }
  });
}

export const restoreConfigurationFromFile = (callback?: (attr: boolean, code?: number) => void): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    MessageChannel.invoke('main', 'service:desktop', {
      action: 'restoreConfigurationFromFile',
      params: {}
    })
    .then((rsp) => {
      if (rsp.code === 200) {
        callback && callback(true);
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
        callback && callback(false, rsp.code);
      }
    });
  }
}

export const parseClipboardText = (text: string | null, type: clipboardParseType, callback?: (added: boolean) => void): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    MessageChannel.invoke('main', 'service:main', {
      action: 'parseClipboardText',
      params: {
        text,
        type
      }
    })
    .then((rsp) => {
      if (rsp.code === 200) {
        if (rsp.result?.result?.length) {
          callback && callback(true);
          if (type === 'subscription') {
            dispatch({
              type: ADD_SUBSCRIPTION,
              id: uuid(),
              config: {
                name: rsp.result.name || 'new subscription',
                servers: rsp.result.result,
              }
            });
          } else {
            dispatch({
              type: ADD_CONFIG,
              id: uuid(),
              config: rsp.result[0]
            });
          }
        } else {
          callback && callback(false);
        }
      }
    });
  }
};

export const getQrCodeFromScreenResources = (callback?: (added: boolean, reason?: string) => void): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    getScreenCapturedResources().then((resources: Electron.DesktopCapturerSource[]) => {
      if (resources && resources.length) {
        const qrs: {x: number, y: number, width: number, height: number}[] = [];
        const values: string[] = [];
        resources.forEach(resource => {
          const size = resource.thumbnail.getSize();
          const capturedData = jsqr(resource.thumbnail.getBitmap() as any, size.width, size.height);
          if (capturedData && capturedData.data) {
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
              dispatch(parseClipboardText(value, 'url'));
            });
          });
          callback && callback(true);
        } else {
          callback && callback(false);
        }
      } else {
        callback && callback(false);
      }
    }).catch(error => {
      callback && callback(false, error && error.toString());
    });
  }
};

/* parse and get ss/ssr config from clipboard */
export const addConfigFromClipboard =
  (callback: (added: boolean) => void): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    dispatch(parseClipboardText(null, 'url', callback));
  }
};

export const addSubscriptionFromClipboard =
  (callback: (added: boolean) => void): ThunkAction<void, RootState, unknown, AnyAction> => {
    return (dispatch) => {
      dispatch(parseClipboardText(null, 'subscription', callback));
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

export const editConfig = (id: string, config: Config | GroupConfig) => {
  return {
    type: EDIT_CONFIG,
    id,
    config
  };
};

export const wipeConfig = () => {
  return {
    type: WIPE_CONFIG
  };
}

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
