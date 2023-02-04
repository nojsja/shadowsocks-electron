import { useCallback, useEffect } from 'react'
import { clipboard } from 'electron';
import useBus, { EventAction, dispatch as dispatchEvent } from 'use-bus';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import {
  addConfigFromClipboard,
  startClientAction,
  startClusterAction,
  stopClientAction,
  stopClusterAction,
} from '@renderer/redux/actions/config';
import { useTypedSelector } from '@renderer/redux/reducers';
import { Config, GroupConfig, ServerMode } from '@renderer/types';
import { findAndCallback } from '@renderer/utils';
import { getConnectionDelay } from '@renderer/redux/actions/status';
import { setHttpProxy, setPacServer } from '@renderer/redux/actions/settings';

export const useEventStreamService = () => {
  const { t } =  useTranslation();
  const dispatch = useDispatch();
  const settings = useTypedSelector(state => state.settings);
  const config = useTypedSelector(state => state.config);
  const selectedServer = useTypedSelector(
    state => state.settings.selectedServer
  );
  const mode = useTypedSelector(state => state.settings.mode);
  const {serverMode, clusterId} = settings;

  const connectedToServer = (config: (Config | GroupConfig)[], selectedServer: string, useConfig?: Config) => {
    findAndCallback(config, selectedServer, (c: Config) => {
      const conf = useConfig || c;
      dispatch(getConnectionDelay(conf.serverHost, conf.serverPort));
      dispatch(
        startClientAction(
          conf,
          settings,
        )
      )});
  };

  const connectByMode = useCallback((mode?: ServerMode) => {
    const modeToConnect = mode ?? serverMode;
    if (modeToConnect === 'cluster') {
      if (clusterId) {
        dispatch(startClusterAction(config, clusterId, settings, {
          success: t('successfully_enabled_load_balance'),
          error: { default: t('failed_to_enable_load_balance') }
        }));
      }
    } else {
      selectedServer && connectedToServer(config, selectedServer);
    }
  }, [config, selectedServer, mode, serverMode, clusterId, settings]);

  useBus('event:stream:disconnect-server', () => {
    if (serverMode === 'cluster') {
      dispatch(stopClusterAction());
    } else {
      dispatch(stopClientAction());
    }
  }, [connectByMode, serverMode]);

  useBus('event:stream:reconnect-server', () => {
    connectByMode();
  }, [connectByMode]);

  useBus('event:stream:add-server', (event: EventAction) => {
    clipboard.writeText(event.payload);
    dispatch(addConfigFromClipboard({
      success: t('added_a_server'),
      error: { default: t('invalid_operation') }
    }));
  }, []);

  useBus('event:stream:reconnect-http', () => {
    selectedServer && dispatch(
      setHttpProxy({
        ...settings.httpProxy,
        proxyPort: settings.localPort
      })
    );
  }, [settings, selectedServer]);

  useBus('event:stream:reconnect-pac', (event: EventAction) => {
    if (!selectedServer) return;
    const enableStatus = event.payload?.enable;

    dispatch(
      setPacServer({
        pacPort: settings.pacPort,
        enable:
          enableStatus === true
            ? true
            : enableStatus === false
              ? false
              : settings.mode === 'PAC'
      })
    );
  }, [settings, selectedServer]);

  useEffect(() => {
    setTimeout(() => {
      dispatchEvent('event:stream:reconnect-server');
      dispatchEvent('event:stream:reconnect-http');
      dispatchEvent('event:stream:reconnect-pac');
    }, 2e3);
  }, []);

  return null;
};

export default useEventStreamService;
