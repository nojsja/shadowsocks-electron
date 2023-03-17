import initEnctryptor from './wasm_exec_node';

export const getOpenAIKeys = async () => {
  if (!(global as any).GetOpenAIKeys) {
    await initEnctryptor();
  }
  return (global as any).GetOpenAIKeys();
};
