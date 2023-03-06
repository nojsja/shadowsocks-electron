import { useRef } from 'react';
import { MessageChannel } from 'electron-re';

import { useTypedSelector } from '@renderer/redux/reducers';
import { useRequest } from '@renderer/hooks';

interface SendMessageOptions {
  name?: string;
  parentMessageId?: string;
  messageId?: string;
  stream?: boolean;
  systemMessage?: string;
  timeoutMs?: number;
}

interface SystemPromps {
  act: string;
  prompt: string;
  act_zh: string;
  id: number;
}

const getRandomKey = (keys: string[]) => {
  return keys[~~(keys.length * Math.random())];
};

export const useAIPrompt = () => {
  const lastMessageID = useRef(null);
  const { openApiKey } = useTypedSelector((state) => state.settings);
  const apiKeys = openApiKey ? openApiKey.split(',') : [];
  const hasKey = apiKeys.length;

  const { data: prompts = [] } = useRequest<SystemPromps[]>(() => {
    return MessageChannel.invoke('main', 'service:ai', {
      action: 'getSystemPrompts',
    })
      .then(({ result }) => result)
      .catch((err) => {
        console.log(err);
      });
  });

  const sendMessage = (question: string, prompts?: string): Promise<string> => {
    const targetUrl = hasKey ? 'askQuestionWithPrivateKey' : 'askQuestion';
    const key = hasKey ? getRandomKey(apiKeys) : undefined;
    const options: SendMessageOptions = {
      parentMessageId: lastMessageID.current || undefined,
      systemMessage: prompts,
    };

    return MessageChannel.invoke('main', 'service:ai', {
      action: targetUrl,
      params: {
        key,
        question,
        options,
      },
    }).then(({ code, result }) => {
      if (code === 200) {
        lastMessageID.current = result.id;
        return result.text;
      }
      throw new Error(result.message ?? 'send message error');
    });
  };

  return {
    prompts,
    sendMessage,
  };
};
