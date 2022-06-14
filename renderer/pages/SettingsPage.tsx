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
import { useTypedSelector } from "../redux/reducers";
import { enqueueSnackbar as enqueueSnackbarAction } from '../redux/actions/notifications';
import { getStartupOnBoot, setStartupOnBoot, setSetting } from "../redux/actions/settings";
import { setStatus } from "../redux/actions/status";
import { setAclUrl as setAclUrlAction } from '../redux/actions/settings';
import { ALGORITHM, Notification } from "../types";

import { useStylesOfSettings as useStyles } from "./styles";
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
import LoadBalance from "./settings/LoadBalance";

const SettingsPage: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation();

  const dispatch = useTypedDispatch();
  const [form] = Form.useForm();
  const settings = useTypedSelector(state => state.settings);
  // const [aclVisible, setAclVisible] = useState(false);
  const settingKeys = useRef(
    ['localPort', 'pacPort', 'gfwListUrl',
    'httpProxy', 'autoLaunch', 'fixedMenu',
    'darkMode', 'autoTheme', 'verbose', 'autoHide',
    'acl', 'loadBalance'
  ]
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
          switch(key) {
            case 'httpProxy':
              Object.assign(obj, {
                httpProxy: settings.httpProxy.enable,
                httpProxyPort: settings.httpProxy.port,
              });
            break;
            case 'loadBalance':
              Object.assign(obj, {
                loadBalance: settings.loadBalance?.enable,
                loadBalanceCount: settings.loadBalance?.count ?? 3,
                loadBalanceStrategy: settings.loadBalance?.strategy ?? ALGORITHM.POLLING,
              });
            break;
            default:
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
    const httpConditions = ['localPort', 'httpProxyPort', 'httpProxy'];
    const pacConditions = ['pacPort'];

    Object.keys(changedFields.current).forEach(key => {
      if (serverConditions.includes(key)) needReconnectServer = true;
      if (httpConditions.includes(key)) needReconnectHttp = true;
      if (pacConditions.includes(key)) needReconnectPac = true;
    });
    if (needReconnectServer) globalAction.set({ type: 'reconnect-server' });
    if (needReconnectHttp) globalAction.set({ type: 'reconnect-http' });
    if (needReconnectPac) globalAction.set({ type: 'reconnect-pac' });
  }, []);

  const enqueueSnackbar = (message: SnackbarMessage, options: Notification) => {
    dispatch(enqueueSnackbarAction(message, options))
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

  const checkPortValid = (parsedValue: number) => {
    if (!(parsedValue && parsedValue > 1024 && parsedValue <= 65535)) {
          return Promise.reject(t("invalid_port_range"));
    }
    return Promise.resolve();
  };

  const checkLbCountValid = (rule: any, value: any) => {
    const parsedValue = +value;
    if (!(parsedValue && parsedValue <= 5 && parsedValue >= 2)) {
      return Promise.reject(t("count_range_2_5"));
    }
    return Promise.resolve();
  }

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
            return;
          case 'httpProxyPort':
            value = {
              ...settings.httpProxy,
              port: value
            };
            dispatch(setSetting<'httpProxy'>('httpProxy', value))
            return;
          case 'loadBalance':
            value = {
              ...settings.loadBalance,
              enable: value
            };
            dispatch(setSetting<'loadBalance'>(key, value))
            return;
          case 'loadBalanceCount':
            value = {
              ...settings.loadBalance,
              count: value
            };
            dispatch(setSetting<'loadBalance'>('loadBalance', value))
            return;
          case 'loadBalanceStrategy':
            value = {
              ...settings.loadBalance,
              strategy: value
            };
            dispatch(setSetting<'loadBalance'>('loadBalance', value))
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
            loadBalance: settings.loadBalance?.enable,
            loadBalanceCount: settings.loadBalance?.count || 3,
            loadBalanceStrategy: settings.loadBalance?.strategy || ALGORITHM.POLLING,
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
          <Backup />
          <Restore />
          <ResetData enqueueSnackbar={enqueueSnackbar} />
          <Divider className={styles.margin} />
          <ListSubheader>{t('experimental')}</ListSubheader>
          <LoadBalance
            enable={!!settings.loadBalance?.enable}
            rules={
              [
                { required: true, message: t('invalid_value') },
                { validator: checkLbCountValid },
              ]
            }
          />
          <Divider className={styles.margin} />
          <ListSubheader>{t('debugging')}</ListSubheader>
          <Verbose />
          <OpenLogDir />
          <OpenProcessManager />
        </List>
      </Form>
    </Container>
  );
};

export default SettingsPage;
