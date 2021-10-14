import React, { useEffect } from "react";
import { MessageChannel } from 'electron-re';
import {
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  ListSubheader,
  TextField,
  Divider,
  Select,
  MenuItem
} from "@material-ui/core";
import { useTranslation } from 'react-i18next';

import { useTypedDispatch } from "../redux/actions";
import { useTypedSelector, CLEAR_STORE } from "../redux/reducers";
import { SET_SETTING, getStartupOnBoot, setStartupOnBoot, setHttpAndHttpsProxy } from "../redux/actions/settings";
import { backupConfigurationToFile, restoreConfigurationFromFile } from '../redux/actions/config';
import { Settings } from "../types";
import { getDefaultLang } from "../utils";
import { useStylesOfSettings as useStyles } from "./styles";
import useSnackbarAlert from "../hooks/useSnackbarAlert";
import useDialogConfirm from '../hooks/useDialogConfirm';

const SettingsPage: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation();

  const dispatch = useTypedDispatch();
  const settings = useTypedSelector(state => state.settings);
  const config = useTypedSelector(state => state.config);

  const [SnackbarAlert, setSnackbarMessage] = useSnackbarAlert({ duration: 1.5e3 });
  const [DialogConfirm, showDialog, closeDialog] = useDialogConfirm();

  useEffect(() => {
    dispatch(getStartupOnBoot());
  }, []);

  const backupConfiguration = () => {
    return backupConfigurationToFile({
      config,
      settings
    });
  };

  const restoreConfiguration = () => {
    dispatch(restoreConfigurationFromFile((success, code) => {
      if (success) {
        setSnackbarMessage(t('the_recovery_is_successful'));
      } else {
        setSnackbarMessage(code === 404 ? t('user_canceled') : t('the_recovery_is_failed'));
      }
    }));
  }

  const checkPortValid = (value: string) => {
    const parsedValue = parseInt(value.trim(), 10);
    if (!(parsedValue && parsedValue > 1024 && parsedValue <= 65535)) {
          setSnackbarMessage(t("invalid_port"));
          return false;
    }
    return true;
  }

  const handleValueChange = (
    key: keyof Settings,
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    let value: any = e.target.value;
    switch (key) {
      case 'localPort':
        if (!checkPortValid(value)) return;
        break;
      case 'pacPort':
        if (!checkPortValid(value)) return;
        break;
      case 'httpProxy':
        if (value == settings.httpsProxy.port) {
          setTimeout(() => {
            setSnackbarMessage(t("https_http_proxy_port_not_same"));
          }, 200);
          return;
        }
        value = {
          ...settings.httpProxy,
          port: value
        }
        break;
      case 'httpsProxy':
        if (settings.httpProxy.port == value) {
          setTimeout(() => {
            setSnackbarMessage(t("https_http_proxy_port_not_same"));
          }, 200);
          return;
        }
        value = {
          ...settings.httpsProxy,
          port: value
        }
        break;
      default:
        break;
    }

    dispatch({
      type: SET_SETTING,
      key,
      value: value
    });
  };

  const handleSwitchValueChange = (
    key: keyof Settings,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value: any = e.target.checked;
    switch (key) {
      case 'autoLaunch':
        dispatch(setStartupOnBoot(value));
        break;
      case 'httpProxy':
        value = {
          ...settings.httpProxy,
          enable: value
        };
        setHttpAndHttpsProxy({...value, type: 'http'});
        break;
      case 'httpsProxy':
        value = {
          ...settings.httpsProxy,
          enable: value
        };
        setHttpAndHttpsProxy({...value, type: 'https'});
        break;
      default:
        break;
    }
    dispatch({
      type: SET_SETTING, key,
      value: value
    });
  };

  const handleOpenLog = async () => {
    await MessageChannel.invoke('main', 'service:desktop', {
      action: 'openLogDir',
      params: {}
    });
  };

  const handleOpenProcessManager = async () => {
    await MessageChannel.invoke('main', 'service:desktop', {
      action: 'openProcessManager',
      params: {}
    });
  };

  const handleReset = () => {
    dispatch({
      type: CLEAR_STORE
    } as any);
    closeDialog();
    setSnackbarMessage(t('cleared_all_data'));
  };

  const handleAlertDialogOpen = () => {
    showDialog(t('reset_all_data'), t('reset_all_data_tips'));
  };

  const handleAlertDialogClose = () => {
    closeDialog();
  };

  const onLangChange = (e: React.ChangeEvent<{ name?: string | undefined, value: unknown; }>) => {
    if (localStorage.getItem('lang') === e.target.value) return;
    localStorage.setItem('lang', e.target.value as string);
    MessageChannel.invoke('main', 'service:desktop', {
      action: 'reloadMainWindow',
      params: {}
    });
  }

  return (
    <Container className={styles.container}>
      <TextField
        className={styles.textField}
        required
        fullWidth
        type="number"
        label={t('local_port')}
        placeholder={t('local_port_tips')}
        value={settings.localPort}
        onChange={e => handleValueChange("localPort", e)}
      />
      <TextField
        className={styles.textField}
        required
        fullWidth
        type="number"
        label={t('pac_port')}
        placeholder={t('pac_port_tips')}
        value={settings.pacPort}
        onChange={e => handleValueChange("pacPort", e)}
      />
      <TextField
        className={styles.textField}
        required
        fullWidth
        type="url"
        label={t('gfwlist_url')}
        placeholder={t('gfwlist_url_tips')}
        value={settings.gfwListUrl}
        onChange={e => handleValueChange("gfwListUrl", e)}
      />
      <List className={styles.list}>
        <ListItem>
            <ListItemText
              primary={t('http_proxy')}
              // secondary="Not applicable to Linux"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                color="primary"
                checked={settings.httpProxy.enable}
                onChange={e => handleSwitchValueChange("httpProxy", e)}
              />
            </ListItemSecondaryAction>
        </ListItem>
        {
          settings.httpProxy.enable && (
            <ListItem>
              <TextField
                className={styles.textField}
                required
                fullWidth
                type="number"
                label={t('http_proxy_port')}
                placeholder={t('http_proxy_port')}
                value={settings.httpProxy.port}
                onChange={e => handleValueChange("httpProxy", e)}
              />
            </ListItem>
          )
        }
        <ListItem>
            <ListItemText
              primary={t('https_proxy')}
              // secondary="Not applicable to Linux"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                color="primary"
                checked={settings.httpsProxy.enable}
                onChange={e => handleSwitchValueChange("httpsProxy", e)}
              />
            </ListItemSecondaryAction>
        </ListItem>
        {
          settings.httpsProxy.enable && (
            <ListItem>
              <TextField
                className={styles.textField}
                required
                fullWidth
                type="number"
                label={t('https_proxy_port')}
                placeholder={t('https_proxy_port')}
                value={settings.httpsProxy.port}
                onChange={e => handleValueChange("httpsProxy", e)}
              />
            </ListItem>
          )
        }
        <ListItem>
          <ListItemText
            primary={t('launch_on_boot')}
            // secondary="Not applicable to Linux"
          />
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              color="primary"
              checked={settings.autoLaunch}
              onChange={e => handleSwitchValueChange("autoLaunch", e)}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText
            primary={'Language'}
          />
          <ListItemSecondaryAction>
            <Select
              className={styles.formControl}
              value={getDefaultLang()}
              onChange={onLangChange}
              // variant="outlined"
            >
            <MenuItem value={'en-US'}>English</MenuItem>
            <MenuItem value={'zh-CN'}>中文简体</MenuItem>
          </Select>
          </ListItemSecondaryAction>
        </ListItem>
        <Divider className={styles.margin} />
        <ListSubheader>{t('debugging')}</ListSubheader>
        <ListItem>
          <ListItemText
            primary="Verbose"
            secondary={t('verbose_output')}
          />
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              color="primary"
              checked={settings.verbose}
              onChange={e => handleSwitchValueChange("verbose", e)}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem button onClick={backupConfiguration}>
            <ListItemText primary={t('backup')} />
        </ListItem>
        <ListItem button onClick={() => restoreConfiguration()}>
            <ListItemText primary={t('restore')} />
        </ListItem>
        <ListItem button onClick={handleOpenLog}>
          <ListItemText primary={t('open_log_dir')} />
        </ListItem>
        <ListItem button onClick={handleOpenProcessManager}>
          <ListItemText primary={t('open_process_manager')} />
        </ListItem>
        <ListItem button onClick={handleAlertDialogOpen}>
          <ListItemText primary={t('reset_data')} />
        </ListItem>
      </List>
      <DialogConfirm onClose={handleAlertDialogClose} onConfirm={handleReset} />
      {SnackbarAlert}
    </Container>
  );
};

export default SettingsPage;
