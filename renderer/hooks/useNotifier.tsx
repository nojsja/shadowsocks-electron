import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { SnackbarKey, useSnackbar } from 'notistack';

import { removeSnackbar } from '@renderer/redux/actions/notifications';
import { useTypedSelector } from '@renderer/redux/reducers';

let displayed: SnackbarKey[] = [];

export const useNotifier = () => {
    const dispatch = useDispatch();

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
            enqueueSnackbar(message, {
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
