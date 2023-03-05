import path from 'path';
import { KeyvFile } from 'keyv-file';
import Keyv from 'keyv';

interface AIStoreOptions {
  dirPath?: string;
}
const JSON_STORE_FILENAME = 'message.store.json';

export class AIStore {
  static create(options: AIStoreOptions) {
    return new Keyv({
      store: new KeyvFile({
        filename: path.join(options.dirPath || '', JSON_STORE_FILENAME),
      })
    });
  }
}
