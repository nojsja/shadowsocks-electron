import http from "http";
import fs from "fs";
import path from "path";
import logger from "../logs";
import fsExtra from "fs-extra";
import fetch from "node-fetch";
import { pacDir } from "../install";

let server: http.Server;

export const startPacServer = (pacPort: number) => {
  server = http.createServer((req, res) => {
    fs.readFile(path.resolve(pacDir, "proxy.pac"), (err, data) => {
      if (err) {
        res.writeHead(500);
      } else {
        res.writeHead(200);
        res.end(data);
      }
    });
  });
  server.listen(pacPort);
  logger.info("Started PAC server");
};

export const stopPacServer = () => {
  server && server.close();
  logger.info("Closed PAC server");
};

export const generatePacWithoutPort = async (gfwListText: string) => {
  logger.info("Generating PAC file without port...");

  try {
    const rules = JSON.stringify(
      gfwListText.split("\n").filter(i => i && i[0] !== "!" && i[0] !== "["),
      null,
      2
    );

    const data = await fsExtra.readFile(path.resolve(pacDir, "template.pac"));
    const pac = data.toString("ascii").replace(/__RULES__/g, rules);

    await fsExtra.writeFile(path.resolve(pacDir, "pac.txt"), pac);

    logger.info("Generated PAC file without port");
  } catch (err) {
    logger.error(err);
  }
};

export const generateFullPac = async (localPort: number) => {
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
};

export const downloadAndGeneratePac = async (url: string) => {
  logger.info(`Downloading GFWList from ${url}...`);

  try {
    const response = await fetch(url);
    const base64 = await response.text();
    const text = Buffer.from(base64, "base64").toString("ascii");

    await generatePacWithoutPort(text);

    logger.info("Downloaded GFWList and generated PAC file without port");
  } catch (err) {
    logger.error(err);
  }
};
