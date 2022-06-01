import { ipcRenderer, IpcRendererEvent } from 'electron';
import React, { Dispatch, useEffect, useState } from 'react';
import useBus, { EventAction, dispatch as dispatchEvent } from 'use-bus';
import { createTheme, Theme } from '@material-ui/core';
import { grey, indigo } from "@material-ui/core/colors";
import { MessageChannel } from 'electron-re';

import { persistStore } from '../App';
import { SET_SETTING } from '../redux/actions/settings';
import { store } from '../redux/store';
import { ThemeMode } from '../types';

const themes = {
  light: createTheme({
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
  }),
  dark: createTheme({
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
  })
};

export default (theme: ThemeMode): [Theme, Dispatch<React.SetStateAction<ThemeMode>>] => {
  const [mode, setMode] = useState<ThemeMode>(theme);

  const updateTheme = (e: IpcRendererEvent | EventAction, data: { shouldUseDarkColors: boolean }) => {
    persistStore.set('darkMode', !!data.shouldUseDarkColors ? 'true' : 'false');
    store.dispatch({
      type: SET_SETTING,
      key: "darkMode",
      value: data.shouldUseDarkColors
    });
    setMode(data.shouldUseDarkColors ? 'dark' : 'light');
  };

  useBus('theme:update', (event: EventAction) => updateTheme(event, event.payload), [setMode]);

  useEffect(() => {
    ipcRenderer.on("theme:update", updateTheme);

    return () => {
      ipcRenderer.off("theme:update", updateTheme);
    }
  }, []);

  useEffect(() => {
    if (persistStore.get('autoTheme') === 'true') {
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
        }
      });
    }
  }, []);

  return [themes[mode] ?? themes['light'], setMode];
};
