import React, { useEffect } from "react";
import Form, { Field } from "rc-field-form";
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
import { SnackbarMessage } from 'notistack';

import { useTypedDispatch } from "../redux/actions";
import { useTypedSelector, CLEAR_STORE } from "../redux/reducers";
import { enqueueSnackbar as enqueueSnackbarAction } from '../redux/actions/notifications';
import { SET_SETTING, getStartupOnBoot, setStartupOnBoot, setHttpAndHttpsProxy } from "../redux/actions/settings";
import { setStatus } from "../redux/actions/status";
import { backupConfigurationToFile, restoreConfigurationFromFile } from '../redux/actions/config';
import { Notification } from "../types";

import { useStylesOfSettings as useStyles } from "./styles";
import useDialogConfirm from '../hooks/useDialogConfirm';
import { AdaptiveSwitch } from "../components/Pices/Switch";
import { TextWithTooltip } from "../components/Pices/TextWithTooltip";
// import EditAclDialog from "../components/EditAclDialog";

import { persistStore } from "../App";
import { getDefaultLang } from "../utils";
import { getFirstLanguage } from "../i18n";

const SettingsPage: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation();

  const dispatch = useTypedDispatch();
  const [form] = Form.useForm();
  const settings = useTypedSelector(state => state.settings);
  const config = useTypedSelector(state => state.config);
  // const [aclVisible, setAclVisible] = useState(false);
  const inputFileRef = React.useRef<HTMLInputElement>(null);
  const [DialogConfirm, showDialog, closeDialog] = useDialogConfirm();

  const enqueueSnackbar = (message: SnackbarMessage, options: Notification) => {
    dispatch(enqueueSnackbarAction(message, options))
  };

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
    dispatch<any>(restoreConfigurationFromFile({
      success: t('the_recovery_is_successful'),
      error: {
        default: t('the_recovery_is_failed'),
        404: t('user_canceled')
      }
    }));
  }

  const checkPortValid = (parsedValue: number) => {
    if (!(parsedValue && parsedValue > 1024 && parsedValue <= 65535)) {
          return Promise.reject(t("invalid_port_range"));
    }
    return Promise.resolve();
  };

  const checkPortSame = () => {
    const localPort = +form.getFieldValue('localPort');
    const pacPort = +form.getFieldValue('pacPort');
    const httpPort = +form.getFieldValue('httpProxyPort');
    const num = localPort ^ pacPort ^ httpPort;
    if (num === localPort || num === pacPort || num === httpPort) {
      return Promise.reject(t("the_same_port_is_not_allowed"));
    }
    return Promise.resolve();
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
    enqueueSnackbar(t('cleared_all_data'), { variant: 'success' });
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
        enqueueSnackbar(t('successful_operation'), { variant: 'success' });
      } else {
        enqueueSnackbar(t('failed_to_download_file'), { variant: 'error' });
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

  const checkPortField = (rule: any, value: any) => {
    return Promise.all([checkPortSame(), checkPortValid(value)]);
  };

  const onFieldChange = (changedFields: { [key: string]: any }, allFields: { [key: string]: any }) => {
    const keys = Object.keys(changedFields);
    keys.forEach((key) => {
      let value = changedFields[key];
      form.validateFields([key]).then(() => {
        switch (key) {
          case 'httpProxy':
            value = {
              ...settings.httpProxy,
              enable: value
            };
            dispatch({ type: SET_SETTING, key: 'httpProxy', value });
            setHttpAndHttpsProxy({ ...value, type: 'http', proxyPort: settings.localPort });
            return;
          case 'httpProxyPort':
            value = {
              ...settings.httpProxy,
              port: value
            };
            dispatch({ type: SET_SETTING, key: 'httpProxy', value });
            setHttpAndHttpsProxy({ ...value, type: 'http', proxyPort: settings.localPort });
            return;
          case 'acl':
            dispatch({ type: SET_SETTING, key, value: {
              ...settings.acl,
              text: value
            } });
            return;
          case 'autoLaunch':
            dispatch<any>(setStartupOnBoot(value));
            return;
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

        dispatch({ type: SET_SETTING, key, value });
      }).catch((reason: { errorFields: { errors: string[] }[] }) => {
        enqueueSnackbar(reason?.errorFields?.map(item => item.errors.join()).join(), { variant: 'error' });
      });
    });
  }

  return (
    <Container className={styles.container}>
      <Form
        form={form}
        initialValues={
          {
            localPort: settings.localPort,
            pacPort: settings.pacPort,
            gfwListUrl: settings.gfwListUrl,
            httpProxy: settings.httpProxy.enable,
            httpProxyPort: settings.httpProxy.port,
            autoLaunch: settings.autoLaunch,
            fixedMenu: settings.fixedMenu,
            darkMode: settings.darkMode,
            verbose: settings.verbose
          }
        }
        onValuesChange={onFieldChange}
      >
        <Field
          name="localPort"
          rules={[
            { required: true, message: t('invalid_value') },
            { validator: checkPortField },
          ]}
          normalize={(value: string) => +(value.trim())}
          validateTrigger={false}
        >
          <TextField
            className={styles.textField}
            required
            fullWidth
            size="small"
            type="number"
            label={t('local_port')}
            placeholder={t('local_port_tips')}
          />
        </Field>
        <Field
          name="pacPort"
          rules={[
            { required: true, message: t('invalid_value') },
            { validator: checkPortField }
          ]}
          normalize={(value: string) => +(value.trim())}
          validateTrigger={false}
        >
          <TextField
            className={styles.textField}
            required
            fullWidth
            type="number"
            size="small"
            label={t('pac_port')}
            placeholder={t('pac_port_tips')}
          />
        </Field>
        <Field
          name="gfwListUrl"
          validateTrigger={false}
        >
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
        />
        </Field>
        <input onChange={onGFWListFileChange} ref={inputFileRef} type={'file'} multiple={false} style={{ display: 'none' }}></input>
        <List className={styles.list}>
          <ListItem>
              <ListItemText
                primary={t('http_proxy')}
              />
              <ListItemSecondaryAction>
                <Field name="httpProxy" valuePropName="checked">
                  <AdaptiveSwitch
                    edge="end"
                  />
                </Field>
              </ListItemSecondaryAction>
          </ListItem>
          {
            settings.httpProxy.enable && (
              <ListItem>
                <ListItemText
                  primary={t('http_proxy_port')}
                />
                <ListItemSecondaryAction>
                  <Field
                    name="httpProxyPort"
                    rules={[
                      { required: true, message: t('invalid_value') },
                      { validator: checkPortField }
                    ]}
                    normalize={(value: string) => +(value.trim())}
                    validateTrigger={false}
                  >
                    <TextField
                      className={`${styles.textField} ${styles.indentInput}`}
                      required
                      size="small"
                      type="number"
                      placeholder={t('http_proxy_port')}
                    />
                  </Field>
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
              <Field name="autoLaunch" valuePropName="checked">
                <AdaptiveSwitch
                  edge="end"
                />
              </Field>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('fixed_menu')}
            />
            <ListItemSecondaryAction>
              <Field name="fixedMenu" valuePropName="checked">
                <AdaptiveSwitch
                  edge="end"
                />
              </Field>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('darkMode')}
            />
            <ListItemSecondaryAction>
              <Field name="darkMode" valuePropName="checked">
                <AdaptiveSwitch
                  edge="end"
                />
              </Field>
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
              <Field name="verbose" valuePropName="checked">
                <AdaptiveSwitch
                  edge="end"
                />
              </Field>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem button onClick={handleOpenLog}>
            <ListItemText primary={t('open_log_dir')} />
          </ListItem>
          <ListItem button onClick={handleOpenProcessManager}>
            <ListItemText primary={t('open_process_manager')} />
          </ListItem>
        </List>

      </Form>

      {/* dialog */}

      {/* <EditAclDialog
        open={aclVisible}
        onClose={() => setAclVisible(false)}
        children={undefined}
        onTextChange={handleValueChange}
      /> */}

      <DialogConfirm onClose={handleAlertDialogClose} onConfirm={handleReset} />
    </Container>
  );
};

export default SettingsPage;
