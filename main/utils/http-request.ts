import { IncomingMessage } from 'http';
import https from 'https';
import http from 'http';

export type httpMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH';
export type jsonResult = {
  error: Error | null,
  data: any,
};

export function get(url: string): Promise<jsonResult> {
  const isHttps = /^(https:\/\/)/.test(url);
  const httpLib = isHttps ? https : http;

  return new Promise((resolve) => {
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

export function request(
  _options: (http.RequestOptions | https.RequestOptions) & { url: string, body?: any }
): Promise<jsonResult> {
  const {
    url,
    method,
    ...otherOptions
  } = _options;
  const isHttps = /^(https:\/\/)/.test(url);
  const httpLib = isHttps ? https : http;
  const origin = url.replace(/^(https:\/\/|http:\/\/)/, '');
  const body = otherOptions.body || '';
  const options = {
    protocol: isHttps ? 'https:' : 'http:',
    hostname: origin.split('/')[0],
    port: isHttps ? 443 : 80,
    path: origin.split('/').slice(1).join('/'),
    method: method ?? 'POST',
    ...otherOptions
  };

  return new Promise((resolve) => {
    const req = httpLib
      .request(options, (res: IncomingMessage) => {
        let data = '';

        res.setEncoding('utf8');
        res.on('data', (chunk: string) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            error: null,
            data: data,
          });
        });
      });

    req.on('error', (err: Error) => {
      console.log(err);
      resolve({
        error: err,
        data: null
      });
    });
    req.write(body);
    req.end();
  });
}
