import http from 'http';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import fsExtra from 'fs-extra';
import URL from 'url';

import logger from '../logs';
import { globalPacConf, pacDir, userPacConf } from '../config';
import { i18n } from '../electron';
import { request } from '../utils/http-request';
import { Settings } from '../types';
import { debounce } from '../utils/utils';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const socks = require('socks');
let server: PacServer | null;

export class PacServer {
  core: http.Server;
  pacPort: number;
  globalPacConf: string;
  userPacConf: string;
  confWatcher: fs.FSWatcher | null;

  static updateUserRules(text: string) {
    return fs.promises.writeFile(userPacConf, text);
  }

  static async getUserPacRules() {
    return await fs.promises.readFile(userPacConf, "utf8");
  }

  static startPacServer(pacPort: number) {
    server?.close();
    server = new PacServer(pacPort, path.resolve(pacDir, "proxy.pac"));
  }

  static stopPacServer() {
    logger.info("Closing PAC server");
    server?.close();
  }

  static async generatePacWithoutPort(gfwListText: string) {
    logger.info("Generating PAC file without port...");

    try {
      // remove useless chars
      const rules = JSON.stringify(
        gfwListText.replace(/[\r\n]/g, '\n').split('\n').filter(i => i && i.trim() && i[0] !== "!" && i[0] !== "["),
        null,
        2
      );
      const data = await fsExtra.readFile(path.resolve(pacDir, "template.pac"));
      const pac = data.toString("ascii").replace(/__RULES__/g, rules);

      await fsExtra.writeFile(path.resolve(pacDir, "pac.txt"), pac);
      logger.info("Generated done.");
    } catch (err) {
      logger.error((err as any).message ?? err);
    }
  }

  static async generateFullPac(localPort: number) {
    logger.info("Generating full PAC file...");

    try {
      const data = await fsExtra.readFile(path.resolve(pacDir, "pac.txt"));
      const pac = data
        .toString("ascii")
        .replace(/__PORT__/g, localPort.toString());

      await fsExtra.writeFile(path.resolve(pacDir, "proxy.pac"), pac);
      logger.info("Generated done.");
    } catch (err) {
      logger.error((err as any).message ?? err);
    }
  }

  static async downloadAndGeneratePac(url: string, text: string, settings: Settings) {
    if (!url && !text) {
      throw new Error(i18n.__('invalid_parameter'));
    }

    logger.info(`Downloading GFWList from ${url}...`);

    return new Promise<string>((resolve, reject) => {
      if (text) {
        logger.info("Parsing GFWList base64 text and generating PAC file without port");
        resolve(text);
      }
      if (url) {
        logger.info("Downloading GFWList and generating PAC file without port");
        const parsedUrl = URL.parse(url);
        const host = parsedUrl.hostname;
        const protocol = parsedUrl.protocol;
        const port = parsedUrl.port ?? (protocol === 'https:' ? 443 : 80);

        return fetch(url)
          .then(response => {
              return response.text();
          })
          .then(text => {
            resolve(text);
          })
          .catch(() => {
            const agentConf = {
              ipaddress: '127.0.0.1',
              port: settings.localPort,
              type: 5,
            };

            return request({
              url,
              method: "GET",
              agent: new socks.Agent({
                proxy: agentConf,
                target: { host, port },
                authentication: {
                  username: '',
                  password: ''
                }
              })
            })
            .then(rsp => {
              if (rsp.error) {
                return reject(new Error(rsp.error.message));
              }
              resolve(rsp.data);
            });
          })
      }
    })
    .then((base64: string) => {
      const base64Text = Buffer.from(base64, "base64").toString("ascii");
      return PacServer.generatePacWithoutPort(base64Text);
    })
    .catch((err: any) => {
      logger.error(err?.toString() ?? err);
      return Promise.reject(err);
    });
  }

  constructor(pacPort: number, pacFile: string) {
    logger.info("Starting PAC server");
    this.pacPort = pacPort;
    this.core =
      http.createServer((req, res) => {
        fs.readFile(pacFile, (err, data) => {
          if (err) {
            res.writeHead(500);
          } else {
            res.writeHead(200);
            res.end(data);
          }
        });
      });
    this.core.listen(this.pacPort);
    this.globalPacConf = globalPacConf;
    this.userPacConf = userPacConf;
    this.confWatcher = this.watch(this.userPacConf);
  }

  watch(pacFile: string) {
    if (!fs.existsSync(pacFile)) return null;
    logger.info(`Watching PAC file ${pacFile}...`);

    return fs.watch(pacFile, debounce(async () => {
      logger.info(`Regenerating PAC conf from file: ${pacFile}...`);
      try {
        const userData = await fs.promises.readFile(pacFile);
        const globalData = await fs.promises.readFile(this.globalPacConf);
        const userText = userData.toString("ascii");
        const globalText = globalData.toString("ascii");
        await PacServer.generatePacWithoutPort(`${userText}\n${globalText}`);
      } catch (error) {
        console.log(error);
      }
    }, 1e3));
  }

  unwatch() {
    logger.info(`UnWatching PAC file ${this.userPacConf}...`);
    this.confWatcher?.close();
  }

  close() {
    logger.info("Closing PAC server");
    try {
      this.core.close();
      this.unwatch();
      server = null;
    } catch(error) {
      console.log(error);
    }
  }
}
