import { MessageChannel } from 'electron-re';
import React, { useState, useEffect, useCallback } from "react";
import useBus, { EventAction } from 'use-bus';
import { useDispatch } from "react-redux";
import {
  Container,
} from "@material-ui/core";
import { useTranslation } from 'react-i18next';
import SyncIcon from '@material-ui/icons/Sync';
import uuid from "uuid/v1";
import { SnackbarMessage } from 'notistack';

import { enqueueSnackbar as enqueueSnackbarAction } from '../redux/actions/notifications';
import { Config, CloseOptions, GroupConfig, Notification } from "../types";
import { useTypedSelector } from "../redux/reducers";
// import useBackDrop from '../hooks/useBackDrop';
import {
  addConfigFromClipboard, getQrCodeFromScreenResources,
  ADD_CONFIG, EDIT_CONFIG,
  addSubscriptionFromClipboard
} from '../redux/actions/config';
import { setHttpProxy, setPacServer } from "../redux/actions/settings";
import { getConnectionDelay, startClientAction } from '../redux/actions/status';

import { findAndCallback } from '../utils';
import * as globalAction from '../hooks/useGlobalAction';
import useDidUpdate from '../hooks/useDidUpdate';

import FooterBar from '../components/FooterBar';
import StatusBar from '../components/StatusBar';
import StatusBarConnection from '../components/BarItems/StatusBarConnection';
import StatusBarNetwork from '../components/BarItems/StatusBarNetwork';

import ServerList from "./home/ServerList";
import AddServerDialog from "./home/AddServerDialog";
import EditServerDialog from "./home/EditServerDialog";

import { useStylesOfHome as useStyles } from "./styles";

/**
 * HomePage
 * @returns React.FC
 */
