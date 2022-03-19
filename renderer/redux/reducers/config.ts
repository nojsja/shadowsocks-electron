import {
  ADD_CONFIG,
  EditConfigAction,
  REMOVE_CONFIG,
  EDIT_CONFIG,
  WIPE_CONFIG,
  MOVE_UP,
  MOVE_DOWN
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
    case MOVE_UP:
      const index = state.findIndex((config, index) => config.id === action.id);
      const newState = [...state];
      if (index >= 0) {
        newState.splice((index === 0) ? 0 : (index - 1), 0, newState.splice(index, 1)[0]);
      }
      return newState;
    case MOVE_DOWN:
      const index2 = state.findIndex((config, index) => config.id === action.id);
      const newState2 = [...state];
      if (index2 >= 0) {
        newState2.splice(index2 + 1, 0, newState2.splice(index2, 1)[0]);
      }
      return newState2;
    default:
      return state;
  }
}

export default configReducer;
