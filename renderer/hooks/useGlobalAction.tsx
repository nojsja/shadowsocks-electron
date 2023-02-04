import { dispatch as dispatchEvent } from 'use-bus';

export interface GlobalActionItem {
  type: string;
  payload?: any
}

export interface GlobalActionStore {
  [type: string]: GlobalActionItem;
}

const store: GlobalActionStore = {};

export const set = (payload: GlobalActionItem) => {
  if (typeof payload?.type !== 'string') {
    throw new Error('ActionStore: [type] must be a string');
  }
  Object.assign(store, {
    [payload.type]: payload
  });
  dispatchEvent({
    type: `action:set:${payload.type}`,
    payload: payload
  });

  return payload ?? null;
};

export const get = (payload: GlobalActionItem) => {
  const action = store[payload.type];

  if (action) {
    dispatchEvent({
      type: `action:get:${action.type}`,
      payload: action
    });
    delete store[payload.type];
    return action;
  }

  return null;
};

export const dispatchAction = (payload: GlobalActionItem) => {
  dispatchEvent({
    type: `action:get:${payload.type}`,
    payload: payload.payload
  });
}

export const useGlobalAction = (initialStore?: GlobalActionStore) => {
  Object.assign(store, initialStore ?? {});

  return new Proxy(store, {
    get(target, attr) {
      if (typeof attr !== 'string') return null;
      return get({
        type: attr
      });
    },
    set(target, attr, value) {
      if (typeof attr !== 'string') {
        throw new Error('ActionStore: [type] must be a string');
      }
      set({
        type: attr,
        payload: value
      });

      return true;
    }
  });
};

export default useGlobalAction;
