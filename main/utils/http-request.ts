import { IncomingMessage } from "http";

const https = require('https');
const http = require('http');

export type httpMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH';
export type jsonResult = {
  error: Error | null,
  data: any,
};

export function get(url: string, headers?: { [key: string]: string }): Promise<jsonResult> {
  const isHttps = /^(https:\/\/)/.test(url);
  const httpLib = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const req = httpLib.get(url, (res: IncomingMessage) => {
      let data : any = '';

      res.on('data', (chunk: string) => {
        data += chunk || '';
      });
      res.on('end', () => {
        try {
          data = JSON.parse(data);
        } catch (error) {
          data = {
            error: null,
            result: data
          }
        } finally {
          resolve({
            error: null,
            data,
          });
        }
      });
    });

    req.on('error', (err: Error) => {
      resolve({
        error: err,
        data: null,
      });
    });
  });
}

export function request(url: string, method?: httpMethods, body?: any): Promise<jsonResult> {
  const isHttps = /^(https:\/\/)/.test(url);
  const httpLib = isHttps ? https : http;
  const origin = url.replace(/^(https:\/\/|http:\/\/)/, '');
  const options = {
    protocol: isHttps ? 'https:' : 'http:',
    hostname: origin.split('/')[0],
    port: isHttps ? 443 : 80,
    path: origin.split('/').slice(1).join('/'),
    method: method ?? 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  return new Promise((resolve, reject) => {

    httpLib.request(options, (res: IncomingMessage) => {
      let data = '';

      res.on('data', (chunk: string) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          error: null,
          data: JSON.parse(data),
        });
      });

    }).on('error', (err: Error) => {
      console.log(err);
      resolve({
        error: err,
        data: null
      });
    });
  });
}
