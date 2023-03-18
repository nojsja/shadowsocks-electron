import { useEffect, useMemo, useRef } from 'react';
import { MessageChannel } from 'electron-re';
import { uniqueId } from 'lodash';

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

interface SessionInfo {
  sessionId: string;
}

type ChatMessage = {
  id: string;
  text: string;
  role: 'user' | 'assistant' | 'system';
  name?: string;
  delta?: string;
  detail?: any;
  parentMessageId?: string;
  conversationId?: string;
} & SessionInfo;

interface UseAIPromptOptions {
  sessionId?: string;
}

const getRandomKey = (keys: string[]) => {
  return keys[~~(keys.length * Math.random())];
};

export const useAIPrompt = ({ sessionId: _sessionId }: UseAIPromptOptions) => {
  const lastMessageID = useRef<string>();
  const streamMessageCallbacks = useRef<Array<(msg: string) => void>>([]);
  const { openAIAPIKey } = useTypedSelector((state) => state.settings);
  const apiKeys = openAIAPIKey ? openAIAPIKey.split(',') : [];
  const hasKey = apiKeys.length;
  const sessionId = useMemo(() => _sessionId || uniqueId(), [_sessionId]);

  const { data: prompts = [] } = useRequest<SystemPromps[]>(() => {
    return MessageChannel.invoke('main', 'service:ai', {
      action: 'getSystemPrompts',
    })
      .then(({ result }) => result)
      .catch((err) => {
        console.log(err);
      });
  });

  const onStreamMessageComing = (callback: (msg: string) => void) => {
    streamMessageCallbacks.current.push(callback);

    return () => {
      const index = streamMessageCallbacks.current.indexOf(callback);
      index !== -1 && streamMessageCallbacks.current.splice(index, 1);
    };
  };

  const sendMessageWithStream = (
    question: string,
    prompts?: string,
  ): Promise<string> => {
    const options: SendMessageOptions = {
      parentMessageId: lastMessageID.current || undefined,
      systemMessage: prompts,
    };

    return MessageChannel.invoke('main', 'service:ai', {
      action: 'askQuestionWithStream',
      params: {
        sessionId,
        question,
        options,
      },
    });
  };

  const sendMessage = (question: string, prompts?: string): Promise<string> => {
    const key = hasKey ? getRandomKey(apiKeys) : undefined;
    const options: SendMessageOptions = {
      parentMessageId: lastMessageID.current || undefined,
      systemMessage: prompts,
    };

    return MessageChannel.invoke('main', 'service:ai', {
      action: 'askQuestion',
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

  useEffect(() => {
    return MessageChannel.on('ai:stream-message', (e, message: ChatMessage) => {
      if (message.sessionId !== sessionId) return;
      lastMessageID.current = message.id;
      streamMessageCallbacks.current.forEach((callback) => {
        callback(message.text);
      });
    });
  }, [sessionId]);

  return {
    prompts,
    sendMessage,
    sendMessageWithStream,
    onStreamMessageComing,
  };
};
