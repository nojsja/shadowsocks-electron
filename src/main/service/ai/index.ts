import { IpcMain } from 'electron';
import { AIService as AIServiceType } from '@main/type';
import { catcher } from '@common/utils';
import { appEventCenter } from '@main/event';

import type {
  SendMessageOptionsWithStream,
  SendMessageOptionsWithoutStream,
} from '@main/type';

import { AIConversation } from './conversation';
import type { ChatMessage } from './conversation';

export class AIService implements AIServiceType {
  ipc: IpcMain;
  conversation: AIConversation;

  constructor(ipc: IpcMain) {
    this.ipc = ipc;
    this.conversation = new AIConversation();
  }

  async setAIProxy(params: { enabled: boolean }) {
    const { enabled } = params;
    appEventCenter.emit('service:ai:proxy-status', { enabled });
  }

  async getSystemPrompts() {
    const [err, prompts] = await catcher(import('./constants/ai-prompts.json'));
    return {
      code: err ? 500 : 200,
      result: prompts?.default ?? [],
    };
  }

  async askQuestionWithStream(params: {
    question: string;
    key?: string;
    sessionId: string;
    options: SendMessageOptionsWithStream;
  }) {
    const { question, options, key, sessionId } = params;
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    const { stream, ...others } = options;
    const messageOptions = {
      stream: true,
      onProgress: (message: ChatMessage) => {
        appEventCenter.emit('sendToWeb', 'ai:stream-message', {
          ...message,
          sessionId,
        });
      },
      ...others,
    };
    let err, result;

    if (key) {
      [err, result] = await catcher(
        this.conversation.questionWithPrivateKey(key, question, messageOptions),
      );
    } else {
      [err, result] = await catcher(
        this.conversation.question(question, messageOptions),
      );
    }

    return {
      code: err ? 500 : 200,
      result: err || result,
    };
  }

  async askQuestion(params: {
    question: string;
    key?: string;
    options: SendMessageOptionsWithoutStream;
  }) {
    const { question, options, key } = params;
    let err, result;

    if (key) {
      [err, result] = await catcher(
        this.conversation.questionWithPrivateKey(key, question, options),
      );
    } else {
      [err, result] = await catcher(
        this.conversation.question(question, options),
      );
    }

    return {
      code: err ? 500 : 200,
      result: err || result,
    };
  }
}
