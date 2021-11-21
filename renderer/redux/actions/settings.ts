import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import { MessageChannel } from 'electron-re';

import { Settings, RootState } from "../../types";


export const SET_SETTING = "SET_SETTING";
export const OVERRIDE_SETTING = "OVERRIDE_SETTING";

export function setSetting<T extends (keyof Settings), Settings>(
  key: T,
  value: Settings[T]
) {
  return {
    type: SET_SETTING,
    key,
    value
  };
}

export function overrideSetting (
  T: Settings
) {
  return {
    type: OVERRIDE_SETTING,
    value: T
  };
}

export const getStartupOnBoot = (): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    MessageChannel
      .invoke('main', 'service:desktop', {
        action: 'getStartupOnBoot'
      })
      .then(rsp => {
        if (rsp.code === 200) {
          dispatch({
            type: SET_SETTING,
            key: 'autoLaunch',
            value: !!rsp.result
          });
        }
      });
  }
}

export const setStartupOnBoot = (on: boolean): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    MessageChannel
      .invoke('main', 'service:desktop', {
        action: 'setStartupOnBoot',
        params: on
      })
      .then(rsp => {
        if (rsp.code === 200) {
          dispatch(getStartupOnBoot());
        }
      });
  }
}

export const setHttpAndHttpsProxy = (
  params: {
    enable: boolean, port: number,
    type: 'https' | 'http',
    proxyPort: number
  }) => {
  const { enable, type, port, proxyPort } = params;
  if (type === 'http') {
    const action = `${enable ? 'start' : 'stop'}HttpProxyServer`
    MessageChannel
      .invoke('main', 'service:main', {
        action: action,
        params: { port, proxyPort }
      });
  };
}
export type SetSettingAction = ReturnType<typeof setSetting>;
