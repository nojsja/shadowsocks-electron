import useBus, { EventAction } from 'use-bus';

export interface TaskConsoleData {
  type: 'log' | 'error' | 'warn' | 'info';
  taskId: string;
  data: string;
}

const consoleMap = new Map<string, TaskConsoleData[]>();
const consoleListenerMap = new Map<string, Array<(data: TaskConsoleData) => void>>();
export const CONSOLE_BUFFER_SIZE = 100;

const getConsoleData = (taskId: string) => {
  if (consoleMap.has(taskId)) {
    return (consoleMap.get(taskId) ?? []).map((taskConsole) => {
      let data: string;
      let type: TaskConsoleData['type'] = taskConsole.type;

      try {
        data = (typeof taskConsole.data === 'string')
          ? taskConsole.data
          : Object.prototype.toString.call(taskConsole.data);
      } catch (error) {
        data = 'invalid message!';
        type = 'error';
      }

      return ({
        ...taskConsole,
        type,
        data,
      });
    });
  }
  return [];
};

const setConsoleData = (taskId: string, type: TaskConsoleData['type'], data: unknown) => {
  const currentData = getConsoleData(taskId);
  let dataString: string;

  try {
    dataString
      = (typeof data === 'string')
        ? data
        : Object.prototype.toString.call(data);
  } catch (error) {
    dataString = 'invalid message!';
    type = 'error';
  }

  const newConsoleData = {
    taskId,
    type,
    data: dataString,
  };

  currentData.push(newConsoleData);
  currentData.splice(0, currentData.length - CONSOLE_BUFFER_SIZE);
  consoleMap.set(taskId, currentData);

  return newConsoleData;
};

const triggerConsoleListener = (taskId: string, data: TaskConsoleData) => {
  const listeners = consoleListenerMap.get(taskId) ?? [];
  listeners.forEach((listener) => {
    listener(data);
  });
};

export const useTerminalService = () => {
  useBus('event:stream:workflow:task-console', (event: EventAction) => {
    const {
      data,
      taskId,
      type,
    } = event.payload as TaskConsoleData;
    const formattedData = setConsoleData(taskId, type, data);

    triggerConsoleListener(taskId, formattedData);
  }, []);
}

export const useTerminalVisitor = () => {
  const registry = (taskId: string, callback: (data: TaskConsoleData) => void) => {
    const currentListeners = consoleListenerMap.get(taskId) ?? [];
    consoleListenerMap.set(taskId, [...currentListeners, callback]);
  };

  const unregistry = (taskId: string, callback: (data: TaskConsoleData) => void) => {
    const currentListeners = consoleListenerMap.get(taskId) ?? [];
    const newListeners = currentListeners.filter((listener) => listener !== callback);
    consoleListenerMap.set(taskId, newListeners);
  };

  const wipe = (taskId: string) => {
    consoleMap.delete(taskId);
  };

  return {
    get: getConsoleData,
    set: setConsoleData,
    wipe,
    registry,
    unregistry,
  };
};