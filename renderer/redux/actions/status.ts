import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { MessageChannel } from 'electron-re';

import { Status, RootState, Config, Settings } from "../../types";

export const SET_STATUS = "SET_STATUS";

export function setStatus<T extends keyof Status>(key: T, value: Status[T]) {
  return {
    type: SET_STATUS,
    key,
    value
  };
};

export const getConnectionStatus = (callback: (status: boolean) => void) => {
  MessageChannel.invoke('main','service:main', {
    action: 'isConnected',
    params: {}
  }).then(rsp => {
    if (rsp.code === 200) {
      callback?.(rsp.result);
    } else {
      callback?.(false);
    }
  })
};

export const getConnectionStatusAction = (): ThunkAction<void, RootState, unknown, AnyAction> => {
    return (dispatch) => {
      getConnectionStatus((status) => {
        dispatch({
          type: SET_STATUS,
          key: "connected",
          value: status
        });
      })
    };
};

export const getConnectionDelay = (host: string, port: number): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    dispatch(setStatus('loading', true));
    MessageChannel.invoke('main', 'service:main', {
      action: 'tcpPing',
      params: {
        host, port
      }
    })
    .then(rsp => {
      if (rsp.code === 200) {
        dispatch(setStatus('delay', rsp.result.ave));
      }
    }).finally(() => {
      setTimeout(() => {
        dispatch(setStatus('loading', false));
      }, 1e3);
    });
  };
};

export const startClientAction =
  (config: Config | undefined, settings: Settings, warningTitle: string, warningBody: string):
    ThunkAction<void, RootState, unknown, AnyAction> => {
      return (dispatch) => {
        dispatch(setStatus('waiting', true));
        MessageChannel.invoke('main', 'service:main', {
          action: 'startClient',
          params: {
            config,
            settings
          }
        }).then(rsp => {
          dispatch(setStatus('waiting', false));
          dispatch(getConnectionStatusAction());
          if (rsp.code === 600 && rsp.result.isInUse) {
            MessageChannel.invoke('main', 'service:desktop', {
              action: 'openNotification',
              params: {
                title: warningTitle,
                body: warningBody
              }
            });
          }
        });
      }
}

export type SetStatusAction = ReturnType<typeof setStatus>;