const HomePage: React.FC = () => {
  const styles = useStyles();
  const { t } =  useTranslation();

  const dispatch = useDispatch();
  const config = useTypedSelector(state => state.config);
  const selectedServer = useTypedSelector(
    state => state.settings.selectedServer
  );
  const mode = useTypedSelector(state => state.settings.mode);
  const settings = useTypedSelector(state => state.settings);
  const connected = useTypedSelector(state => state.status.connected);
  const delay = useTypedSelector(state => state.status.delay);
  const loading = useTypedSelector(state => state.status.loading);

  // const [BackDrop, setBackDrop] = useBackDrop();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editServerDialogOpen, setEditServerDialogOpen] = useState(false);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);

  {/* -------- hooks ------- */}

  /* reconnect after get event from queue */
  useBus('action:get:reconnect-server', (event: EventAction) => {
    selectedServer && connectedToServer(config, selectedServer);
  }, [config, selectedServer]);

  useBus('action:get:reconnect-http', (event: EventAction) => {
    selectedServer && setHttpProxy({
      ...settings.httpProxy,
      proxyPort: settings.localPort
    });
  }, [settings, selectedServer]);

  useBus('action:get:reconnect-pac', (event: EventAction) => {
    if (!selectedServer) return;

    setPacServer({
      pacPort: settings.pacPort,
      enable:
        event.payload?.enable === true
          ? true
          : event.payload?.enable === false
          ? false
          : settings.mode === 'PAC'
    });
  }, [settings, selectedServer]);

  /* status checker on mount */
  useEffect(() => {
    if (!selectedServer) return;

    setTimeout(() => {
      /* check reconnect event of queue */
      globalAction.get({ type: 'reconnect-server' });
      globalAction.get({ type: 'reconnect-http' });
      globalAction.get({ type: 'reconnect-pac' });
    }, 500);
  }, []);

  /* reconnect when settings/selected update */
  useDidUpdate(() => {
    if (!selectedServer || !connected) return;

    connectedToServer(config, selectedServer);
  }, [selectedServer, settings]);

  {/* -------- functions ------- */}

  const enqueueSnackbar = (message: SnackbarMessage, options: Notification) => {
    dispatch(enqueueSnackbarAction(message, options))
  };

  const handleDialogClose = (selection?: CloseOptions) => {
    setDialogOpen(false);

    switch (selection) {
      case 'manual':
        setEditServerDialogOpen(true);
        break;
      case 'qrcode':
        // setBackDrop.current(true);
        dispatch(getQrCodeFromScreenResources({
          success: t('added_a_server'),
          error: { default: t('no_qr_code_is_detected') },
        }));
        break;
      case 'url':
        // setBackDrop.current(true);
        dispatch(addConfigFromClipboard({
          success: t('added_a_server'),
          error: { default: t('invalid_operation') }
        }));
        break;
      case 'subscription':
        // setBackDrop.current(true);
        dispatch(addSubscriptionFromClipboard({
          success: t('added_a_server'),
          error: { default: t('invalid_operation') }
        }));
        break;
      default:
        break;
    }
  };

  const handleEditServer = (values: Config | null) => {
    setEditServerDialogOpen(false);
    setEditingServerId(null);
    if (!values) return;

    if (!editingServerId) {
      const id = uuid();
      dispatch({ type: ADD_CONFIG, config: values, id });
      selectedServer === id && connectedToServer(config, id, values);
      enqueueSnackbar(t("added_a_server"), { variant: 'success' });
    } else {
      dispatch({
        type: EDIT_CONFIG,
        config: values,
        id: values.id
      });
      selectedServer === values.id && connectedToServer(config, values.id, values);
      enqueueSnackbar(t("edited_a_server"), { variant: 'success' });
    }
  };

  const handleEditServerDialogClose = (event: {}, reason: "backdropClick" | "escapeKeyDown") => {
    if (reason === 'backdropClick') return;

    setEditServerDialogOpen(false);
    setEditingServerId(null);
  };

  const handleServerConnect = useCallback(async (useValue?: string) => {
    const value = useValue === undefined ? selectedServer : useValue;
    if (!value || !selectedServer) return
    if (connected) {
      await MessageChannel.invoke('main', 'service:main', {
        action: 'stopClient',
        params: {}
      });
    } else {
      findAndCallback(config, value, (conf: Config) => {
        dispatch(getConnectionDelay(conf.serverHost, conf.serverPort));
        dispatch(
          startClientAction(
            conf,
            settings,
            t('warning'),
            t('the_local_port_is_occupied')
          )
        );
      });
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, [selectedServer, connected, config, settings]);

  const handleEditButtonClick = useCallback((id: string) => {
    setEditingServerId(id);
    setEditServerDialogOpen(true);
  }, []);

  const connectedToServer = (config: (Config | GroupConfig)[], selectedServer: string, useConfig?: Config) => {
    findAndCallback(config, selectedServer, (c: Config) => {
      const conf = useConfig || c;
      dispatch(getConnectionDelay(conf.serverHost, conf.serverPort));
      dispatch(
        startClientAction(
          conf,
          settings,
          t('warning'),
          t('the_local_port_is_occupied')
        )
      )});
  }

  return (
    <Container className={styles.container}>

      {/* -------- main ------- */}

      <ServerList
        config={config}
        selectedServer={selectedServer}
        connected={connected}
        handleEditButtonClick={handleEditButtonClick}
        handleServerConnect={handleServerConnect}
      />

      <FooterBar mode={mode} setDialogOpen={setDialogOpen} />

      <StatusBar
        left={[
          <SyncIcon
            key="status_bar_rotate"
            fontSize='small'
            className={`${styles['loading-icon']} ${loading ? 'rotate' : ''}`}
          />,
          <StatusBarNetwork key="status_bar_network" delay={delay}/>
        ]}
        right={[
          <StatusBarConnection
            key="status_bar_connection"
            status={connected ? 'online' : 'offline'}
          />
          // <span key="status_bar_mode" className={styles['statu-sbar_modeinfo']}>{t(mode.toLowerCase())}</span>
        ]}
      />

      {/* -------- dialog ------- */}

      <AddServerDialog open={dialogOpen} onClose={handleDialogClose} children={undefined} />
      <EditServerDialog
        open={editServerDialogOpen}
        defaultValues={
          editingServerId ? findAndCallback(config, editingServerId) as Config : null
        }
        children={undefined}
        onClose={handleEditServerDialogClose}
        onValues={handleEditServer}
      />
    </Container>
  );
};

export default HomePage;
