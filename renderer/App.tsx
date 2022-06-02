import React, { useEffect } from "react";
import { CssBaseline } from "@material-ui/core";
import {
  makeStyles,
  createStyles,
  Theme,
  ThemeProvider
} from "@material-ui/core/styles";
import { SnackbarProvider } from 'notistack';
import {
  HashRouter,
} from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ipcRenderer } from "electron";
import { MessageChannel } from "electron-re";
import ElectronStore from 'electron-store';

import prepareForLanguage, { getFirstLanguage } from './i18n';
import { getDefaultLang } from "./utils";
import { store, persistor } from "./redux/store";
import { getConnectionStatus, SET_STATUS } from "./redux/actions/status";
import AppNav from "./components/AppNav";
import Loading from "./components/Loading";
import RouterComp from './Router';
import useTheme from "./hooks/useTheme";
import useGlobalAction from "./hooks/useGlobalAction";
// import { SET_SETTING } from "./redux/actions/settings";

export const persistStore = new ElectronStore();

const useStyles = makeStyles((theme: Theme) =>
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

ipcRenderer.on("connected", (e, message) => {
  store.dispatch({
    type: SET_STATUS,
    key: "connected",
    value: message
  });
});

prepareForLanguage(getDefaultLang());

const App: React.FC = () => {
  const styles = useStyles();
  const darkMode = persistStore.get('darkMode') === 'true';
  const [theme] = useTheme(darkMode ? 'dark' : 'light');

  useGlobalAction({
    'reconnect-server': { type: 'reconnect-server', payload: '' },
    'reconnect-http': { type: 'reconnect-http', payload: '' },
    'reconnect-pac': { type: 'reconnect-pac', payload: '' },
  });

  useEffect(() => {
    getConnectionStatus((status) => {
      store.dispatch({
        type: SET_STATUS,
        key: "connected",
        value: status
      });
    });

    MessageChannel.invoke('main', 'service:desktop', {
      action: 'setLocale',
      params: getFirstLanguage(persistStore.get('lang') as string)
    });
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <ThemeProvider theme={theme}>
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
                  <RouterComp />
                </main>
              </div>
            </HashRouter>
          </SnackbarProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
