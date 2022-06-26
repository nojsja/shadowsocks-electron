import { BiMap } from "./helpers/bi-map";
import logger from "../logs";

const dns = require('native-dns');

// let index = '198.18.0.0';
let server: DnsServer | null;

type DnsQuestion = { name: string, type: number, class: number };

type DnsRequest = {
  question: DnsQuestion[]
};

type DnsAnswer = {
  type: number,
  class: number,
  name: string,
  address: string,
  ttl: number
};

type DnsResponse = {
  answer: DnsAnswer[],
  additional: DnsAnswer[],
  send: () => any
};

export class DnsServer {
  static startDnsServer(dnsPort: number) {
    server && server.close();
    server = new DnsServer(15353);
  }

  static stopDnsServer() {
    server && server.close();
    logger.info("Closed DNS server");
  }

  core: any;
  dnsPort: number;
  biMap: BiMap;

  constructor(dnsPort: number) {
    this.dnsPort = dnsPort;
    this.biMap = new BiMap(new Map<string, string>(), new Map<string, string>());
    this.core = dns.createServer();
    this.core.serve(this.dnsPort);
    this.init();
    logger.info("Started DNS server");
  }

  private init() {

    this.core.on('request', function (request: DnsRequest, response: DnsResponse) {
      console.log(request)
      response.answer.push(dns.A({
        name: request.question[0].name,
        address: '127.0.0.1',
        ttl: 600,
      }));
      response.answer.push(dns.A({
        name: request.question[0].name,
        address: '127.0.0.2',
        ttl: 600,
      }));
      response.additional.push(dns.A({
        name: 'hostA.example.org',
        address: '127.0.0.3',
        ttl: 600,
      }));
      response.send();
    });
  }

  close() {
    try {
      this.core.close();
      server = null;
      logger.info("Closed DNS server");
    } catch(error) {
      console.log(error);
    }
  }
}
