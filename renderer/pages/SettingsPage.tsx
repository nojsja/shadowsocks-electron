import React, { useCallback, useEffect, useMemo, useRef } from "react";
import Form from "rc-field-form";
import { MessageChannel } from 'electron-re';
import { dispatch as dispatchEvent } from 'use-bus';
import {
  Container,
  List,
  ListSubheader,
  Divider,
} from "@material-ui/core";
import { useTranslation } from 'react-i18next';
import { SnackbarMessage } from 'notistack';

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
import * as globalAction from "../hooks/useGlobalAction";

import { persistStore } from "../App";

import LocalPort from "./settings/LocalPort";
import PacPort from "./settings/PacPort";
import GfwListUrl from "./settings/GfwListUrl";
import HttpProxy from './settings/HttpProxy';
import Acl from './settings/Acl';
import LaunchOnBool from "./settings/LaunchOnBool";
import FixedMenu from "./settings/FixedMenu";
import AutoHide from "./settings/AutoHide";
import AutoTheme from "./settings/AutoTheme";
import DarkMode from "./settings/DarkMode";
import Backup from './settings/Backup';
import Language from './settings/Language';
import Restore from "./settings/Restore";
import ResetData from "./settings/ResetData";
import Verbose from "./settings/Verbose";
import OpenLogDir from "./settings/OpenLogDir";
import OpenProcessManager from "./settings/OpenProcessManager";

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
  const changedFields = useRef<{[key: string]: any}>({});

  /* -------------- hooks -------------- */

  useEffect(() => {
    return () => {
      /* check settings item */
      calGlobalActions();
    };
  }, []);

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

  /* -------------- functions -------------- */

  const calGlobalActions = useCallback(() => {
    let needReconnectServer = false,
        needReconnectHttp = false,
        needReconnectPac = false;
    const serverConditions = ['localPort', 'pacPort', 'verbose', 'acl', 'acl_url'];
    const httpConditions = ['httpProxyPort', 'httpProxy'];
    const pacConditions = ['pacPort'];

    Object.keys(changedFields.current).forEach(key => {
      if (serverConditions.includes(key)) {
        needReconnectServer = true;
      } else if (httpConditions.includes(key)) {
        needReconnectHttp = true;
      } else if (pacConditions.includes(key)) {
        needReconnectPac = true;
      }
    });
    if (needReconnectServer) {
      globalAction.set({ type: 'reconnect-server' });
    }
    if (needReconnectHttp) {
      globalAction.set({ type: 'reconnect-http' });

    }
    if (needReconnectPac) {
      globalAction.set({ type: 'reconnect-pac' });
    }
  }, []);

  const enqueueSnackbar = (message: SnackbarMessage, options: Notification) => {
    dispatch(enqueueSnackbarAction(message, options))
  };

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

  const onFieldChange = (fields: { [key: string]: any }, allFields: { [key: string]: any }) => {
    const keys = Object.keys(fields);
    changedFields.current = Object.assign(changedFields.current || {}, fields);

    keys.forEach((key) => {
      let value = fields[key];
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
          <HttpProxy
            enable={settings.httpProxy.enable}
            rules={
              [
                { required: true, message: t('invalid_value') },
                { validator: checkPortField }
              ]
            }
          />
          <Acl
            enable={settings.acl.enable}
            url={settings?.acl?.url}
            setAclUrl={setAclUrl}
          />
          <LaunchOnBool />
          <FixedMenu />
          <AutoHide />
          <AutoTheme onAutoThemeChange={onAutoThemeChange} />
          <DarkMode disabled={settings.autoTheme} />
          <Language />
          <Backup backupConfiguration={backupConfiguration} />
          <Restore restoreConfiguration={restoreConfiguration}/>
          <ResetData handleAlertDialogOpen={handleAlertDialogOpen} />
          <Divider className={styles.margin} />
          <ListSubheader>{t('debugging')}</ListSubheader>
          <Verbose />
          <OpenLogDir />
          <OpenProcessManager />
        </List>
      </Form>
      <DialogConfirm onClose={handleAlertDialogClose} onConfirm={handleReset} />
    </Container>
  );
};

export default SettingsPage;
