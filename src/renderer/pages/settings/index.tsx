import React, { useCallback, useEffect, useRef } from 'react';
import { MessageChannel } from 'electron-re';
import { dispatch as dispatchEvent } from 'use-bus';
import { useForm } from 'react-hook-form';
import {
  Container,
  List,
  ListSubheader,
  Theme,
  withStyles,
  createStyles,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { useTypedDispatch } from '@renderer/redux/actions';
import { useTypedSelector } from '@renderer/redux/reducers';
import {
  getStartupOnBoot,
  setSetting,
  setStartupOnBoot,
} from '@renderer/redux/actions/settings';
import { setStatus } from '@renderer/redux/actions/status';
import { setAclUrl as setAclUrlAction } from '@renderer/redux/actions/settings';
import { Message } from '@renderer/hooks/useNotifier';
import StatusBar from '@renderer/components/StatusBar';

import { ALGORITHM, Settings } from '@renderer/types';
import { persistStore } from '@renderer/App';

import LocalPort from './LocalPort';
import PacPort from './PacPort';
import GfwListUrl from './GfwListUrl';
import HttpProxy from './HttpProxy';
import Acl from './Acl';
import LaunchOnBoot from './LaunchOnBoot';
import FixedMenu from './FixedMenu';
import AutoHide from './AutoHide';
import AutoTheme from './AutoTheme';
import DarkMode from './DarkMode';
import Backup from './Backup';
import Language from './Language';
import Restore from './Restore';
import ResetData from './ResetData';
import Verbose from './Verbose';
import OpenLogDir from './OpenLogDir';
import OpenProcessManager from './OpenProcessManager';
import LoadBalance from './LoadBalance';
import UserPacEditor from './UserPacEditor';
import OpenPluginsDir from './OpenPluginsDir';
import GlobalPacEditor from './GlobalPacEditor';
import OpenAIAPIKey from './OpenAIAPIKey';
import TerminalDefaultMode from './TerminalDefaultMode';
import { useStyles } from './style';

const ListSubheaderStyled = withStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor:
        theme.palette.type === 'light' ? theme.palette.grey[100] : '#4e4e4e',
      color:
        theme.palette.type === 'light'
          ? theme.palette.grey[700]
          : theme.palette.grey[400],
      lineHeight: '24px',
    },
  }),
)(ListSubheader);

