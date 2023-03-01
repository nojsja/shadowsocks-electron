/// <reference types="react-scripts" />
declare interface NodeModule {
  hot: {
    accept(path: string, callback?: () => void): void
  }
}