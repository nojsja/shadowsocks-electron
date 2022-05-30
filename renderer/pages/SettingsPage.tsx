import React, { useEffect, useMemo, useRef } from "react";
import Form, { Field } from "rc-field-form";
import { MessageChannel } from 'electron-re';
import { dispatch as dispatchEvent } from 'use-bus';
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
  Tooltip,
  Button
} from "@material-ui/core";
import { useTranslation } from 'react-i18next';
import { SnackbarMessage } from 'notistack';
import path from 'path';

import { useTypedDispatch } from "../redux/actions";
import { useTypedSelector, CLEAR_STORE } from "../redux/reducers";
import { enqueueSnackbar as enqueueSnackbarAction } from '../redux/actions/notifications';
import { getStartupOnBoot, setStartupOnBoot, setHttpAndHttpsProxy, setSetting } from "../redux/actions/settings";
import { setStatus } from "../redux/actions/status";
import { backupConfigurationToFile, restoreConfigurationFromFile } from '../redux/actions/config';
import { setAclUrl as setAclUrlAction } from '../redux/actions/settings';
import { Notification } from "../types";

import { useStylesOfSettings as useStyles } from "./styles";
import useDialogConfirm from '../hooks/useDialogConfirm';
import { AdaptiveSwitch } from "../components/Pices/Switch";
import ListItemTextMultibleLine from "../components/Pices/ListItemTextMultibleLine";
import If from "../components/HOC/IF";

import { persistStore } from "../App";
import { getDefaultLang } from "../utils";
import { getFirstLanguage } from "../i18n";

import LocalPort from "./settings/LocalPort";
import PacPort from "./settings/PacPort";
import GfwListUrl from "./settings/GfwListUrl";

