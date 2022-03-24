import {
  ADD_SUBSCRIPTION,
  ADD_CONFIG,
  EditConfigAction,
  REMOVE_CONFIG,
  EDIT_CONFIG,
  WIPE_CONFIG,
  MOVE_UP,
  MOVE_DOWN,
  TOP
} from "../actions/config";
import { Config, GroupConfig } from "../../types";
import defaultStore from "../defaultStore";
import { findAndModify } from "../../utils";

function configReducer(
  state: (Config | GroupConfig)[] = defaultStore.config,
  action: EditConfigAction
): (Config | GroupConfig)[] {
  switch (action.type) {
    case ADD_SUBSCRIPTION:
      return [
        ...state,
        {
          ...action.config as GroupConfig,
          id: action.id,
          type: "group",
        }
      ];
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
      return findAndModify(state, action.id, action.config);
    case WIPE_CONFIG:
      return [];
    case TOP:
      const index3 = state.findIndex((config, index) => config.id === action.id);
      let newState3 = [...state];
      if (index3 > 0) {
        newState3 = [newState3.splice(index3, 1)[0], ...newState3];
      }
      return newState3;
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
