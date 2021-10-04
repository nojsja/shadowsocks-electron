import path from "path";
import { app } from "electron";
import winston, { format } from "winston";
import open from "open";
import  DailyRotateFile from 'winston-daily-rotate-file';

const { combine, simple, colorize } = format;

export const logDir = app.getPath("logs");

export const openLogDir = async () => {
  await open(logDir);
};

export const cleanLogs = async () => {};

const timestamp = format((info, opts) => {
  info.message = `${new Date().toLocaleString()} - ${info.message}`;
  return info;
});

const dailyTransport: DailyRotateFile = new DailyRotateFile({
  filename: path.resolve(logDir, 'shadowsocks-electron-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxSize: '10m',
  maxFiles: '30d'
});

const logger = winston.createLogger({
  level: "info",
  transports: [
    dailyTransport
  ]
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), simple())
    })
  );
}

export default logger;
