import defaultStore from "../defaultStore";
import { EnqueueSnackbarOptions } from '../../types';
import { ENQUEUE_SNACKBAR, CLOSE_SNACKBAR, REMOVE_SNACKBAR } from '../actions/notifications';

function notificationsReducer(
  state: EnqueueSnackbarOptions[] = defaultStore.notifications,
  action: any
): EnqueueSnackbarOptions[] {
  switch (action.type) {
    case ENQUEUE_SNACKBAR:
      return [
        ...state,
        {
          key: action.key,
          ...action.notification,
        },
      ];

    case CLOSE_SNACKBAR:
      return state.map(notification => (
        (action.dismissAll || notification.key === action.key)
          ? { ...notification, dismissed: true }
          : { ...notification }
      ));

    case REMOVE_SNACKBAR:
      return state.filter(
        notification => notification.key !== action.key,
      );

    default:
      return state;
  }
}

export default notificationsReducer;
