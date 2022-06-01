import { useState } from 'react';
import useBus, { EventAction, dispatch as dispatchEvent } from 'use-bus';
import produce from 'immer';

export interface GlobalActionItem {
  type: string;
  payload: any
};

export interface GlobalActionStore {
  [type: string]: GlobalActionItem;
}

export default (store?: GlobalActionStore) => {
  const [actions, setActions] = useState<GlobalActionStore>(store ?? {});

  useBus('action:set', (event: EventAction) => {
    const newActions = produce(actions, draft => {
      draft[event.type] = event.payload;
    });
    dispatchEvent({
      type: `action:set:${event.payload.type}`,
      payload: event.payload
    });
    setActions(newActions);
  }, [actions]);

  useBus('action:get', (event: EventAction) => {
    const { payload } = event;
    const newActions = produce(actions, draft => {
      const action = draft[payload.type];
      console.log('action:get', action);
      if (action) {
        payload.callback && payload.callback(action);
        dispatchEvent({
          type: `action:get:${action.type}`,
          payload: action
        });
        delete draft[payload.type];
      }
    });
    setActions(newActions);
  }, [actions]);

  return [actions, setActions];
};
