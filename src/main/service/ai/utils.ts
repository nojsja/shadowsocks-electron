import fetch, { RequestInfo, RequestInit } from 'node-fetch';
import { decrypt } from '@main/helpers/encryptor';
import { HttpsProxyAgent } from 'https-proxy-agent';

export function getApiKeys() {
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY?.split(',');
  }
  const keysStr = decrypt({
    iv: '5b6fc1af5fc6de74ddbd2d493f376b92',
    content:
      '65555399f490213d972111892d168b54bdccb44866b73d15ab59db2b185710838b9f72c97181ac3f9379c6b69010ed375671afa67b17bd2c510eeb422ffa8d3122af4723682f7f02697413d34e6af6b5bf2f966533677e55f0a1818aa0f1b2510104ed7c94e8365fa6e919dd4b828abf8875fa0ac851d8034f02a845cc5f0e7ccf55e5621b3112acec35dad065e4ba279589cc85fefda9104aa4948e1d2e43369540a33debc09efaec4d54df824e22cd2b66417ededac0011c8f50ff6cf2a5d59aba967447c873a7989d95db4a47b3359cdb850000caeca024b7831e0379037b0d6a25da6f3ebea146929b90547f8e0172800f921874b0b0dae996f44ffa07f077d816',
  });

  return keysStr.split(',');
}

export function fetchWithProxy(
  proxyHost: string,
  proxyPort: number,
  protocol = 'http',
) {
  const proxyAgent = new HttpsProxyAgent(
    `${protocol}://${proxyHost}:${proxyPort}`,
  );

  return (url: RequestInfo, init?: RequestInit | undefined) =>
    fetch(url, {
      agent: proxyAgent,
      ...(init ?? {}),
    });
}
