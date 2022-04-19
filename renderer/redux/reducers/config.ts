import {
  ADD_SUBSCRIPTION,
  ADD_CONFIG,
  EditConfigAction,
  MoveConfigAction,
  REMOVE_CONFIG,
  EDIT_CONFIG,
  WIPE_CONFIG,
  MOVE_UP,
  MOVE_DOWN,
  MOVE_TO,
  TOP
} from "../actions/config";
import { Config, GroupConfig } from "../../types";
import defaultStore from "../defaultStore";
import { findAndModify } from "../../utils";

function configReducer(
  state: (Config | GroupConfig)[] = defaultStore.config,
  action: EditConfigAction | MoveConfigAction
): (Config | GroupConfig)[] {
  let sourceIndex: number, targetIndex: number, newState: (Config | GroupConfig)[];

  switch (action.type) {
    case ADD_SUBSCRIPTION:
      return [
        ...state,
        {
          ...(action as EditConfigAction).config as GroupConfig,
          id: action.id,
          type: "group",
        }
      ];
    case ADD_CONFIG:
      return [
        ...state,
        {
          ...(action as EditConfigAction).config,
          id: action.id
        }
      ];
    case REMOVE_CONFIG:
      return state.filter(i => i.id !== action.id);
    case EDIT_CONFIG:
      return findAndModify(state, action.id, (action as EditConfigAction).config);
    case WIPE_CONFIG:
      return [];
    case TOP:
      sourceIndex = state.findIndex((config, index) => config.id === action.id);
      newState = [...state];
      if (sourceIndex > 0) {
        newState = [newState.splice(sourceIndex, 1)[0], ...newState];
      }
      return newState;
    case MOVE_TO:
      sourceIndex = state.findIndex((config, index) => config.id === action.id);
      targetIndex  = state.findIndex((config, index) => config.id === (action as MoveConfigAction).target);
      newState = [...state];
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const newConfig = {...newState[sourceIndex]};
        newState.splice(targetIndex, 0, newConfig);
        if (sourceIndex > targetIndex) {
          newState.splice(sourceIndex + 1, 1);
        } else {
          newState.splice(sourceIndex, 1);
        }
      }
      return newState;
    case MOVE_UP:
      sourceIndex = state.findIndex((config, index) => config.id === action.id);
      newState = [...state];
      if (sourceIndex >= 0) {
        newState.splice((sourceIndex === 0) ? 0 : (sourceIndex - 1), 0, newState.splice(sourceIndex, 1)[0]);
      }
      return newState;
    case MOVE_DOWN:
      sourceIndex = state.findIndex((config, index) => config.id === action.id);
      newState = [...state];
      if (sourceIndex >= 0) {
        newState.splice(sourceIndex + 1, 0, newState.splice(sourceIndex, 1)[0]);
      }
      return newState;
    default:
      return state;
  }
}

export default configReducer;
