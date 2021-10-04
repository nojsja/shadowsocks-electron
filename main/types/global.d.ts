declare global {
  namespace NodeJS {
    interface Global {
      ipcMainProcess: unknown
    }
  }
  namespace Electron {
    interface Global {
      ipcMainProcess: unknown
    }
  }
}
