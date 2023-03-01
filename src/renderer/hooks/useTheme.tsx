import React, { Dispatch, useEffect, useState } from 'react';
import { MessageChannel } from 'electron-re';
import useBus, { EventAction, dispatch as dispatchEvent } from 'use-bus';
import { createTheme, Theme } from '@material-ui/core';
import { grey, indigo } from "@material-ui/core/colors";

import { persistStore } from '@renderer/App';
import { SET_SETTING } from '@renderer/redux/actions/settings';
import { store } from '@renderer/redux/store';
import { ThemeMode } from '@renderer/types';

const themes = {
  light: createTheme({
    spacing: 8,
    palette: {
      text: {
        primary: grey[900],
        secondary: grey[600],
      },
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
      text: {
        primary: grey[200],
        secondary: grey[400],
      },
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

export const useTheme = (theme: ThemeMode): [Theme, Dispatch<React.SetStateAction<ThemeMode>>] => {
  const [mode, setMode] = useState<ThemeMode>(theme);

  const updateTheme = (e: EventAction, data: { shouldUseDarkColors: boolean }) => {
    persistStore.set('darkMode', data.shouldUseDarkColors ? 'true' : 'false');
    store.dispatch({
      type: SET_SETTING,
      key: "darkMode",
      value: data.shouldUseDarkColors
    });
    setMode(data.shouldUseDarkColors ? 'dark' : 'light');
  };

  useBus('theme:update', (event: EventAction) => updateTheme(event, event.payload), [setMode]);

  useEffect(() => {
    const removeListener = MessageChannel.on('theme:update', updateTheme);
    return removeListener;
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

export default useTheme;
