import http from "http";
import fs from "fs";
import path from "path";
import os from "os";
import fetch from "node-fetch";
import fsExtra from "fs-extra";

import logger from "../logs";
import { pacDir } from "../config";
import { i18n } from "../electron";

let server: PacServer | null;
const platform = os.platform();

export class PacServer {
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

  static async downloadAndGeneratePac(url: string, text: string) {
    logger.info(`Downloading GFWList from ${url}...`);

    let base64 = "";

    try {
      if (url) {
        logger.info("Downloaded GFWList and generated PAC file without port");
        const response = await fetch(url);
        base64 = await response.text();
      } else if (text) {
        logger.info("Parse GFWList base64 text and generated PAC file without port");
        base64 = text;
      } else {
        throw new Error(i18n.__('invalid_parameter'));
      }

      const base64Text = Buffer.from(base64, "base64").toString("ascii");
      await PacServer.generatePacWithoutPort(base64Text);

    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  }

  core: http.Server;
  pacPort: number;

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
    this.core.listen(this.pacPort);
    logger.info("Started PAC server");
  }

  close() {
    try {
      this.core.close();
      server = null;
      logger.info("Closed PAC server");
    } catch(error) {
      console.log(error);
    }
  }
}
