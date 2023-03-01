import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import jsqr from 'jsqr';
import { v4 as uuidV4 } from 'uuid';
import { MessageChannel } from 'electron-re';
import i18n from 'i18next';
import { clipboard } from 'electron';

import { Message } from '@renderer/hooks/useNotifier';
import { findAndCallback, getScreenCapturedResources } from '@renderer/utils';
import {
  ActionRspText, ALGORITHM,
  Config, GroupConfig,
  RootState, Settings
} from '@renderer/types';

import { overrideSetting, setSetting } from './settings';
import { setStatus, getConnectionStatusAction } from './status';

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
  return () => {
    MessageChannel.invoke('main', 'service:desktop', {
      action: 'backupConfigurationToFile',
      params
    }).then(rsp => {
      if (rsp.code === 200) {
        return Message.success(info.success);
      }
      Message.warning(info.error[rsp.code] ?? info.error.default);
    });
  }
}

export const restoreConfigurationFromFile =
  (info: ActionRspText, callback?: (conf: any) => void): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    MessageChannel.invoke('main', 'service:desktop', {
      action: 'restoreConfigurationFromFile',
      params: {}
    })
    .then((rsp) => {
      if (rsp.code === 200) {
        Message.success(info.success);
        dispatch(wipeConfig());
        if (rsp.result.config?.length) {
          rsp.result.config.forEach((conf: Config) => {
            dispatch(addConfig(conf.id, conf))
          });
        }
        if (rsp.result.settings) {
          dispatch(overrideSetting(rsp.result.settings));
        }
        callback && callback(rsp.result);
      } else {
        Message.warning(info.error[rsp.code] ?? info.error.default);
      }
    });
  }
}

export const updateSubscription = (id: string, url: string): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    dispatch(setStatus('waiting', true));
    MessageChannel.invoke('main', 'service:main', {
      action: 'parseSubscriptionURL',
      params: {
        text: url,
      },
    })
    .then((rsp) => {
      if (rsp.code !== 200) {
        throw new Error(rsp.result ?? i18n.t<string>('failed_to_update_subscription'));
      }
      if (rsp.result?.result?.length) {
        dispatch(updateSubscriptionAction(id, 'id', {
          name: rsp.result.name || 'new subscription',
          servers: (rsp.result.result as Config[]).map(server => {
            server.id = uuidV4();
            return server;
          }),
        }));
        return Message.success(i18n.t<string>('subscription_updated'));
      }
      Message.warning(i18n.t<string>('invalid_parameter'));
    })
    .catch((error) => {
      Message.error(error.toString());
    })
    .finally(() => {
      setTimeout(() => dispatch(setStatus('waiting', false)), 1e3);
    });
  };
};

export const startClusterAction =
  (config: (GroupConfig | Config)[], id: string, settings: Settings): ThunkAction<void, RootState, unknown, AnyAction> => {
    return (dispatch) => {
      findAndCallback(config, id, (c: Config) => {
        const { servers: configs } = c as any;
        dispatch(setStatus('waiting', true));
        MessageChannel.invoke('main', 'service:main', {
          action: 'startCluster',
          params: {
            configs,
            settings: {
              ...settings,
              loadBalance: {
                ...settings.loadBalance,
                count: settings.loadBalance?.count ?? 3,
                strategy: settings.loadBalance?.strategy ?? ALGORITHM.POLLING
              }
            }
          }
        })
        .then((rsp) => {
          if (rsp.code !== 200) {
            return MessageChannel.invoke('main', 'service:desktop', {
              action: 'openNotification',
              params: {
                action: 'warning',
                body: rsp.result ?? i18n.t<string>('failed_to_enable_load_balance')
              }
            });
          }
          dispatch(setSetting('serverMode', 'cluster'));
          dispatch(setSetting('clusterId', id));
          Message.success(i18n.t<string>('successfully_enabled_load_balance'));
        })
        .catch((err) => {
          Message.error(err.toString());
        })
        .finally(() => {
          dispatch(setStatus('waiting', false));
        });
      });
    }
  }

export const stopClusterAction =
  (): ThunkAction<void, RootState, unknown, AnyAction> => {
    return (dispatch) => {
      MessageChannel.invoke('main', 'service:main', {
        action: 'stopCluster',
        params: {}
      })
        .then((rsp) => {
          if (rsp.code === 200) {
            dispatch(setSetting('serverMode', 'single'));
            dispatch(setSetting('clusterId', ''));
          } else {
            return Message.error(rsp.result);
          }
        });
    }
  }

export const startClientAction =
  (config: Config | undefined, settings: Settings):
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
          dispatch(setStatus('mode', 'single'));
          dispatch(setStatus('clusterId', ''));
          dispatch(setStatus('waiting', false));
          dispatch(getConnectionStatusAction());
          if (rsp.code !== 200) {
            MessageChannel.invoke('main', 'service:desktop', {
              action: 'openNotification',
              params: {
                action: 'warning',
                body: rsp.result
              }
            });
          }
        });
      }
}

export const stopClientAction = (): ThunkAction<void, RootState, unknown, AnyAction> => {
  return () => {
    MessageChannel.invoke('main', 'service:main', {
      action: 'stopClient',
      params: {}
    }).then((rsp) => {
      if (rsp.code !== 200) {
        Message.error(rsp.result);
      }
    });
  };
};

