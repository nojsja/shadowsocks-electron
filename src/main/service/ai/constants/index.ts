import { getApiKeys } from '@main/service/ai/utils';

import PROMPTS from './ai-prompts.json';

const ASSISTANT_LABEL_DEFAULT = 'ChatGPT';

export type Prompt = {
  act: string;
  prompt: string;
  act_zh: string;
  id: number;
};

export const PROMPT_CONSTANTS = {
  prompts: PROMPTS,
};

export const CHATGPT_CONSTANTS = {
  apiKeys: getApiKeys(),
  maxContinuousCount: 10,
  promptSuffix: `\n\n${ASSISTANT_LABEL_DEFAULT}:\n`,
};
