import path from 'path';
import EventEmitter from 'events';
import { ChatGPTAPI, SendMessageOptions } from 'chatgpt';

import { AIStore } from '@main/dao';
import { pathRuntime } from '@main/config';
import { catcher } from '@common/utils';

import { CHATGPT_CONSTANTS } from './constants';
import { fetchWithProxy, getApiKeys } from './utils';

const fetch = fetchWithProxy();

interface ClientInfo {
  client: ChatGPTAPI;
  status: 'running' | 'invalid';
  errorCount: number;
}

export class PublicAIClient extends EventEmitter {
  constructor() {
    super();
    this.core = new Set<ClientInfo>();
    this.status = 'uninitialized';
    this.init();
    this.index = 0;
  }
  core: Set<ClientInfo>;
  status: 'uninitialized' | 'ready' | 'error';
  index: number;

  private async init() {
    const messageStore = AIStore.create({
      dirPath: path.join(pathRuntime, 'ai'),
    });
    const [err, apiKeys = []] = await catcher(getApiKeys());

    if (err) {
      console.log(err);
      this.status = 'error';
      this.emit('error');
      return;
    }

    apiKeys.forEach((key) => {
      const client = new ChatGPTAPI({
        apiKey: key,
        debug: true,
        fetch,
        messageStore: messageStore,
      });
      this.core.add({
        status: 'running',
        errorCount: 0,
        client,
      });
    });

    this.status = 'ready';
    this.emit('ready');
  }

  async getAvailableClient() {
    const clients = this.getClientsInfo().filter(
      (info) => info.status === 'running',
    );
    if (clients.length === 0) return null;

    const client = clients[this.index % clients.length];
    this.index++;

    return client;
  }

  async ready() {
    if (this.status === 'ready') {
      return true;
    }

    return new Promise((resolve) => {
      this.once('ready', () => {
        resolve(true);
      });
    });
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
    clients.forEach((client) => {
      client.errorCount = 0;
      client.status = 'running';
    });
  }

  async trySendMessage(
    question: string,
    options: SendMessageOptions,
    tryCount = 2,
  ) {
    for (let i = 0; i < tryCount; i++) {
      const res = await this.sendMessage(question, options).catch((err) => {
        console.error(err);
        return null;
      });
      if (res) return res;
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
