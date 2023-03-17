import fetch, { RequestInfo, RequestInit } from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

import { appEventCenter } from '@main/event';
import { getOpenAIKeys } from '@main/helpers/encryptor';

export async function getApiKeys() {
  let keysStr: string;

  if (process.env.OPENAI_API_KEY) {
    keysStr = process.env.OPENAI_API_KEY;
  } else {
    keysStr = await getOpenAIKeys();
  }

  return keysStr.split(',');
}

export function fetchWithProxy() {
  let proxyAgent: HttpsProxyAgent | undefined;

  appEventCenter.on('http-proxy:start', ({ host, port }) => {
    const appSettings = appEventCenter.getStoreData('settings');
    const { enableAIProxy = false, enable = false } =
      appSettings?.httpProxy ?? {};

    if (enableAIProxy && enable) {
      proxyAgent = new HttpsProxyAgent({
        protocol: 'http',
        host,
        port,
      });
    } else {
      proxyAgent = undefined;
    }
  });

  appEventCenter.on('http-proxy:stop', () => {
    proxyAgent = undefined;
  });

  appEventCenter.on('service:ai:proxy-status', ({ enabled }) => {
    if (!enabled) {
      proxyAgent = undefined;
      return;
    }
    const appSettings = appEventCenter.getStoreData('settings');
    const { port } = appSettings?.httpProxy ?? {};

    proxyAgent = new HttpsProxyAgent({
      protocol: 'http',
      host: '127.0.0.1',
      port,
    });
  });

  return (url: RequestInfo, init?: RequestInit | undefined) =>
    fetch(url, {
      agent: proxyAgent,
      ...(init ?? {}),
    });
}
