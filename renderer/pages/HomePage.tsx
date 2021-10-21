import { MessageChannel } from 'electron-re';
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  Container,
} from "@material-ui/core";
import { useTranslation } from 'react-i18next';
import SyncIcon from '@material-ui/icons/Sync';
import uuid from "uuid/v1";

import { Config, closeOptions } from "../types";
import { useTypedSelector } from "../redux/reducers";
import useSnackbarAlert from '../hooks/useSnackbarAlert';
import useDialogConfirm from '../hooks/useDialogConfirm';
import useBackDrop from '../hooks/useBackDrop';
import { addConfigFromClipboard, generateUrlFromConfig, getQrCodeFromScreenResources } from '../redux/actions/config';
import {
  ADD_CONFIG,
  EDIT_CONFIG,
  REMOVE_CONFIG
} from "../redux/actions/config";
import { setHttpAndHttpsProxy, SET_SETTING } from "../redux/actions/settings";
import { useStylesOfHome as useStyles } from "./styles";
import { getConnectionDelay, startClientAction } from '../redux/actions/status';

import ServerList from "../components/ServerList";
import FooterBar from '../components/FooterBar';
import AddServerDialog from "../components/AddServerDialog";
import ConfShareDialog from '../components/ConfShareDialog';
import EditServerDialog from "../components/EditServerDialog";
import StatusBar from '../components/StatusBar';
import StatusBarConnection from '../components/BarItems/StatusBarConnection';
import StatusBarNetwork from '../components/BarItems/StatusBarNetwork';

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

  const [SnackbarAlert, setSnackbarMessage] = useSnackbarAlert();
  const [DialogConfirm, showDialog, closeDialog] = useDialogConfirm();
  const [BackDrop, setBackDrop] = useBackDrop();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareData, setShareData] = useState({
    url: '',
    dataUrl: ''
  });
  const [editServerDialogOpen, setEditServerDialogOpen] = useState(false);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [removingServerId, setRemovingServerId] = useState<string | null>(null);

  {/* -------- functions ------- */}

  const handleServerSelect = useCallback((id: string) => {
    dispatch({
      type: SET_SETTING,
      key: "selectedServer",
      value: id
    });
  }, []);

  const handleDialogClose = (selection?: closeOptions) => {
    switch (selection) {
      case 'manual':
        setDialogOpen(false);
        setEditServerDialogOpen(true);
        break;
      case 'qrcode':
        setBackDrop(true);
        dispatch(getQrCodeFromScreenResources((added: boolean) => {
          setTimeout(() => {
            setBackDrop(false);
            setSnackbarMessage(added ? t('added_a_server') : t('no_qr_code_is_detected') )
          }, .5e3);
        }));
        setDialogOpen(false);
        break;
      case 'url':
        setDialogOpen(false);
        setBackDrop(true);
        dispatch(addConfigFromClipboard((added: boolean) => {
          setTimeout(() => {
            setBackDrop(false);
            setSnackbarMessage(added ? t('added_a_server') : t('invalid_operation') )
          }, .5e3);
        }));
        break;
      case 'share':
        setShareDialogOpen(false);
        break;
      default:
        setDialogOpen(false);
        break;
    }
  };

  const handleEditServer = (values: Config | null) => {
    setEditServerDialogOpen(false);
    if (values) {
      if (!editingServerId) {
        dispatch({ type: ADD_CONFIG, config: values, id: uuid() });
        setSnackbarMessage(t("added_a_server"));
      } else {
        dispatch({
          type: EDIT_CONFIG,
          config: values,
          id: values.id
        });
        setSnackbarMessage(t("edited_a_server"));
      }
    }

    setEditingServerId(null);
  };

  const handleEditServerDialogClose = () => {
    setEditServerDialogOpen(false);
    setEditingServerId(null);
  };

  const handleServerConnect = useCallback(async (useValue?: string) => {
    const value = useValue === undefined ? selectedServer : useValue;
    let conf: Config | undefined;
    if (value) {
      if (selectedServer) {
        if (connected) {
          await MessageChannel.invoke('main', 'service:main', {
            action: 'stopClient',
            params: {}
          });
        } else {
          conf = config.find(i => i.id === value);
          if (conf) {
            dispatch(getConnectionDelay(conf.serverHost, conf.serverPort));
            dispatch(
              startClientAction(
                conf,
                settings,
                t('warning'),
                t('the_local_port_is_occupied')
              )
            );
          }
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }, [selectedServer, connected, config, settings]);

  const handleShareButtonClick = useCallback((id: string) => {
    const conf = config.find(item => item.id === id);
    if (!conf) return;
    setShareDialogOpen(true);
    generateUrlFromConfig(conf)
      .then(rsp => {
        if (rsp.code === 200) {
          setShareData({
            url: rsp.result.url,
            dataUrl: rsp.result.dataUrl
          });
        }
      });
    },
    [config]
  );

  const handleEditButtonClick = useCallback((id: string) => {
    setEditingServerId(id);
    setEditServerDialogOpen(true);
  }, []);

  const handleRemoveButtonClick = useCallback((id: string) => {
    if (id === selectedServer) {
      setSnackbarMessage(t('cannot_remove_selected_server'));
      return;
    }

    setRemovingServerId(id);
    showDialog(t('remove_this_server?'), t('this_action_cannot_be_undone'));
  }, [selectedServer]);

  const handleServerRemove = () => {
    dispatch({
      type: REMOVE_CONFIG,
      config: null as any,
      id: removingServerId!
    });
    setSnackbarMessage(t("removed_a_server"));

    closeDialog();
    setRemovingServerId(null);
  };

  const handleAlertDialogClose = () => {
    closeDialog()
    setRemovingServerId(null);
  };

  {/* -------- hooks ------- */}

  useEffect(() => {
    setTimeout(() => {
      if (!connected) {
        dispatch(
          startClientAction(
            config.find(i => i.id === selectedServer),
            settings,
            t('warning'),
            t('the_local_port_is_occupied')
          )
        );
      }

      if (settings.httpProxy.enable) {
        setHttpAndHttpsProxy({
          ...settings.httpProxy,
          type: 'http',
          proxyPort: settings.localPort
        });
      }

      if (settings.httpsProxy.enable) {
        setHttpAndHttpsProxy({
          ...settings.httpsProxy,
          type: 'https',
          proxyPort: settings.localPort
        });
      }

    }, 500);

  }, [])

  useEffect(() => {
    (async () => {
      if (selectedServer && connected) {
        let conf = config.find(i => i.id === selectedServer);
        if (conf) {
          dispatch(getConnectionDelay(conf.serverHost, conf.serverPort));
          dispatch(
            startClientAction(
              conf,
              settings,
              t('warning'),
              t('the_local_port_is_occupied')
            )
          );
        }
      }
    })();
  }, [config, selectedServer, settings]);

  return (
    <Container className={styles.container}>

      {/* -------- main ------- */}

      <ServerList
        config={config}
        selectedServer={selectedServer}
        connected={connected}
        handleShareButtonClick={handleShareButtonClick}
        handleEditButtonClick={handleEditButtonClick}
        handleRemoveButtonClick={handleRemoveButtonClick}
        handleServerSelect={handleServerSelect}
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
      <ConfShareDialog
        dataUrl={shareData.dataUrl}
        url={shareData.url}
        open={shareDialogOpen}
        onClose={handleDialogClose}
        children={undefined}
      />
      <EditServerDialog
        open={editServerDialogOpen}
        defaultValues={
          editingServerId ? config.find(i => i.id === editingServerId)! : null
        }
        children={undefined}
        onClose={handleEditServerDialogClose}
        onValues={handleEditServer}
      />
      <DialogConfirm onClose={handleAlertDialogClose} onConfirm={handleServerRemove} />
      { SnackbarAlert }
      <BackDrop />
    </Container>
  );
};

export default HomePage;
