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
import { SET_SETTING, getStartupOnBoot, setStartupOnBoot } from "../redux/actions/settings";
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

  const handleValueChange = (
    key: keyof Settings,
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (key === "localPort" || key === "pacPort") {
      const value = parseInt(e.target.value.trim(), 10);
      if (!(value && value > 1024 && value <= 65535)) {
        setSnackbarMessage(t("invalid_port"));
        return;
      }
    }

    dispatch({
      type: SET_SETTING,
      key,
      value: e.target.value
    });
  };

  const handleSwitchValueChange = (
    key: keyof Settings,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch({
      type: SET_SETTING,
      key,
      value: e.target.checked
    });

    if (key === "autoLaunch") {
      dispatch(setStartupOnBoot(e.target.checked));
    }
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
