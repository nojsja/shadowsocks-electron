import path from 'path';
import { KeyvFile } from 'keyv-file';
import Keyv from 'keyv';

interface AIStoreOptions {
  dirPath?: string;
  namespace?: string;
  ttl?: number;
}
const JSON_STORE_FILENAME = 'message.store.json';

export class AIStore {
  static create(options: AIStoreOptions) {
    return new Keyv({
      store: new KeyvFile({
        filename: path.join(options.dirPath || '', JSON_STORE_FILENAME),
      }),
      namespace: options.namespace ?? 'ai',
      ttl: options.ttl ?? 1000 * 60 * 60 * 24 * 15,
    });
  }
}
