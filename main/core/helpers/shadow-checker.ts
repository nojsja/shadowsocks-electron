import { Socket } from 'net';

const socks = require('socks');

/**
 * @name shadowChecker 检查从ss-local到ss-server的链路是否联通
 * @param {string} host ss代理本地地址 ep. 127.0.0.1
 * @param {string} port ss代理本地端口 ep. 1081
 * @returns Promise<boolean>
 */
export default function shadowChecker(host: string, port: number): Promise<boolean> {
  const agentConf = {
    ipaddress: host,
    port: port,
    type: 5,
    authentication: {
      username: '',
      password: ''
    }
  };

  const options = {
    command: 'connect',
    proxy: agentConf,
    target: {
      host: 'www.google.com',
      port: 80
    },
  };

  return new Promise(resolve => {
    socks.createConnection(options, (error: Error | null, pSocket: Socket) => {
      if (error) {
        return resolve(false);
      }
      pSocket.on('data', (data) => {
        const header = data.toString();
        if (header.includes('HTTP/1.1 200 OK')) {
          resolve(true);
        } else {
          console.log(header.slice(0, 100));
          resolve(false);
        }
      });
      pSocket.on('end', () => {
        setTimeout(() => {
          resolve(false);
        }, 1e3);
      });
      pSocket.on('error', (error) => {
        resolve(false);
      });
      pSocket.resume();
      pSocket.write('HEAD / HTTP/1.1\r\nHost: www.google.com\r\n\r\n');
    });
  });
}
