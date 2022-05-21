import produce from 'immer';
import { Settings } from "../../types";
import defaultStore from "../defaultStore";
import { OverAction, OVERRIDE_SETTING, SetAction, SET_SETTING } from "../actions/settings";

function settingsReducer(
  state: Settings = defaultStore.settings,
  action: SetAction | OverAction
): Settings {
  switch (action.type) {
    case SET_SETTING:
      return produce(state, draft => {
        draft.lang = state.lang || 'zh-CN';
        (draft as any)[(action as SetAction).key] = action.value;
      });
    case OVERRIDE_SETTING:
      return produce(state, draft => {
        Object.assign(draft, action.value);
      });
    default:
      return state;
  }
}

export default settingsReducer;
