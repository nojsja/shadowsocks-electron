import http, { ClientRequest, IncomingMessage, ServerResponse } from 'http';
import https from 'https';
import url from 'url';
import net from 'net';

const socks = require('./socksv5');

var socksConfig = {
  proxyHost: '127.0.0.1',
  proxyPort: 1080,
  auths: [ socks.auth.None() ]
};

export const createHttpsServer2 = () => {

  function request(cReq: IncomingMessage, cRes: ServerResponse) {
    var u = url.parse(cReq.url || '/');

    var options = {
        hostname : u.hostname,
        port     : u.port || 80,
        path     : u.path,
        method     : cReq.method,
        headers     : cReq.headers
    };

    var pReq = http.request(options, function(pRes) {
        cRes.writeHead(pRes.statusCode || 500, pRes.headers);
        pRes.pipe(cRes);
    }).on('error', function(e) {
        cRes.end();
    });

    cReq.pipe(pReq);
  }

  function connect(cReq: IncomingMessage, cSock: ServerResponse) {
    var u = url.parse('http://' + cReq.url);

    var pSock = net.connect(Number(u.port), String(u.hostname), function() {
        cSock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        pSock.pipe(cSock);
    }).on('error', function(e) {
        cSock.end();
    });

    cSock.pipe(pSock);
  }

  http.createServer()
    .on('request', request)
    .on('connect', connect)
    .listen(1091, '127.0.0.1');
}

export const createHttpsServer = () => {
  const server = https.createServer(function(req: IncomingMessage, res: ServerResponse) {
    const address = url.parse(req.url || '/');
    const opts = {
      host: address.host,
      port: address.port || 443,
      path: address.path,
      method: req.method,
      headers: req.headers
    };
    console.log('https: ', opts);
    req.pipe(httpsProxyRequest(res, opts));
  });

  server.listen(1091, () => {
    console.log(`https proxy server listen on ${1091}`);
  });
}

export const createHttpServer = () => {
  const server = http.createServer(function(req: IncomingMessage, res: ServerResponse) {
    const address = url.parse(req.url || '/');
    const opts = {
      host: address.host,
      port: address.port || 80,
      path: address.path,
      method: req.method,
      headers: req.headers
    };
    console.log('http: ', opts);
    req.pipe(httpProxyRequest(res, opts));
  });

  server.listen(1090, () => {
    console.log(`http proxy server listen on ${1090}`);
  });
}

export const httpsProxyRequest = (proxy: ServerResponse, opts: any): ClientRequest => {
  const request = https.request(
    {
      ...opts,
      agent: new socks.HttpsAgent(socksConfig)
    }, (res: any) => {
    proxy.writeHead(res.statusCode, res.headers);
    res.pipe(proxy);
  });
  request.on('error', () => {
    proxy.end();
  });
  request.end();

  return request;
}


export const httpProxyRequest = (proxy: ServerResponse, opts: any): ClientRequest => {
  const request = http.request(
    {
      ...opts,
      agent: new socks.HttpAgent(socksConfig)
    }, (res: any) => {
    proxy.writeHead(res.statusCode, res.headers);
    res.pipe(proxy);
  });
  request.on('error', () => {
    proxy.end();
  });
  request.end();

  return request;
};