const SettingsPage: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation();

  const dispatch = useTypedDispatch();
  const [form] = Form.useForm();
  const settings = useTypedSelector(state => state.settings);
  const config = useTypedSelector(state => state.config);
  // const [aclVisible, setAclVisible] = useState(false);
  const [DialogConfirm, showDialog, closeDialog] = useDialogConfirm();
  const settingKeys = useRef(
    ['localPort', 'pacPort', 'gfwListUrl',
    'httpProxy', 'autoLaunch', 'fixedMenu',
    'darkMode', 'autoTheme', 'verbose', 'autoHide']
  );
  const cachedRef = useRef<any>(null);

  const enqueueSnackbar = (message: SnackbarMessage, options: Notification) => {
    dispatch(enqueueSnackbarAction(message, options))
  };

  useEffect(() => {
    dispatch<any>(getStartupOnBoot());
  }, [dispatch]);

  /* dark mode */
  useEffect(() => {
    if (
      (persistStore.get('darkMode') === 'true' && !settings.darkMode) ||
      (persistStore.get('darkMode') === 'false' && !!settings.darkMode) ||
      (persistStore.get('darkMode') === undefined && !!settings.darkMode)
    ) {
      dispatchEvent({
        type: 'theme:update',
        payload: {
          shouldUseDarkColors: !!settings.darkMode
        }
      });
    }
  }, [settings.darkMode]);

  /* restoreFromFile */
  useMemo(() => {
    const obj = {};
    if (cachedRef.current) {
      settingKeys.current.forEach(key => {
        if (cachedRef.current[key] !== (settings as any)[key]) {
          if (key === 'httpProxy') {
            Object.assign(obj, {
              httpProxy: settings.httpProxy.enable,
              httpProxyPort: settings.httpProxy.port,
            });
          } else {
            Object.assign(obj, { [key]: (settings as any)[key] });
          }
        }
      });
      form.setFieldsValue(obj);
    }
    cachedRef.current = settingKeys.current.reduce(
      (pre, cur) => Object.assign(pre, { [cur]: (settings as any)[cur] }),
      {}
    );
  }, settingKeys.current.map(key => (settings as any)[key]));

  const backupConfiguration = () => {
    return dispatch<any>(backupConfigurationToFile({
      config,
      settings
    }, {
      success: t('successful_operation'),
      error: {
        default: t('failed_operation'),
        404: t('user_canceled')
      }
    }));
  };

  const setAclUrl = () => {
    dispatch<any>(setAclUrlAction({
      success: t('successful_operation'),
      error: {
        default: t('failed_operation'),
        404: t('user_canceled')
      }
    }));
  }

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

  const onAutoThemeChange = (e: React.ChangeEvent<{ name?: string | undefined, checked: boolean; }>) => {
    const checked = e.target.checked;
    MessageChannel.invoke('main', 'service:theme', {
      action: checked ? 'listenForUpdate' : 'unlistenForUpdate',
      params: {}
    }).then(rsp => {
      if (rsp.code === 200) {
        persistStore.set('autoTheme', checked ? 'true' : 'false');
      }
    });
    MessageChannel.invoke('main', 'service:theme', {
      action: 'getSystemThemeInfo',
      params: {}
    })
    .then(rsp => {
      if (rsp.code === 200) {
        dispatchEvent({
          type: 'theme:update',
          payload: rsp.result
        });
        if (!checked) {
          form.setFieldsValue({
            darkMode: rsp.result?.shouldUseDarkColors
          });
        }
      }
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
            dispatch(setSetting<'httpProxy'>(key, value))
            setHttpAndHttpsProxy({ ...value, type: 'http', proxyPort: settings.localPort });
            return;
          case 'httpProxyPort':
            value = {
              ...settings.httpProxy,
              port: value
            };
            dispatch(setSetting<'httpProxy'>('httpProxy', value))
            setHttpAndHttpsProxy({ ...value, type: 'http', proxyPort: settings.localPort });
            return;
          case 'acl':
            dispatch(setSetting<'acl'>('acl', {
              ...settings.acl,
              enable: value
            }));
            return;
          case 'autoLaunch':
            dispatch<any>(setStartupOnBoot(value));
            return;
          case 'darkMode':
            dispatchEvent({
              type: 'theme:update',
              payload: {
                shouldUseDarkColors: value
              }
            });
            break;
          default:
            break;
        }

        dispatch(setSetting<any>(key, value));
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
            autoTheme: settings.autoTheme,
            verbose: settings.verbose,
            autoHide: settings.autoHide,
            acl: settings.acl.enable,
            acl_url: settings.acl.url
          }
        }
        onValuesChange={onFieldChange}
      >
        <LocalPort
          rules={
            [
              { required: true, message: t('invalid_value') },
              { validator: checkPortField },
            ]
          }
        />
        <PacPort
          rules={[
            { required: true, message: t('invalid_value') },
            { validator: checkPortField }
          ]}
        />
        <GfwListUrl
          reGeneratePacFile={reGeneratePacFile}
          gfwListUrl={settings.gfwListUrl}
        />
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
          <If
            condition={settings.httpProxy.enable}
            then={
              <ListItem>
                <ListItemText
                  primary={t('http_proxy_port')}
                  secondary={t('restart_when_changed')}
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
            }
          />
          <ListItem>
            <ListItemTextMultibleLine
              primary={'ACL'}
              secondary={
                <If
                  condition={settings.acl.enable}
                  then={
                    <Tooltip arrow
                      placement="top"
                      title={
                        <If
                          condition={!!settings?.acl?.url}
                          then={settings?.acl?.url}
                        />
                      }
                    >
                      <span>{path.basename(settings?.acl?.url || '')}</span>
                    </Tooltip>
                  }
                />
              }
            />
            <ListItemSecondaryAction>
              <If
                condition={settings.acl.enable}
                then={<Button onClick={setAclUrl} size="small">{t('select')}</Button>}
              />
              <Field name="acl" valuePropName="checked">
                <AdaptiveSwitch
                  edge="end"
                />
              </Field>
              <input style={{ display: 'none' }} type="file"></input>
            </ListItemSecondaryAction>
          </ListItem>
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
              primary={t('auto_hide')}
              secondary={t('minimize_on_start')}
            />
            <ListItemSecondaryAction>
              <Field name="autoHide" valuePropName="checked">
                <AdaptiveSwitch
                  edge="end"
                />
              </Field>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t('autoTheme')}
              secondary={t('autoThemeTips')}
            />
            <ListItemSecondaryAction>
              <Field name="autoTheme" valuePropName="checked">
                <AdaptiveSwitch
                  edge="end"
                  onChange={onAutoThemeChange}
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
                  disabled={settings.autoTheme}
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

      <DialogConfirm onClose={handleAlertDialogClose} onConfirm={handleReset} />
    </Container>
  );
};

export default SettingsPage;
