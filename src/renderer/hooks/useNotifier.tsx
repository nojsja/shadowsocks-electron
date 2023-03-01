import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { SnackbarKey, SnackbarMessage, useSnackbar } from 'notistack';
import { createStyles, makeStyles, Typography } from '@material-ui/core';
import { Notification } from '@renderer/types';

import { store } from '@renderer/redux/store';
import { enqueueSnackbar, removeSnackbar } from '@renderer/redux/actions/notifications';
import { useTypedSelector } from '@renderer/redux/reducers';

let displayed: SnackbarKey[] = [];

export const useStyles = makeStyles(() => createStyles({
  notifierBody: {
    wordBreak: 'break-word',
  },
}));

export const Message = {
  success: (message: SnackbarMessage, options?: Notification) => {
    store.dispatch(enqueueSnackbar(message, { variant: 'success', ...(options ?? {}) }))
  },
  error: (message: SnackbarMessage, options?: Notification) => {
    store.dispatch(enqueueSnackbar(message, { variant: 'error', ...(options ?? {}) }))
  },
  warning: (message: SnackbarMessage, options?: Notification) => {
    store.dispatch(enqueueSnackbar(message, { variant: 'warning', ...(options ?? {}) }))
  },
  default: (message: SnackbarMessage, options?: Notification) => {
    store.dispatch(enqueueSnackbar(message, { variant: 'default', ...(options ?? {}) }))
  },
};

export const useNotifier = () => {
    const dispatch = useDispatch();
    const styles = useStyles();

    const notifications = useTypedSelector(store => store.notifications);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const storeDisplayed = (id: SnackbarKey) => {
        displayed = [...displayed, id];
    };

    const removeDisplayed = (id: SnackbarKey) => {
        displayed = [...displayed.filter(key => id !== key)];
    };

    useEffect(() => {
        notifications.forEach(({ key, message, dismissed = false, ...options }) => {
            if (dismissed) {
                // dismiss snackbar using notistack
                closeSnackbar(key);
                return;
            }

            // do nothing if snackbar is already displayed
            if (displayed.includes(key)) return;

            // display snackbar using notistack
            enqueueSnackbar((
              <Typography className={styles.notifierBody} variant="body1">{message}</Typography>
            ), {
                key,
                ...options,
                onClose: (event, reason, myKey) => {
                    if ((options as any).onClose) {
                        (options as any).onClose(event, reason, myKey);
                    }
                },
                onExited: (event, myKey) => {
                    // remove this snackbar from redux store
                    dispatch(removeSnackbar(myKey));
                    removeDisplayed(myKey);
                },
            });

            // keep track of snackbars that we've displayed
            storeDisplayed(key);
        });

    }, [notifications, closeSnackbar, enqueueSnackbar, dispatch]);
};

export default useNotifier;
