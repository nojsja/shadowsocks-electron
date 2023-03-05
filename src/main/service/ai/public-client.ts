import path from 'path';
import type { ChatGPTAPI, SendMessageOptions } from 'chatgpt';
import { createRequire } from 'module';

import { AIStore } from '@main/dao';
import { pathRuntime } from '@main/config';
import { CHATGPT_CONSTANTS } from './constants';

const require = createRequire(import.meta.url);

interface ClientInfo {
  client: ChatGPTAPI;
  status: 'running' | 'invalid';
  errorCount: number;
}

export class PublicAIClient {
    constructor() {
      this.core = new Set<ClientInfo>();
      this.initCore();
      this.index = 0;
    }
    core: Set<ClientInfo>
    index: number

    private async initCore() {
      const { ChatGPTAPI } = require('chatgpt');
      const messageStore = AIStore.create({
        dirPath: path.join(pathRuntime, 'ai')
      });

      CHATGPT_CONSTANTS.apiKeys.forEach(key => {
        const client = new ChatGPTAPI({
          apiKey: key,
          debug: true,
          messageStore: messageStore,
        });
        this.core.add({
          status: 'running',
          errorCount: 0,
          client,
        });
      });
    }

    async getAvailableClient() {
      const clients = this.getClientsInfo().filter(info => info.status === 'running');
      if (clients.length === 0) return null;

      const client = clients[this.index % clients.length];
      this.index++;

      return client;
    }

    getClientsInfo() {
      return Array.from(this.core.values());
    }

    setClientDirty(client: ClientInfo) {
      client.errorCount++;
      if (client.errorCount > CHATGPT_CONSTANTS.maxContinuousCount) {
        client.status = 'invalid';
      }
    }

    forceSetClientClean() {
      const clients = this.getClientsInfo();
      clients.forEach(client => {
        client.errorCount = 0;
        client.status = 'running';
      });
    }

    async trySendMessage(question: string, options: SendMessageOptions, tryCount = 2) {
      for (let i = 0; i < tryCount; i++) {
        const res = await this.sendMessage(question, options).catch(err => {
          console.error(err);
          return null;
        });
        if (res) {
          return res;
        }
      }

      throw new Error('Try send message error');
    }

    async sendMessage(question: string, options: SendMessageOptions) {
      const client = await this.getAvailableClient();

      if (!client) {
        this.forceSetClientClean();
        throw new Error('No available clients');
      }

      try {
        const res = await client.client.sendMessage(question, options);
        return res;
      } catch (err) {
        this.setClientDirty(client);
        throw err;
      }
    }
}
