import type { SendMessageOptions, ChatMessage } from 'chatgpt';

import { PrivateAIClient } from './private-client';
import { PublicAIClient } from './public-client';

export type { ChatMessage, SendMessageOptions };

export class AIConversation {
  private publicClient?: PublicAIClient;
  private privateClient?: PrivateAIClient;
  private abortController?: AbortController;

  constructor() {
    this.abortController = new AbortController();
  }

  async publicClientReady() {
    if (!this.publicClient) {
      this.publicClient = new PublicAIClient();
      await this.publicClient.ready();
    }
  }

  async privateClientReady() {
    if (!this.privateClient) {
      this.privateClient = new PrivateAIClient();
    }
  }

  async question(question: string, options: SendMessageOptions) {
    await this.publicClientReady();
    const message = await this.publicClient?.trySendMessage(question, {
      abortSignal: this.abortController?.signal,
      ...options,
    });

    return message;
  }

  async questionWithPrivateKey(
    key: string,
    question: string,
    options: SendMessageOptions,
  ) {
    await this.privateClientReady();
    const message = await this.privateClient?.trySendMessage(key, question, {
      abortSignal: this.abortController?.signal,
      ...options,
    });

    return message;
  }

  async cancelReply() {
    this.abortController?.abort();
    this.abortController = new AbortController();
  }
}
