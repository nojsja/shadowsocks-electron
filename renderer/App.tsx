import React, { useEffect } from "react";
import { CssBaseline } from "@material-ui/core";
import {
  makeStyles,
  createStyles,
  createTheme,
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
import { grey, indigo } from "@material-ui/core/colors";
import { MessageChannel } from "electron-re";
import ElectronStore from 'electron-store';

import prepareForLanguage, { getFirstLanguage } from './i18n';
import { getDefaultLang } from "./utils";
import { store, persistor } from "./redux/store";
import { getConnectionStatus, SET_STATUS } from "./redux/actions/status";
import AppNav from "./components/AppNav";
import Loading from "./components/Loading";
import RouterComp from './Router';
import { SET_SETTING } from "./redux/actions/settings";

export const persistStore = new ElectronStore();

const mainTheme = createTheme({
  spacing: 8,
  palette: {
    primary: {
      main: indigo[500],
      light: indigo[400],
    },
    secondary: {
      main: grey[300]
    },
    background: {
      paper: "#fff",
      default: "#fafafa"
    },
  }
});

const darkTheme = createTheme({
  spacing: 8,
  palette: {
    type: "dark",
    primary: {
      main: indigo[300],
      light: indigo[300],
    },
    secondary: {
      main: grey[800],
      dark: grey[900]
    },
    background: {
      default: '#424242',
      paper: grey[900],
    },
  }
});

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

ipcRenderer.on("theme:update", (e, { shouldUseDarkColors }) => {
  if (persistStore.get('darkMode') === (shouldUseDarkColors ? 'true' : 'false')) return;

  store.dispatch({
    type: SET_SETTING,
    key: "darkMode",
    value: shouldUseDarkColors
  });
  persistStore.set('darkMode', !!shouldUseDarkColors ? 'true' : 'false');
  setTimeout(() => {
    MessageChannel.invoke('main', 'service:desktop', {
      action: 'reloadMainWindow',
      params: {}
    });
  }, 800);
});

prepareForLanguage(getDefaultLang());

const App: React.FC = () => {
  const styles = useStyles();
  const darkMode = persistStore.get('darkMode') === 'true' || false;

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
        <ThemeProvider theme={darkMode ? darkTheme : mainTheme}>
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
