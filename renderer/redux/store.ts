import { createStore, applyMiddleware, compose } from "redux";
import Store from 'electron-store';
import thunk from 'redux-thunk';
import { persistReducer, persistStore, PersistConfig } from "redux-persist";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import createElectronStorage from "redux-persist-electron-storage";
import rootReducer from "./reducers";
import { RootState } from "../types";

const persistConfig: PersistConfig<RootState> = {
  key: "root",
  storage: createElectronStorage({
    electronStore: new Store()
  }),
  stateReconciler: autoMergeLevel2,
  blacklist: ["status", "notifications"]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(
  persistedReducer,
  compose(
    applyMiddleware(thunk),
    (window as any).devToolsExtension ? (window as any).devToolsExtension() : (f: any) => f
  )
);

export const persistor = persistStore(store as any);
