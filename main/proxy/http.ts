// import http from 'http';
// import http, { ClientRequest, IncomingMessage, ServerResponse } from 'http';
// import https from 'https';

// import logger from '../logs';
import { InnerCallback } from '../types/extention';
import checkPortInUse from '../utils/checkPortInUse';
import { HttpProxyServer } from '../utils/http-proxy-server';
// const socks = require('./socksv5');

// const socksConfig = {
//   proxyHost: '127.0.0.1',
//   proxyPort: 1080,
//   auths: [ socks.auth.None() ]
// };

// let httpServer: http.Server | null;
let httpServer: HttpProxyServer | null;

/* Start Https Proxy server */
export const createHttpServer = (options: {port: number, host: string, proxyPort: number}, callback: InnerCallback) => {
  const { port, host, proxyPort } = options;

  if (!httpServer) {
    // https proxy server
    checkPortInUse([port], host).then(results => {
      if (results[0].isInUse) {
        return callback(new Error(`Port: ${port} is already used.`));
      }
      console.log('Start http proxy server...');
      httpServer = new HttpProxyServer({
        socksHost: '127.0.0.1',
        socksPort: proxyPort,
        listenHost: host,
        listenPort: port,
      });
      httpServer.start();
    })
  } else {
    callback(null);
  }
};

/* Stop Https Server */
export const stopHttpServer = (port: number, host: string, callback: InnerCallback) => {
  console.log('Stop http proxy server...');
  httpServer?.stop();
  httpServer = null;
  callback(null);
}

/* Stop Http Server */
// export const stopHttpServer = (port: number, host: string, callback: InnerCallback) => {
//   checkPortInUse([port], host)
//   .then(results => {
//     if (results[0].isInUse) {
//         console.log('Stop http proxy server...');
//         httpServer?.close((error: Error | undefined) => {
//           if (!error) {
//             httpServer = null;
//             callback(null);
//           } else {
//             callback(error);
//             logger.info("Stop https server error: ", error?.toString());
//           }
//         });
//       }
//     });
// }

/* Start Http Proxy server */
// export const createHttpServer = (options: {port: number, host: string, proxyPort: number}, callback: InnerCallback) => {
//   const { port, host, proxyPort } = options;
//   const httpProxyRequest = (proxy: ServerResponse, opts: any): ClientRequest => {
//     const request = http.request({
//       ...opts,
//       agent: new socks.HttpAgent({...socksConfig, proxyPort })
//     }, (res: any) => {
//       proxy.writeHead(res.statusCode, res.headers);
//       res.pipe(proxy);
//     });
//     request.on('error', (error) => {
//       proxy.end();
//     });
//     request.end();

//     return request;
//   };

//   if (!httpServer) {
//     checkPortInUse([port], host).then(results => {
//       if (results[0].isInUse) {
//         return callback(new Error(`Port: ${port} is already used.`));
//       }
//       console.log('Start http proxy server...');
//       httpServer = http.createServer(function(req: IncomingMessage, res: ServerResponse) {
//         const address = url.parse(req.url || '/');
//         const opts = {
//           host: address.host,
//           port: address.port || 80,
//           path: address.path,
//           method: req.method,
//           headers: req.headers
//         };
//         req.pipe(httpProxyRequest(res, opts));
//       });

//       httpServer.listen((port), () => {
//         callback(null);
//         console.log(`http proxy server listen on ${port}`);
//       });
//     });
//   } else {
//     callback(null);
//   }
// };
