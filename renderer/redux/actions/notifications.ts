import { SnackbarKey, SnackbarMessage } from "notistack";
import { Notification } from "../../types";

export const ENQUEUE_SNACKBAR = 'ENQUEUE_SNACKBAR';
export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR';
export const REMOVE_SNACKBAR = 'REMOVE_SNACKBAR';

export const enqueueSnackbar = (message: SnackbarMessage, notification: Notification) => {
    const key = notification?.key;

    return {
        type: ENQUEUE_SNACKBAR,
        notification: {
            ...notification,
            message,
            key: key || new Date().getTime() + Math.random(),
        },
    };
};

export const closeSnackbar = (key: SnackbarKey) => ({
    type: CLOSE_SNACKBAR,
    dismissAll: !key, // dismiss all if no key has been defined
    key,
});

export const removeSnackbar = (key: SnackbarKey) => ({
    type: REMOVE_SNACKBAR,
    key,
});
