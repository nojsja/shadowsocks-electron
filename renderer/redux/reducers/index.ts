import { combineReducers } from "redux";
import { TypedUseSelectorHook, useSelector } from "react-redux";

import { RootState } from "../../types";
import configReducer from "./config";
import settingsReducer from "./settings";
import statusReducer from "./status";
import notificationReducer from "./notifications";

const appReducer = combineReducers({
  notifications: notificationReducer,
  config: configReducer,
  status: statusReducer,
  settings: settingsReducer
});

type AppReducerParams = Parameters<typeof appReducer>;

export const CLEAR_STORE = "CLEAR_STORE";

const rootReducer = (
  state: AppReducerParams[0],
  action: AppReducerParams[1]
) => {
  if (action.type === "CLEAR_STORE") {
    import("../store").then(({ persistor }) => persistor.purge());
    (state as any) = undefined;
  }

  return appReducer(state, action);
};

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export default rootReducer;
