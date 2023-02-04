import React, { useEffect } from 'react';
import { CssBaseline } from '@material-ui/core';
import {
  makeStyles,
  createStyles,
  ThemeProvider
} from '@material-ui/core/styles';
import {  SnackbarProvider } from 'notistack';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ipcRenderer } from 'electron';
import { MessageChannel } from 'electron-re';
import ElectronStore from 'electron-store';
import useBus, { dispatch as dispatchEvent, EventAction } from 'use-bus';
import { FormProvider, useForm } from 'react-hook-form';

import { store, persistor } from './redux/store';
import { getConnectionStatus, setStatus } from './redux/actions/status';
import { setSetting } from './redux/actions/settings';
import { enqueueSnackbar } from './redux/actions/notifications';

import RouterComponent from './Router';
import AppNav from './components/AppNav';
import Loading from './components/Loading';
import useTheme from './hooks/useTheme';

import prepareForLanguage, { getFirstLanguage } from './i18n';
import { getDefaultLang } from './utils';
import { ServerMode, Notification } from './types';

export const persistStore = new ElectronStore();

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: "flex"
    },
    toolbar: {
      minHeight: '42px'
    },
    content: {
      flex: 1
    }
  })
);

ipcRenderer.on('connected', (e, message : { status: boolean, mode: ServerMode }) => {
  store.dispatch(setStatus('connected', message.status));
  store.dispatch(setSetting('serverMode', message.mode));
});

ipcRenderer.on('traffic', (e, message: { traffic: number }) => {
  const KB = (message.traffic / 1024);
  const MB = (KB / 1024);
  const GB = (MB / 1024);
  store.dispatch(setStatus('traffic', { KB, MB, GB }));
});

ipcRenderer.on('event:stream', (e, message: { action: string, args: any }) => {
  dispatchEvent({
    type: `event:stream:${message.action}`,
    payload: message.args,
  });
});

prepareForLanguage(getDefaultLang());

const App: React.FC = () => {
  const styles = useStyles();
  const darkMode = persistStore.get('darkMode') === 'true';
  const [theme] = useTheme(darkMode ? 'dark' : 'light');
  const methods = useForm();

  useEffect(() => {
    getConnectionStatus((status) => {
      store.dispatch(setStatus('connected', status));
    });

    MessageChannel.invoke('main', 'service:desktop', {
      action: 'setLocale',
      params: getFirstLanguage(persistStore.get('lang') as string)
    });
  }, []);

  useBus('event:stream:notifycation', (event: EventAction) => {
    const {
      message,
      type,
    } = event.payload as { message: string; type: Notification['variant'] };

    store.dispatch(enqueueSnackbar(message, {
      variant: type || 'default',
    }));
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <FormProvider {...methods}>
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={ {horizontal: 'center', vertical: 'top'} }
              autoHideDuration={2e3}
            >
              <HashRouter>
                <div className={styles.root}>
                  <CssBaseline />
                  <AppNav />
                  <main className={styles.content}>
                    <div className={styles.toolbar} />
                    <RouterComponent />
                  </main>
                </div>
              </HashRouter>
            </SnackbarProvider>
          </FormProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
