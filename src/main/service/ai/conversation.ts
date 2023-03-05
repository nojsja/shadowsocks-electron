import type {
  SendMessageOptions,
  ChatMessage
} from 'chatgpt';

import { PrivateAIClient } from './private-client';
import { PublicAIClient } from './public-client';

export { ChatMessage, SendMessageOptions };

export class AIConversation {
  private publicClient?: PublicAIClient;
  private privateClient?: PrivateAIClient;

  async publicClientReady() {
    if (!this.publicClient) {
      this.publicClient = new PublicAIClient();
    }
  }

  async privateClientReady() {
    if (!this.privateClient) {
      this.privateClient = new PrivateAIClient();
    }
  }

  async question(question: string, options: SendMessageOptions) {
    await this.publicClientReady();
    return await this.publicClient?.trySendMessage(question, options);
  }

  async questionWithPrivateKey(key: string, question: string, options: SendMessageOptions) {
    await this.privateClientReady();
    return await this.privateClient?.trySendMessage(key, question, options);
  }
}