const SettingsPage: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const dispatch = useTypedDispatch();
  const settings = useTypedSelector((state) => state.settings);
  const changedFields = useRef<{ [key: string]: any }>({});
  const form = useForm<Settings>({
    mode: 'onChange',
    defaultValues: {
      localPort: settings.localPort,
      pacPort: settings.pacPort,
      gfwListUrl: settings.gfwListUrl,
      httpProxy: settings.httpProxy,
      loadBalance: {
        strategy: settings.loadBalance?.strategy ?? ALGORITHM.POLLING,
        count: settings.loadBalance?.count ?? 3,
        enable: settings.loadBalance?.enable ?? false,
      },
      autoLaunch: settings.autoLaunch,
      fixedMenu: settings.fixedMenu,
      darkMode: settings.darkMode,
      autoTheme: settings.autoTheme,
      verbose: settings.verbose,
      autoHide: settings.autoHide,
      acl: settings.acl,
    },
  });

  /* -------------- functions -------------- */

  const calGlobalActions = useCallback(() => {
    let needReconnectServer = false,
      needReconnectHttp = false,
      needReconnectPac = false;
    const serverConditions = [
      'localPort',
      'pacPort',
      'verbose',
      'acl',
      'aclRules',
      'pac',
    ];
    const httpConditions = ['localPort', 'httpProxyPort', 'httpProxy'];
    const pacConditions = ['pacPort'];
    const settingsCondition = '$settings';

    Object.keys(changedFields.current).forEach((key) => {
      if (serverConditions.includes(key) || key === settingsCondition)
        needReconnectServer = true;
      if (httpConditions.includes(key) || key === settingsCondition)
        needReconnectHttp = true;
      if (pacConditions.includes(key) || key === settingsCondition)
        needReconnectPac = true;
    });

    if (needReconnectServer) dispatchEvent('event:stream:reconnect-server');
    if (needReconnectHttp) dispatchEvent('event:stream:reconnect-http');
    if (needReconnectPac) dispatchEvent('event:stream:reconnect-pac');
  }, []);

  const touchField = (field: string, status: boolean) => {
    changedFields.current[field] = status;
  };

  const isFieldTouched = (field: string) => {
    return !!changedFields.current[field];
  };

  const setAclUrl = () => {
    dispatch<any>(
      setAclUrlAction({
        success: t('successful_operation'),
        error: {
          default: t('failed_operation'),
          404: t('user_canceled'),
        },
      }),
    );
  };

  const reGeneratePacFile = (params: { url?: string; text?: string }) => {
    dispatch<any>(setStatus('waiting', true));
    MessageChannel.invoke('main', 'service:main', {
      action: 'reGeneratePacFile',
      params: {
        ...params,
        settings,
      },
    }).then((rsp) => {
      setTimeout(() => {
        dispatch<any>(setStatus('waiting', false));
      }, 1e3);
      if (rsp.code === 200) {
        touchField('pac', true);
        Message.success(t('successful_operation'));
      } else {
        Message.error(t('failed_to_download_file'));
      }
    });
  };

  const onAutoThemeChange = (
    e: React.ChangeEvent<{ name?: string | undefined; checked: boolean }>,
  ) => {
    const checked = e.target.checked;
    MessageChannel.invoke('main', 'service:theme', {
      action: checked ? 'listenForUpdate' : 'unlistenForUpdate',
      params: {},
    }).then((rsp) => {
      if (rsp.code === 200) {
        persistStore.set('autoTheme', checked ? 'true' : 'false');
      }
    });
    MessageChannel.invoke('main', 'service:theme', {
      action: 'getSystemThemeInfo',
      params: {},
    }).then((rsp) => {
      if (rsp.code === 200) {
        dispatchEvent({
          type: 'theme:update',
          payload: rsp.result,
        });
        if (!checked) {
          form.setValue('darkMode', rsp.result?.shouldUseDarkColors);
        }
      }
    });
  };

  const onFieldChange = (value: any, key: keyof Settings) => {
    if (!key) return;
    let httpProxy, loadBalance, acl;

    changedFields.current = Object.assign(changedFields.current || {}, {
      [key]: value,
    });

    form.trigger(key).then((success) => {
      if (success) {
        switch (key) {
          case 'httpProxy':
            httpProxy = form.getValues('httpProxy');
            dispatch(setSetting<'httpProxy'>(key, httpProxy));
            return;
          case 'loadBalance':
            loadBalance = form.getValues('loadBalance');
            dispatch(
              setSetting<'loadBalance'>(key, {
                strategy: loadBalance?.strategy ?? ALGORITHM.POLLING,
                count: loadBalance?.count ?? 3,
                enable: loadBalance?.enable ?? false,
              }),
            );
            return;
          case 'acl':
            acl = form.getValues('acl');
            dispatch(setSetting<'acl'>('acl', acl));
            return;
          case 'autoLaunch':
            dispatch<any>(setStartupOnBoot(value));
            return;
          case 'darkMode':
            dispatchEvent({
              type: 'theme:update',
              payload: { shouldUseDarkColors: value },
            });
            break;
          default:
            break;
        }
        dispatch(setSetting<any>(key, value));
      }
    });
  };

  /* -------------- hooks -------------- */

  useEffect(() => {
    form.reset(settings);
  }, [settings]);

  /* check settings item */
  useEffect(() => {
    return () => {
      calGlobalActions();
    };
  }, []);

  useEffect(() => {
    dispatch<any>(getStartupOnBoot());
  }, [dispatch]);

  /* dark mode */
  useEffect(() => {
    const darkMode = persistStore.get('darkMode');

    if (
      (darkMode === 'true' && !settings.darkMode) ||
      (darkMode === 'false' && !!settings.darkMode) ||
      (darkMode === undefined && !!settings.darkMode)
    ) {
      dispatchEvent({
        type: 'theme:update',
        payload: {
          shouldUseDarkColors: !!settings.darkMode,
        },
      });
    }
  }, [settings.darkMode]);

  /* wach fields change */
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (!name) return;
      const changedValue = _.get(value, name);
      onFieldChange(changedValue, name?.split('.')?.[0] as keyof Settings);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <Container>
      <form className={styles.form}>
        <LocalPort form={form} />
        <PacPort form={form} />
        <GfwListUrl
          form={form}
          reGeneratePacFile={reGeneratePacFile}
          gfwListUrl={settings.gfwListUrl}
        />
        <List className={styles.list}>
          <ListSubheaderStyled>➤ {t('proxy_settings')}</ListSubheaderStyled>
          <HttpProxy form={form} />
          <Acl
            setAclUrl={setAclUrl}
            touchField={touchField}
            isFieldTouched={isFieldTouched}
            form={form}
          />
          <UserPacEditor
            touchField={touchField}
            isFieldTouched={isFieldTouched}
          />
          <GlobalPacEditor
            touchField={touchField}
            isFieldTouched={isFieldTouched}
          />

          <ListSubheaderStyled>➤ {t('basic_settings')}</ListSubheaderStyled>

          <LaunchOnBoot form={form} />
          <FixedMenu form={form} />
          <AutoHide form={form} />
          <AutoTheme form={form} onAutoThemeChange={onAutoThemeChange} />
          <DarkMode form={form} />
          <Language form={form} />
          <Backup />
          <Restore form={form} touchField={touchField} />
          <ResetData form={form} />

          <ListSubheaderStyled>➤ {t('experimental')}</ListSubheaderStyled>

          <LoadBalance form={form} />
          <OpenAIAPIKey form={form} />
          <TerminalDefaultMode form={form} />

          <ListSubheaderStyled>➤ {t('debugging')}</ListSubheaderStyled>

          <Verbose form={form} />
          <OpenLogDir />
          <OpenPluginsDir />
          <OpenProcessManager />
        </List>
      </form>
      <StatusBar />
    </Container>
  );
};

export default SettingsPage;
