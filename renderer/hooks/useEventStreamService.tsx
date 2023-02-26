import { useCallback, useEffect } from 'react'
import { clipboard } from 'electron';
import useBus, { EventAction, dispatch as dispatchEvent } from 'use-bus';
import { useDispatch } from 'react-redux';

import {
  addConfigFromClipboard,
  addSubscriptionFromClipboard,
  parseServerGroup,
  startClientAction,
  startClusterAction,
  stopClientAction,
  stopClusterAction,
  updateServerGroup,
} from '@renderer/redux/actions/config';
import { useTypedSelector } from '@renderer/redux/reducers';
import { Config, GroupConfig, ServerMode, Notification } from '@renderer/types';
import { findAndCallback } from '@renderer/utils';
import { getConnectionDelay } from '@renderer/redux/actions/status';
import { setHttpProxy, setPacServer } from '@renderer/redux/actions/settings';
import { Message } from '@renderer/hooks';

export const useEventStreamService = () => {
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
        dispatch(startClusterAction(config, clusterId, settings));
      }
    } else {
      selectedServer && connectedToServer(config, selectedServer);
    }
  }, [config, selectedServer, mode, serverMode, clusterId, settings]);

  useBus('event:stream:notifycation', (event: EventAction) => {
    const {
      message,
      type,
    } = event.payload as { message: string; type: Notification['variant'] };

    Message.default(message, {
      variant: type || 'default',
    });
  }, []);

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
    dispatch(addConfigFromClipboard());
  }, []);

  useBus('event:stream:add-subscription', (event: EventAction) => {
    clipboard.writeText(event.payload);
    dispatch(addSubscriptionFromClipboard());
  }, []);

  useBus('event:stream:add-server-group', (event: EventAction) => {
    const payload: { text: string, name: string } = event.payload;
    dispatch(parseServerGroup(payload.text, '', payload.name));
  }, []);

  useBus('event:stream:update-server-group', (event: EventAction) => {
    const payload: { text: string, name: string } = event.payload;
    dispatch(updateServerGroup(payload.text, '', payload.name));
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
    const enableParam = event.payload?.enable ?? settings.mode === 'PAC' // undefined

    dispatch(
      setPacServer({
        pacPort: settings.pacPort,
        enable: enableParam
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
