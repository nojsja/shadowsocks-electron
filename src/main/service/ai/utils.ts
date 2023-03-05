export function getApiKeys() {
  const defaultKeys = [
    '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',
    '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',
    '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',
    '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',
    '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'
  ];
  const keys = process.env.OPENAI_API_KEY?.split(',') ?? defaultKeys;

  return keys;
}