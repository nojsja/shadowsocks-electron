import produce from "immer";
import {
  ADD_SUBSCRIPTION,
  UPDATE_SUBSCRIPTION,
  ADD_CONFIG,
  EditConfigAction as ECA,
  MoveConfigAction as MCA,
  AddSubscriptionAction as ASA,
  UpdateSubscriptionAction as USA,
  REMOVE_CONFIG,
  EDIT_CONFIG,
  WIPE_CONFIG,
  MOVE_UP,
  MOVE_DOWN,
  MOVE_TO,
  TOP,
} from "../actions/config";
import { Config, GroupConfig } from "../../types";
import defaultStore from "../defaultStore";
import { findAndModify } from "../../utils";

function configReducer(
  state: (Config | GroupConfig)[] = defaultStore.config,
  action: ECA | MCA | ASA | USA
): (Config | GroupConfig)[] {
  let sourceIndex: number, targetIndex: number, newState: (Config | GroupConfig)[];

  switch (action.type) {
    case ADD_SUBSCRIPTION:
      // eslint-disable-next-line array-callback-return
      return produce(state, draft => {
        draft.push({
          ...(action as ASA).config,
          id: action.id,
          url: (action as ASA).url,
          type: "group",
        })
      });
    case UPDATE_SUBSCRIPTION:
      return produce(state, draft => {
        const isSearchKeyMatchName = (action as USA).searchKey === 'name';
        const isSearchKeyMatchId = (action as USA).searchKey === 'id';

        // eslint-disable-next-line array-callback-return
        draft.map((config) => {
          if ((config as GroupConfig).name !== (action as USA).config.name && isSearchKeyMatchName) return;
          if ((config as GroupConfig).id !== (action as USA).id && isSearchKeyMatchId) return;

          Object.assign(config, {
            ...config,
            ...(action as USA).config,
            servers: (action as USA).config.servers.map((server, i) => {
              return {
                ...server,
                id: (config as GroupConfig).servers[i]?.id ?? server.id,
              };
            })
          });
        });
      });
    case ADD_CONFIG:
      return produce(state, draft => {
        draft.push({
          ...(action as ECA).config,
          id: action.id
        });
      });
    case REMOVE_CONFIG:
      return state.filter(i => i.id !== action.id);
    case EDIT_CONFIG:
      return produce(state, draft => {
        findAndModify(draft, action.id, (action as ECA).config);
      });
    case WIPE_CONFIG:
      return [];
    case TOP:
      sourceIndex = state.findIndex((config) => config.id === action.id);
      newState = [...state];
      if (sourceIndex > 0) {
        newState = [newState.splice(sourceIndex, 1)[0], ...newState];
      }
      return newState;
    case MOVE_TO:
      sourceIndex = state.findIndex((config) => config.id === action.id);
      targetIndex  = state.findIndex((config) => config.id === (action as MCA).target);
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
      sourceIndex = state.findIndex((config) => config.id === action.id);
      newState = [...state];
      if (sourceIndex >= 0) {
        newState.splice((sourceIndex === 0) ? 0 : (sourceIndex - 1), 0, newState.splice(sourceIndex, 1)[0]);
      }
      return newState;
    case MOVE_DOWN:
      sourceIndex = state.findIndex((config) => config.id === action.id);
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
