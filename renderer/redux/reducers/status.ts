import { Status } from "../../types";
import defaultStore from "../defaultStore";
import { SetStatusAction, SET_STATUS } from "../actions/status";

function statusReducer(
  state: Status = defaultStore.status,
  action: SetStatusAction
): Status {
  switch (action.type) {
    case SET_STATUS:
      return {
        ...state,
        [action.key]: action.value
      };
    default:
      return state;
  }
}

export default statusReducer;
