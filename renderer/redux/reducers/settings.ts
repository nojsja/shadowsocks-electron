import { Settings } from "../../types";
import defaultStore from "../defaultStore";
import { OVERRIDE_SETTING, SetSettingAction, SET_SETTING } from "../actions/settings";

function settingsReducer(
  state: Settings = defaultStore.settings,
  action: SetSettingAction
): Settings {
  switch (action.type) {
    case SET_SETTING:
      return {
        ...state,
        lang: state.lang || 'zh-CN',
        [action.key]: action.value
      };
    case OVERRIDE_SETTING:
      return {
        ...state,
        ...(action.value)
      }
    default:
      return state;
  }
}

export default settingsReducer;
