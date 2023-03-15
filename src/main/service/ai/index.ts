import { IpcMain } from 'electron';
import { AIService as AIServiceType } from '@main/type';
import { catcher } from '@common/utils';
import { appEventCenter } from '@main/event';

import { AIConversation, SendMessageOptions } from './conversation';

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

  async askQuestion(params: { question: string; options: SendMessageOptions }) {
    const { question, options } = params;
    const [err, result] = await catcher(
      this.conversation.question(question, options),
    );

    return {
      code: err ? 500 : 200,
      result: err || result,
    };
  }

  async askQuestionWithPrivateKey(params: {
    key: string;
    question: string;
    options: SendMessageOptions;
  }) {
    const { key, question, options } = params;
    const [err, result] = await catcher(
      this.conversation.questionWithPrivateKey(key, question, options),
    );

    return {
      code: err ? 500 : 200,
      result: err || result,
    };
  }
}
