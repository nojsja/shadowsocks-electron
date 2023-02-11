import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  Container,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { v4 as uuidV4 } from 'uuid';

import { useTypedSelector } from '@renderer/redux/reducers';
import {
  addConfigFromClipboard,
  getQrCodeFromScreenResources,
  ADD_CONFIG,
  EDIT_CONFIG,
  addSubscriptionFromClipboard,
  startClusterAction,
  startClientAction,
  stopClientAction,
} from '@renderer/redux/actions/config';
import { getConnectionDelay } from '@renderer/redux/actions/status';
import useDidUpdate from '@renderer/hooks/useDidUpdate';
import { Message } from '@renderer/hooks/useNotifier';

import { findAndCallback } from '@renderer/utils';
import {
  Config, CloseOptions, GroupConfig,
  ServerMode,
} from '@renderer/types';

import FooterBar from '@renderer/components/FooterBar';
import StatusBar from '@renderer/components/StatusBar';

import ServerList from './home/ServerList';
import AddServerDialog from './home/AddServerDialog';
import EditServerDialog from './home/EditServerDialog';

import { useStylesOfHome as useStyles } from './styles';

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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editServerDialogOpen, setEditServerDialogOpen] = useState(false);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const {serverMode, clusterId} = settings;

  /* -------- hooks ------- */

  /* do connect by mode */
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

  /* reconnect when settings/selected update */
  useDidUpdate(() => {
    if (!selectedServer || !connected) return;
    connectByMode('single');
  }, [selectedServer]);

  useDidUpdate(() => {
    if (!selectedServer || !connected) return;
    connectByMode();
  }, [mode]);

  /* -------- functions ------- */

  const handleDialogClose = (selection?: CloseOptions) => {
    setDialogOpen(false);

    switch (selection) {
      case 'manual':
        setEditServerDialogOpen(true);
        break;
      case 'qrcode':
        dispatch(getQrCodeFromScreenResources({
          success: t('added_a_server'),
          error: { default: t('no_qr_code_is_detected') },
        }));
        break;
      case 'url':
        dispatch(addConfigFromClipboard({
          success: t('added_a_server'),
          error: { default: t('invalid_operation') }
        }));
        break;
      case 'subscription':
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
      const id = uuidV4();
      dispatch({ type: ADD_CONFIG, config: values, id });
      selectedServer === id && connectedToServer(config, id, values);
      Message.success(t("added_a_server"));
    } else {
      dispatch({
        type: EDIT_CONFIG,
        config: values,
        id: values.id
      });
      selectedServer === values.id && connectedToServer(config, values.id, values);
      Message.success(t("edited_a_server"));
    }
  };

  const handleEditServerDialogClose = (event: any, reason: "backdropClick" | "escapeKeyDown") => {
    if (reason === 'backdropClick') return;

    setEditServerDialogOpen(false);
    setEditingServerId(null);
  };

  const handleServerConnect = useCallback(async (useValue?: string) => {
    const value = useValue === undefined ? selectedServer : useValue;
    if (!value || !selectedServer) return
    if (connected) {
      if (settings.serverMode === 'single') {
        dispatch(stopClientAction());
      }
    } else {
      findAndCallback(config, value, (conf: Config) => {
        dispatch(getConnectionDelay(conf.serverHost, conf.serverPort));
        dispatch(
          startClientAction(
            conf,
            settings,
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
        )
      )});
  };

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

      <StatusBar/>

      {/* -------- dialog ------- */}

      <AddServerDialog
        open={dialogOpen}
        onClose={handleDialogClose}
      />
      <EditServerDialog
        open={editServerDialogOpen}
        defaultValues={
          editingServerId ? findAndCallback(config, editingServerId) as Config : null
        }
        onClose={handleEditServerDialogClose}
        onValues={handleEditServer}
      />
    </Container>
  );
};

export default HomePage;
