import { MessageChannel } from 'electron-re';

import { IpcMain, ServiceHandler } from '../types';

/**
  * @name ipcBridge [ipc bridge between main and renderer]
  * @param  {[Object]} ipc [main ipc]
  * @param  {[String]} moduleName [the module name to link]
  * @return {[Promise]}  [the result of the action]
  */
export function ipcBridge<T extends object>(ipc: IpcMain, moduleName: string, model: T) {
  MessageChannel.handle(moduleName, async function(event, args: { action: string, params: any }) {
    const { action, params } = args;
    let result: unknown;

    if (action && action in model) {
      result = await ((model as any)[action] as ServiceHandler)(params)
        .catch((error: Error) => {
          console.error(error);
        });
    }

    return result || {
      code: 404,
      result: `Unknown action: ${action}`
    };
  });

  return model;
}
