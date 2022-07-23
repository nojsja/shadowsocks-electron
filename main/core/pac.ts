import http from "http";
import fs from "fs";
import path from "path";
import os from "os";
import fetch from "node-fetch";
import fsExtra from "fs-extra";
import URL from 'url';

import logger from "../logs";
import { globalPacConf, pacDir, userPacConf } from "../config";
import { i18n } from "../electron";
import { request } from "../utils/http-request";
import { Settings } from "../types/extention";

const socks = require('socks');

let server: PacServer | null;
const platform = os.platform();

export class PacServer {

  static updateUserRules(text: string) {
    return new Promise((resolve) => {
      fs.writeFile(userPacConf, text, () => {
        resolve(true);
      });
    })
  }

  static startPacServer(pacPort: number) {
    server && server.close();
    server = new PacServer(pacPort, path.resolve(pacDir, "proxy.pac"));
  }

  static stopPacServer() {
    server && server.close();
    logger.info("Closed PAC server");
  }

  static async generatePacWithoutPort(gfwListText: string) {
    logger.info("Generating PAC file without port...");

    try {
      const rules = JSON.stringify(
        gfwListText.split("\n").filter(i => i && i[0] !== "!" && i[0] !== "["),
        null,
        2
      );

      const data = await fsExtra.readFile(
        platform === "win32" ?
        path.resolve(pacDir, "template_win.pac") :
        path.resolve(pacDir, "template.pac")
      );
      const pac = data.toString("ascii").replace(/__RULES__/g, rules);

      await fsExtra.writeFile(path.resolve(pacDir, "pac.txt"), pac);

      logger.info("Generated PAC file without port");
    } catch (err) {
      logger.error(err);
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

      logger.info("Generated full PAC file");
    } catch (err) {
      logger.error(err);
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
    .catch(err => {
      logger.error(err);
      return Promise.reject(err);
    });
  }

  core: http.Server;
  pacPort: number;
  globalPacConf: string;
  userPacConf: string;
  watcher: fs.FSWatcher | null;

  constructor(pacPort: number, pacFile: string) {
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
    logger.info("Started PAC server");
    this.core.listen(this.pacPort);
    this.globalPacConf = globalPacConf;
    this.userPacConf = userPacConf;
    this.watcher = this.watch(this.userPacConf);
  }

  watch(pacFile: string) {
    if (fs.existsSync(pacFile)) {
      logger.info(`Watching PAC file ${pacFile}...`);
      return fs.watch(pacFile, async () => {
        logger.info(`Regenerating PAC conf from file: ${pacFile}...`);
        PacServer.generateFullPac(this.pacPort);
        try {
          const userData = await fs.promises.readFile(pacFile);
          const globalData = await fs.promises.readFile(this.globalPacConf);
          const userText = userData.toString("ascii");
          const globalText = globalData.toString("ascii");
          await PacServer.generatePacWithoutPort(`${userText}\n${globalText}`);
        } catch (error) {
          console.log(error);
        }
      });
    }
    return null;
  }

  unwatch() {
    logger.info("Unwatching PAC file...");
    if (this.watcher) {
      fs.unwatchFile(this.userPacConf);
    }
  }

  close() {
    try {
      this.core.close();
      this.unwatch();
      server = null;
      logger.info("Closed PAC server");
    } catch(error) {
      console.log(error);
    }
  }
}
