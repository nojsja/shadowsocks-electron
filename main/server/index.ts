import http from "http";
import fs from "fs";
import path from "path";
import logger from "../logs";
import { pacDir } from "../install";

const server = http.createServer((req, res) => {
  fs.readFile(path.resolve(pacDir, "proxy.pac"), (err, data) => {
    if (err) {
      res.writeHead(500);
    } else {
      res.writeHead(200);
      res.end(data);
    }
  });
});

export const startPacServer = (pacPort: number) => {
  server.listen(pacPort);
  logger.info("Started PAC server");
};

export const stopPacServer = () => {
  server.close();
  logger.info("Closed PAC server");
};
