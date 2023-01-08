import { IpcMain, ServiceHandler } from '../types';
import { MessageChannel } from 'electron-re';

/**
  * ipcBridge [ipc通信连接桥]
  * @author nojsja
  * @param  {[Object]} ipc [main ipc]
  * @param  {[String]} moduleName [the target module name to link]
  * @return {[Promise]}  [result]
  */
 export function ipcBridge<T>(ipc: IpcMain, moduleName: string, model: T) {
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
