import { decrypt } from '@main/helpers/encryptor';

export function getApiKeys() {
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY?.split(',');
  }
  const keysStr = decrypt({
    iv: 'd5349b8f40aaeb3273e4187aef48b3b8',
    content: '2b7ce831c405970305bc6e39ac863a49eadb2c5e8b5c9d6be3f24ebcabe0713f38e28d9aa5bc0014cd681a419547bec440eb1ba7b284ff04d4e072f12d6d735f34934bd1e2a6f6a00d31ba9f304e4aa070bb8cb73d837118394e0302c9a465e10440fae098b99b4e0267a5c4f3ed6560a9986943a497e7361afb5a945d474ecc65d5336f7d57555abdb685f9de9fa20102ec190ac342d1a367e78b1289fd3e1786205f9c563f0cdb4cb6171f2c570d3a5eb4dac1fea474fbd8b70e756b0ca7abf48eed3c7afa6c41025b519002818278e1a39f3bf43541d6c597c82402358b96e40d18405fff8702cd8771b90fdfb2e5944c22b65024cd608daaf49879d78d5e831202'
  });

  return keysStr.split(',');
}