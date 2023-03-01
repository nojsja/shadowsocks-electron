import { exec, ExecOptions } from 'child_process';
import http, { IncomingMessage } from 'http';
import https from 'https';

interface JsonResult {
  error: Error | null;
  data: any;
}

export function randomPicker(total: any[], count: number) {
  const result: any[] = [];
  total = total.slice();

  let num = total.length;
  for (let i = 0; i < count; i++) {
      const index = ~~(Math.random() * num) + i;
      if(result.includes(total[index])) continue;
      (total[index] !== undefined) && (result[i] = total[index]);
      total[index] = total[i];
      num--;
  }

  return result;
}

export const execAsync = (command: string, options?: ExecOptions) => {
  return new Promise<{
    code: number;
    stdout?: string;
    stderr?: string;
  }>((resolve, reject) => {
    exec(command, { ...options, windowsHide: true }, (err, stdout, stderr) => {
      if (!stderr) {
        resolve({
          code: err ? 1 : 0,
          stdout
        });
      } else {
        reject({
          code: err ? 1 : 0,
          stderr
        });
      }
    });
  });
};

export function request(
  _options: (http.RequestOptions | https.RequestOptions) & { url: string, body?: any }
): Promise<JsonResult> {
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

export function debounce<params extends any[]> (fn: (...args: params) => any, timeout: number) {
  let timer: NodeJS.Timeout;

  return function(this: any, ...args: params) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, timeout);
  }
}
