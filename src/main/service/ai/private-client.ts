import { ChatGPTAPI, SendMessageOptions } from 'chatgpt';
import path from 'path';
import QuickLRU from 'quick-lru';

import { pathRuntime } from '@main/config';
import { AIStore } from '@main/dao';
import { fetchWithProxy } from './utils';

const fetch = fetchWithProxy({
  proxyHost: '127.0.0.1',
  proxyPort: 1095,
  enable: true,
});

interface Props {
  maxPoolSize?: number;
}

export class PrivateAIClient {
  constructor(props?: Props) {
    this.pool = new QuickLRU<string, ChatGPTAPI>({
      maxSize: props?.maxPoolSize ?? 12,
    });
  }

  pool: QuickLRU<string, ChatGPTAPI>;

  async trySendMessage(
    apiKey: string,
    question: string,
    options: SendMessageOptions,
    tryCount = 2,
  ) {
    if (!apiKey) {
      throw new Error('Invalid OpenAI Key');
    }

    const client = await this.getAvailableClient(apiKey);

    if (!client) {
      throw new Error('OpenAI Client not found');
    }

    for (let i = 0; i < tryCount; i++) {
      const res = await this.sendMessage(client, question, options).catch(
        (err) => {
          console.error(err);
          return null;
        },
      );

      if (res) {
        return res;
      }
    }

    throw new Error('Try send message error');
  }

  async sendMessage(
    client: ChatGPTAPI,
    question: string,
    options: SendMessageOptions,
  ) {
    if (!client) {
      throw new Error('No available clients');
    }

    const res = await client.sendMessage(question, options);
    return res;
  }

  async getAvailableClient(key: string) {
    if (this.pool.has(key)) {
      return this.pool.get(key);
    }

    const messageStore = AIStore.create({
      dirPath: path.join(pathRuntime, 'ai'),
    });

    const client = new ChatGPTAPI({
      apiKey: key,
      debug: true,
      fetch,
      messageStore: messageStore,
    });

    this.pool.set(key, client);

    return client;
  }
}
