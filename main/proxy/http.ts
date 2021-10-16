import http, { ClientRequest, IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import net from 'net';
// import https from 'https';

import logger from '../logs';
import { InnerCallback } from '../types/extention';
import checkPortInUse from '../utils/checkPortInUse';
const socks = require('./socksv5');

const socksConfig = {
  proxyHost: '127.0.0.1',
  proxyPort: 1080,
  auths: [ socks.auth.None() ]
};

let httpServer: http.Server | null;
let httpsServer: http.Server | null;

/* Start Https Proxy server */
export const createHttpsServer = (options: {port: number, host: string, proxyPort: number}, callback: InnerCallback) => {
  const { port, host, proxyPort } = options;

  /**
    * request [client/server request chain]
    * @author nojsja
    * @param  {IncomingMessage} cReq [客户端请求对象]
    * @param  {ServerResponse} cReq [客户端响应对象]
    */
  function request(cReq: IncomingMessage, cRes: ServerResponse) {
    const u = url.parse(cReq.url || '/');
    const options = {
        hostname : u.hostname,
        port     : u.port || 443,
        path     : u.path,
        method   : cReq.method,
        headers  : cReq.headers
    };

    const pReq = http.request({
      ...options,
      agent: new socks.HttpAgent({...socksConfig, proxyPort})
    }, function(pRes) {
        cRes.writeHead(pRes.statusCode || 500, pRes.headers);
        pRes.pipe(cRes);
    }).on('error', function(e) {
        cRes.end();
    });

    cReq.pipe(pReq);
  };

  /**
   * connect [tcp exchange]
    * @param  {IncomingMessage} cReq [客户端请求对象]
    * @param  {ServerResponse} cSock [被代理服务端响应对象]
   */
  function connect(cReq: IncomingMessage, cSock: ServerResponse) {
    const u = url.parse('http://' + cReq.url);

    const pSock = net.connect(Number(u.port), String(u.hostname), function() {
        cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        pSock.pipe(cSock);
    }).on('error', function(e) {
        cSock.end();
    });

    cSock.pipe(pSock);
  }

  if (!httpsServer) {
    // https proxy server
    checkPortInUse([port], host).then(results => {
      if (results[0].isInUse) {
        return callback(new Error(`Port: ${port} is already used.`));
      }
      console.log('Start https proxy server...');
      httpsServer = http.createServer()
        .on('request', request)
        .on('connect', connect)
        .listen((port), host, () => {
          callback(null);
          console.log(`https proxy server listen on ${port}`);
        });
    })
  } else {
    callback(null);
  }
};

/* Start Http Proxy server */
export const createHttpServer = (options: {port: number, host: string, proxyPort: number}, callback: InnerCallback) => {
  const { port, host, proxyPort } = options;
  const httpProxyRequest = (proxy: ServerResponse, opts: any): ClientRequest => {
    const request = http.request({
      ...opts,
      agent: new socks.HttpAgent({...socksConfig, proxyPort })
    }, (res: any) => {
      proxy.writeHead(res.statusCode, res.headers);
      res.pipe(proxy);
    });
    request.on('error', (error) => {
      proxy.end();
    });
    request.end();

    return request;
  };

  if (!httpServer) {
    checkPortInUse([port], host).then(results => {
      if (results[0].isInUse) {
        return callback(new Error(`Port: ${port} is already used.`));
      }
      console.log('Start http proxy server...');
      httpServer = http.createServer(function(req: IncomingMessage, res: ServerResponse) {
        const address = url.parse(req.url || '/');
        const opts = {
          host: address.host,
          port: address.port || 80,
          path: address.path,
          method: req.method,
          headers: req.headers
        };
        req.pipe(httpProxyRequest(res, opts));
      });

      httpServer.listen((port), () => {
        callback(null);
        console.log(`http proxy server listen on ${port}`);
      });
    });
  } else {
    callback(null);
  }
};

/* Stop Https Server */
export const stopHttpsServer = (port: number, host: string, callback: InnerCallback) => {
  checkPortInUse([port], host)
  .then(results => {
    if (results[0].isInUse) {
      console.log('Stop https proxy server...');
      httpsServer?.close((error: Error | undefined) => {
          if (!error) {
            httpsServer = null;
            callback(null);
          } else {
            logger.info("Stop https server error: ", error?.toString());
            callback(error);
          }
        });
      }
    });

}

/* Stop Http Server */
export const stopHttpServer = (port: number, host: string, callback: InnerCallback) => {
  checkPortInUse([port], host)
  .then(results => {
    if (results[0].isInUse) {
        console.log('Stop http proxy server...');
        httpServer?.close((error: Error | undefined) => {
          if (!error) {
            httpServer = null;
            callback(null);
          } else {
            callback(error);
            logger.info("Stop https server error: ", error?.toString());
          }
        });
      }
    });
}