export const parseServerURL = (text: string): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    dispatch(setStatus('waiting', true));
    MessageChannel.invoke('main', 'service:main', {
      action: 'parseServerURL',
      params: {
        text,
      }
    })
    .then((rsp) => {
      if (rsp.code !== 200) {
        throw new Error(rsp.result ?? i18n.t<string>('invalid_operation'));
      }
      if (rsp.result?.length) {
        dispatch(addConfig(uuidV4(), rsp.result[0]));
        Message.success(i18n.t<string>('added_a_server'));
      } else {
        Message.warning(i18n.t<string>('invalid_parameter'));
      }
    })
    .catch((error) => {
      Message.error(error.message);
    })
    .finally(() => {
      setTimeout(() => dispatch(setStatus('waiting', false)), 1e3);
    });
  };
};

export const parseSubscriptionURL = (text: string): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    dispatch(setStatus('waiting', true));
    MessageChannel.invoke('main', 'service:main', {
      action: 'parseSubscriptionURL',
      params: {
        text,
      }
    })
    .then((rsp) => {
      if (rsp.code !== 200) {
        throw new Error(rsp.result ?? i18n.t<string>('invalid_operation'));
      }
      if (rsp.result?.result?.length) {
        dispatch(addSubscription(uuidV4(), rsp.result.url, {
          name: rsp.result.name || 'New subscription',
          servers: (rsp.result.result as Config[]).map(server => {
            server.id = uuidV4();
            return server;
          }),
        }));
        Message.success(i18n.t<string>('added_a_subscription_server_group'));
      } else {
        Message.warning(i18n.t<string>('invalid_parameter'));
      }
    })
    .catch((error) => {
      Message.error(error.message);
    })
    .finally(() => {
      setTimeout(() => dispatch(setStatus('waiting', false)), 1e3);
    });
  };
}

export const getQrCodeFromScreenResources = (): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    dispatch(setStatus('waiting', true))
    getScreenCapturedResources().then((resources: Electron.DesktopCapturerSource[]) => {
      if (!resources?.length) {
        return Message.warning(i18n.t<string>('no_qr_code_is_detected'));
      }
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

      if (!qrs.length) {
        return Message.warning(i18n.t<string>('no_qr_code_is_detected'));
      }

      return MessageChannel.invoke('main', 'service:desktop', {
        action: 'createTransparentWindow',
        params: qrs
      }).then(() => {
        values.forEach(value => {
          dispatch(parseServerURL(value));
        });
      });
    }).catch((error) => {
      Message.error(error && error.toString());
    }).finally(() => {
      setTimeout(() => dispatch(setStatus('waiting', false)), 1e3);
    });
  };
};

export const parseServerGroup =
  (text: string | string[], groupId: string, groupName: string): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    dispatch(setStatus('waiting', true));
    MessageChannel.invoke('main', 'service:main', {
      action: 'parseServerGroup',
      params: { text },
    }).then((rsp) => {
      if (rsp.code !== 200) {
        return Message.error(rsp.result);
      }
      if (rsp.result?.length) {
        dispatch(addSubscription(groupId || uuidV4(), '', {
          name: groupName || 'New server group',
          servers: (rsp.result as Config[]).map(server => {
            server.id = uuidV4();
            return server;
          }),
        }));
        return Message.success(`${i18n.t('server_group_added')}: ${groupName}`);
      }
      Message.warning(`${i18n.t('fail_to_parse_server_group')}: ${groupName}`);
    }).finally(() => {
      dispatch(setStatus('waiting', false));
    });
  }
};

export const updateServerGroup =
(text: string | string[], groupId: string, groupName: string): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    const searchKey = groupId ? 'id' : (groupName ? 'name' : '');
    if (!searchKey) return;

    dispatch(setStatus('waiting', true));
    MessageChannel.invoke('main', 'service:main', {
      action: 'parseServerGroup',
      params: { text },
    }).then((rsp) => {
      if (rsp.code !== 200) {
        return Message.error(rsp.result);
      }
      if (rsp.result?.length) {
        dispatch(updateSubscriptionAction(groupId, searchKey, {
          name: groupName || 'New server group',
          servers: (rsp.result as Config[]).map(server => {
            server.id = uuidV4();
            return server;
          }),
        }));
        return Message.success(`${i18n.t('server_group_updated')}: ${groupName}`);
      }
      Message.warning(`${i18n.t('fail_to_parse_server_group')}: ${groupName}`);
    }).finally(() => {
      dispatch(setStatus('waiting', false));
    });
  }
};

/* parse and get ss/ssr config from clipboard */
export const addConfigFromClipboard = (): ThunkAction<void, RootState, unknown, AnyAction> => {
  return (dispatch) => {
    const text = clipboard.readText('clipboard');
    dispatch(parseServerURL(text));
  }
};

export const addSubscriptionFromClipboard = (): ThunkAction<void, RootState, unknown, AnyAction> => {
    return (dispatch) => {
      const text = clipboard.readText('clipboard');
      dispatch(parseSubscriptionURL(text));
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

export const updateSubscriptionAction = (id: string, searchKey: 'id' | 'name', config: PartialGroupConfig) => {
  return {
    type: UPDATE_SUBSCRIPTION,
    id,
    searchKey,
    config,
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
export type UpdateSubscriptionAction = ReturnType<typeof updateSubscriptionAction>;
