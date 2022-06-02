import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import { MessageChannel } from 'electron-re';

import { Settings, RootState, ActionRspText } from "../../types";
import { enqueueSnackbar } from './notifications';

export const SET_SETTING = "SET_SETTING";
export const OVERRIDE_SETTING = "OVERRIDE_SETTING";

export function setSetting<T extends keyof Settings>(
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

export const setHttpProxy = (
  params: {
    enable: boolean, port: number,
    proxyPort: number
  }) => {
  const { enable, port, proxyPort } = params;
  const action = `${enable ? 'start' : 'stop'}HttpProxyServer`
  MessageChannel
    .invoke('main', 'service:main', {
      action: action,
      params: { port, proxyPort }
    });
}

export const setPacServer = (
  params: {
    enable: boolean,
    pacPort: number
  }) => {
  const { enable, pacPort } = params;
  const action = `${enable ? 'start' : 'stop'}PacServer`
  MessageChannel
    .invoke('main', 'service:main', {
      action: action,
      params: { pacPort }
    });
}

export const setAclUrl = (info: ActionRspText): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    return MessageChannel.invoke('main', 'service:desktop', {
      action: 'setAclUrl',
      params: {}
    }).then(rsp => {
      if (rsp.code === 200) {
        dispatch(setSetting<'acl'>('acl', {
          enable: true,
          url: rsp.result
        }));
        dispatch(enqueueSnackbar(info.success, { variant: "success" }));
      } else {
        dispatch(enqueueSnackbar(info.error[rsp.code] ?? info.error.default, { variant: "warning" }));
      }
    });
  }
}

export type SetAction = ReturnType<typeof setSetting>;
export type OverAction = ReturnType<typeof overrideSetting>;
