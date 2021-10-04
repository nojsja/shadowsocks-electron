import {
  ADD_CONFIG,
  EditConfigAction,
  REMOVE_CONFIG,
  EDIT_CONFIG,
  WIPE_CONFIG
} from "../actions/config";
import { Config } from "../../types";
import defaultStore from "../defaultStore";

function configReducer(
  state: Config[] = defaultStore.config,
  action: EditConfigAction
): Config[] {
  switch (action.type) {
    case ADD_CONFIG:
      return [
        ...state,
        {
          ...action.config,
          id: action.id
        }
      ];
    case REMOVE_CONFIG:
      return state.filter(i => i.id !== action.id);
    case EDIT_CONFIG:
      return state.map(i => (i.id === action.id ? action.config : i));
    case WIPE_CONFIG:
      return [];
    default:
      return state;
  }
}

export default configReducer;
