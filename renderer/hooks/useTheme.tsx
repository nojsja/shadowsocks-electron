import { ipcRenderer, IpcRendererEvent } from 'electron';
import React, { Dispatch, useEffect, useState } from 'react';
import useBus, { EventAction } from 'use-bus';
import { createTheme, Theme } from '@material-ui/core';
import { grey, indigo } from "@material-ui/core/colors";

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

  const updateTheme = (e: IpcRendererEvent, data: { shouldUseDarkColors: boolean }) => {
    if (persistStore.get('darkMode') === (data.shouldUseDarkColors ? 'true' : 'false')) return;
    persistStore.set('darkMode', !!data.shouldUseDarkColors ? 'true' : 'false');
    store.dispatch({
      type: SET_SETTING,
      key: "darkMode",
      value: data.shouldUseDarkColors
    });
    setMode(data.shouldUseDarkColors ? 'dark' : 'light');
  };

  useEffect(() => {
    ipcRenderer.on("theme:update", updateTheme);

    return () => {
      ipcRenderer.off("theme:update", updateTheme);
    }
  }, []);

  useBus('theme:update', (event: EventAction) => setMode(event.payload), [setMode]);

  return [themes[mode] ?? themes['light'], setMode];
};
