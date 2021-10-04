import fs from "fs-extra";
import path from "path";
import fetch from "node-fetch";
import logger from "../logs";
import { pacDir } from "../install";

export const generatePacWithoutPort = async (gfwListText: string) => {
  logger.info("Generating PAC file without port...");

  try {
    const rules = JSON.stringify(
      gfwListText.split("\n").filter(i => i && i[0] !== "!" && i[0] !== "["),
      null,
      2
    );

    const data = await fs.readFile(path.resolve(pacDir, "template.pac"));
    const pac = data.toString("ascii").replace(/__RULES__/g, rules);

    await fs.writeFile(path.resolve(pacDir, "pac.txt"), pac);

    logger.info("Generated PAC file without port");
  } catch (err) {
    logger.error(err);
  }
};

export const generateFullPac = async (localPort: number) => {
  logger.info("Generating full PAC file...");

  try {
    const data = await fs.readFile(path.resolve(pacDir, "pac.txt"));
    const pac = data
      .toString("ascii")
      .replace(/__PORT__/g, localPort.toString());

    await fs.writeFile(path.resolve(pacDir, "proxy.pac"), pac);

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
