import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import jsqr from 'jsqr';
import uuid from "uuid/v1";
import { MessageChannel } from 'electron-re';

import { Config, RootState } from "../../types";
import { getScreenCapturedResources } from '../../utils';
import { overrideSetting } from './settings';

export const ADD_CONFIG = "ADD_CONFIG";
export const REMOVE_CONFIG = "REMOVE_CONFIG";
export const EDIT_CONFIG = "EDIT_CONFIG";
export const WIPE_CONFIG = "WIPE_CONFIG";
export const OVERRIDE_CONFIG = "OVERRIDE_CONFIG";

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

export const parseClipboardText = (text?: string | null, callback?: (added: boolean) => void): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    MessageChannel.invoke('main', 'service:main', {
      action: 'parseClipboardText',
      params: {
        text
      }
    })
    .then((rsp) => {
      if (rsp.code === 200) {
        if (rsp.result.length) {
          callback && callback(true);
          dispatch({
            type: ADD_CONFIG,
            id: uuid(),
            config: rsp.result[0]
          });
        } else {
          callback && callback(false);
        }
      }
    });
  }
};

export const getQrCodeFromScreenResources = (callback?: (added: boolean) => void): ThunkAction<void, RootState, unknown, AnyAction> => {
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
        MessageChannel.invoke('main', 'service:desktop', {
          action: 'createTransparentWindow',
          params: qrs
        }).then(() => {
          values.forEach(value => {
            dispatch(parseClipboardText(value));
          });
        });
        callback && callback(!!qrs.length);
      } else {
        callback && callback(false);
      }
    });
  }
};

/* parse and get ss/ssr config from clipboard */
export const addConfigFromClipboard =
  (callback: (added: boolean) => void): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    dispatch(parseClipboardText(null, callback));
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

export const removeConfig = (id: string, config: Config) => {
  return {
    type: REMOVE_CONFIG,
    id,
    config
  };
};

export const editConfig = (id: string, config: Config) => {
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

export type AddConfigAction = ReturnType<typeof addConfig>;
export type RemoveConfigAction = ReturnType<typeof removeConfig>;
export type EditConfigAction = ReturnType<typeof editConfig>;
