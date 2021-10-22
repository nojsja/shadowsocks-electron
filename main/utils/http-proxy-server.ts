import { EventEmitter } from 'events';
import url from 'url';
import http from 'http';
import { Duplex } from 'stream';
const socks = require('socks');

type ProxyProps = {
  listenHost?: string
  listenPort?: number
  socksHost?: string
  socksPort?: number
  authname?: string | undefined | ''
  authsecret?: string | undefined | ''
};

type AgentProps = {
  ipaddress: string
  port: number
  type: 5 | 4
  authentication: {
    username: string | '' | undefined
    password: string | '' | undefined
  }
};

type SocksProps = {
  listenHost: string,
  listenPort: number,
  socksHost: string,
  socksPort: number
}

class HttpProxyServer extends EventEmitter {
  socksConf: SocksProps
  agentConf: AgentProps
  http: http.Server | null

  constructor(props: ProxyProps) {
    super();
    const socksConf: SocksProps = {
      listenHost: '127.0.0.1',
      listenPort: 1095,
      socksHost: '127.0.0.1',
      socksPort: 1080,
      ...props
    };

    const agentConf: AgentProps = {
      ipaddress: socksConf.socksHost,
      port: socksConf.socksPort,
      type: 5,
      authentication: {
        username: props.authname ?? '',
        password: props.authsecret ?? ''
      }
    };

    this.socksConf = socksConf;
    this.agentConf = agentConf;
    this.http = null;
    this.start.bind(this);
    this.stop.bind(this);
  }

  /**
    * connect [HTTP CONNECT method for https proxy]
    * @author nojsja
    * @param  {http.IncomingMessage} request [request]
    * @param  {Duplex} cSocket [cSocket]
    * @param  {Buffer} head [head]
    * @return {void}
    */
  private connect = (request: http.IncomingMessage, cSocket: Duplex, head: Buffer) => {
    const u = url.parse('http://' + request.url)
    console.log('connect: ', request.url);
    const { agentConf } = this;
    const options = {
      command: 'connect',
      proxy: agentConf,
      target: { host: u.hostname, port: u.port },
    };
    // connect tcp tunnel between https-client and socks5-client by proxy-server.
    // when tcp tunnel established, the tunnel let data-pack pass from https-client to target-server with socks5 proxy.
    // the entire process: https-client <--(tcp)--> sockets-client <--(tcp)--> sockets-server <--(tcp)--> https-server
    socks.createConnection(options, (error: Error | null, pSocket: Duplex) => {
      if (error) {
        cSocket.write(`HTTP/${request.httpVersion} 500 Connection error\r\n\r\n`);
        return;
      }
      pSocket.pipe(cSocket);
      cSocket.pipe(pSocket);
      pSocket.write(head);
      cSocket.write(`HTTP/${request.httpVersion} 200 Connection established\r\n\r\n`)
      pSocket.resume();
    });
  }

  /**
    * request [HTTP request method for http proxy]
    * @author nojsja
    * @param  {http.IncomingMessage} req [request]
    * @param  {http.ServerResponse} res [response]
    * @return {void}
    */
  private request = (req: http.IncomingMessage, res: http.ServerResponse) => {
    const u = url.parse(req.url || '')
    console.log('request: ', req.url);

    // proxy get http-client request and send new http request to http-server with socks5-agent (carry old http request info),
    // finnally proxy pipe http-server response to http-client response.
    // the entire process: https-client <--(http)--> proxy-server with agent <--(http)--> https-server (agent process: sockets-client <--(tcp)--> sockets-server)
    const pRequest = http.request({
      host: u.host,
      port: u.port,
      path: u.path,
      method: req.method,
      headers: req.headers,
      // agent: new socks5.HttpAgent({...socksConfig, proxyPort: 1079 })
      agent: new socks.Agent({
        proxy: this.agentConf,
        target: { host: u.host, port: u.port }
      })
    });

    pRequest
    .on('response', (pRes: http.ServerResponse) => {
      res.writeHead(pRes.statusCode, (pRes as any).headers);
      pRes.pipe(res);
    })
    .on('error', () => {
      res.writeHead(500);
      res.end('Connection error\n')
      res.end();
    });

    req.pipe(pRequest);
  }

  private error(error: Error | null) {
    console.log(error);
  }

  start() {
    if (!this.http) {
      this.http = http.createServer();
      this.http
        // parse proxy target and connect tcp tunnel
        .on('connect', this.connect)
        .on('request', this.request)
        .on('error', this.error)
        .listen(this.socksConf.listenPort, this.socksConf.listenHost);
    }
  }

  stop() {
    this?.http?.close();
  }
}

export {
  HttpProxyServer
};
