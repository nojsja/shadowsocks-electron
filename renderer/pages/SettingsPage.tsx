import React, { useEffect, useState } from "react";
import { MessageChannel } from 'electron-re';
import {
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListSubheader,
  TextField,
  Divider,
  Select,
  MenuItem,
  Tooltip
} from "@material-ui/core";
import { RestorePage, NoteAdd } from '@material-ui/icons';
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
import { AdaptiveSwitch } from "../components/Pices/Switch";
import EditAclDialog from "../components/EditAclDialog";
import { getFirstLanguage } from "../i18n";
import { persistStore } from "../App";
import { TextWithTooltip } from "../components/Pices/TextWithTooltip";
import { setStatus } from "../redux/actions/status";

const SettingsPage: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation();

  const dispatch = useTypedDispatch();
  const settings = useTypedSelector(state => state.settings);
  const config = useTypedSelector(state => state.config);
  const [aclVisible, setAclVisible] = useState(false);
  const inputFileRef = React.useRef<HTMLInputElement>(null);
  const [SnackbarAlert, setSnackbarMessage] = useSnackbarAlert({ duration: 2e3 });
  const [DialogConfirm, showDialog, closeDialog] = useDialogConfirm();

  useEffect(() => {
    dispatch<any>(getStartupOnBoot());
  }, [dispatch]);

  useEffect(() => {
    if (
      (persistStore.get('darkMode') === 'true' && !settings.darkMode) ||
      (persistStore.get('darkMode') === 'false' && !!settings.darkMode) ||
      (persistStore.get('darkMode') === undefined && !!settings.darkMode)
    ) {
      persistStore.set('darkMode', !!settings.darkMode ? 'true' : 'false');
        MessageChannel.invoke('main', 'service:desktop', {
          action: 'reloadMainWindow',
          params: {}
        });
    }
  }, [settings.darkMode]);

  const backupConfiguration = () => {
    return backupConfigurationToFile({
      config,
      settings
    });
  };

  const restoreConfiguration = () => {
    dispatch<any>(restoreConfigurationFromFile((success, code) => {
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

  const checkPortUsed = (value: number, target: 'httpProxy', useValue?: boolean) => {
    if (
      useValue === undefined ?
      (value == settings[target].port &&
      settings.httpProxy.enable)
      :
      (value == settings[target].port &&
      settings[target].enable &&
      useValue)
    ) {
      setTimeout(() => {
        setSnackbarMessage(t("https_http_proxy_port_not_same"));
      }, 200);
      return false;
    }
    return true;
  };

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
        if (!checkPortUsed(value, 'httpProxy')) return;
        value = {
          ...settings.httpProxy,
          port: value
        }
        break;
      case 'acl':
        value = {
          ...settings.acl,
          text: value
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
        dispatch<any>(setStartupOnBoot(value));
        break;
      case 'httpProxy':
        // if (!checkPortUsed(settings.httpProxy.port, 'httpsProxy', value)) return;
        value = {
          ...settings.httpProxy,
          enable: value
        };
        setHttpAndHttpsProxy({...value, type: 'http', proxyPort: settings.localPort });
        break;
      case 'acl':
        value = {
          ...settings.acl,
          enable: value
        };
        // setHttpAndHttpsProxy({ ...value, type: 'http', proxyPort: settings.localPort });
        break;
      case 'darkMode':
        persistStore.set('darkMode', value ? 'true' : 'false');
        MessageChannel.invoke('main', 'service:desktop', {
          action: 'reloadMainWindow',
          params: {}
        });
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
    MessageChannel.invoke('main', 'service:main', {
      action: 'stopClient',
      params: {}
    });
    setSnackbarMessage(t('cleared_all_data'));
  };

  const handleAlertDialogOpen = () => {
    showDialog(t('reset_all_data'), t('reset_all_data_tips'));
  };

  const handleAlertDialogClose = () => {
    closeDialog();
  };

  const reGeneratePacFileWithFile = () => {
    inputFileRef.current?.click();
  }

  const reGeneratePacFileWithUrl = () => {
    reGeneratePacFile({
      url: settings.gfwListUrl
    });
  }

  const onGFWListFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const text = e.target.result;
        if (text) {
          reGeneratePacFile({
            text: text
          });
        }
      };
      reader.readAsText(file);
    }
  }

  const reGeneratePacFile = (params: { url?: string, text?: string }) => {
    dispatch<any>(setStatus('waiting', true));
    MessageChannel.invoke('main', 'service:main', {
      action: 'reGeneratePacFile',
      params
    }).then((rsp) => {
      setTimeout(() => { dispatch<any>(setStatus('waiting', false)); }, 1e3);
      if (rsp.code === 200) {
        setSnackbarMessage(t('successful_operation'));
      } else {
        setSnackbarMessage(t('failed_to_download_file'));
      }
    });
  }

  const onLangChange = (e: React.ChangeEvent<{ name?: string | undefined, value: unknown; }>) => {
    if (persistStore.get('lang') === e.target.value) return;
    persistStore.set('lang', e.target.value as string);
    MessageChannel.invoke('main', 'service:desktop', {
      action: 'reloadMainWindow',
      params: {}
    });
    MessageChannel.invoke('main', 'service:desktop', {
      action: 'setLocale',
      params: getFirstLanguage(e.target.value as string)
    });
  }

  return (
    <Container className={styles.container}>
      <TextField
        className={styles.textField}
        required
        fullWidth
        size="small"
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
        size="small"
        label={t('pac_port')}
        placeholder={t('pac_port_tips')}
        value={settings.pacPort}
        onChange={e => handleValueChange("pacPort", e)}
      />
      <input onChange={onGFWListFileChange} ref={inputFileRef} type={'file'} multiple={false} style={{ display: 'none' }}></input>
      <TextField
        className={styles.textField}
        required
        fullWidth
        type="url"
        size="small"
        label={
          <TextWithTooltip
            text={t('gfwlist_url')}
            icon={
              <span>
                <Tooltip arrow placement="top" title={t('recover_pac_file_with_link') as string}>
                  <RestorePage className={styles.cursorPointer} onClick={reGeneratePacFileWithUrl} />
                </Tooltip>
                <Tooltip arrow placement="top" title={t('recover_pac_file_with_file') as string}>
                  <NoteAdd className={styles.cursorPointer} onClick={reGeneratePacFileWithFile}/>
                </Tooltip>
              </span>
            }
          />
        }
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
              <AdaptiveSwitch
                edge="end"
                checked={settings.httpProxy.enable}
                onChange={e => handleSwitchValueChange("httpProxy", e)}
              />
            </ListItemSecondaryAction>
        </ListItem>
        {
          settings.httpProxy.enable && (
            <ListItem>
              <ListItemText
                primary={t('http_proxy_port')}
              />
              <ListItemSecondaryAction>
                <TextField
                  className={`${styles.textField} ${styles.indentInput}`}
                  // style={{ width: '120px', textAlign: 'right' }}
                  required
                  size="small"
                  type="number"
                  // variant="filled"
                  placeholder={t('http_proxy_port')}
                  value={settings.httpProxy.port}
                  onChange={e => handleValueChange("httpProxy", e)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          )
        }
        {/* <ListItem>
            <ListItemText
              primary={'ACL'}
              // secondary="Not applicable to Linux"
            />
            <ListItemSecondaryAction>
              <AdaptiveSwitch
                edge="end"
                checked={settings.acl.enable}
                onChange={e => handleSwitchValueChange("acl", e)}
              />
            </ListItemSecondaryAction>
        </ListItem>
        {
          settings.acl.enable && (
            <ListItem>
              <ListItemText
                primary={t('acl_content')}
              />
              <ListItemSecondaryAction>
                <TextField
                  className={`${styles.textField} ${styles.indentInput}`}
                  style={{ width: '120px', textAlign: 'right' }}
                  required
                  size="small"
                  type="text"
                  placeholder={t('click_to_edit')}
                  onClick={() => setAclVisible(true)}
                  value={'*****'}
                />
              </ListItemSecondaryAction>
            </ListItem>
          )
        } */}
        <ListItem>
          <ListItemText
            primary={t('launch_on_boot')}
            secondary={t('not_applicable_to_linux_snap_application')}
          />
          <ListItemSecondaryAction>
            <AdaptiveSwitch
              edge="end"
              checked={settings.autoLaunch}
              onChange={e => handleSwitchValueChange("autoLaunch", e)}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText
            primary={t('fixed_menu')}
          />
          <ListItemSecondaryAction>
            <AdaptiveSwitch
              edge="end"
              checked={settings.fixedMenu}
              onChange={e => handleSwitchValueChange("fixedMenu", e)}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText
            primary={t('darkMode')}
          />
          <ListItemSecondaryAction>
            <AdaptiveSwitch
              edge="end"
              checked={settings.darkMode}
              onChange={e => handleSwitchValueChange("darkMode", e)}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText
            primary={'Language'}
          />
          <ListItemSecondaryAction>
            <Select
              value={getDefaultLang()}
              onChange={onLangChange}
            >
            <MenuItem value={'en-US'}>English</MenuItem>
            <MenuItem value={'zh-CN'}>中文简体</MenuItem>
          </Select>
          </ListItemSecondaryAction>
        </ListItem>

        <ListItem button onClick={backupConfiguration}>
            <ListItemText primary={t('backup')} />
        </ListItem>
        <ListItem button onClick={() => restoreConfiguration()}>
            <ListItemText primary={t('restore')} />
        </ListItem>
        <ListItem button onClick={handleAlertDialogOpen}>
          <ListItemText primary={t('reset_data')} />
        </ListItem>

        <Divider className={styles.margin} />

        <ListSubheader>{t('debugging')}</ListSubheader>

        <ListItem>
          <ListItemText
            primary="Verbose"
            secondary={t('verbose_output')}
          />
          <ListItemSecondaryAction>
            <AdaptiveSwitch
              edge="end"
              checked={settings.verbose}
              onChange={e => handleSwitchValueChange("verbose", e)}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem button onClick={handleOpenLog}>
          <ListItemText primary={t('open_log_dir')} />
        </ListItem>
        <ListItem button onClick={handleOpenProcessManager}>
          <ListItemText primary={t('open_process_manager')} />
        </ListItem>
      </List>

      {/* dialog */}

      <EditAclDialog
        open={aclVisible}
        onClose={() => setAclVisible(false)}
        children={undefined}
        onTextChange={handleValueChange}
      />

      <DialogConfirm onClose={handleAlertDialogClose} onConfirm={handleReset} />
      {SnackbarAlert}
    </Container>
  );
};

export default SettingsPage;
