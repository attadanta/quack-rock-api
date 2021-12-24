import fs from "fs";
import winston from "winston";
import morgan from "morgan";
import path from "path";
import { Application } from "express";

export type LogLevel = "info" | "debug";

export class LogConfiguration {
  #logLevel: LogLevel;
  #logDirectory: string;
  #nodeEnv?: string;

  constructor(logLevel: LogLevel, logDirectory: string, nodeEnv?: string) {
    this.#logLevel = logLevel;
    this.#logDirectory = logDirectory;
    this.#nodeEnv = nodeEnv;
  }

  /* eslint-disable quotes */
  configureAccessLog(app: Application) {
    if (this.#nodeEnv === "production") {
      const accessLogStream = fs.createWriteStream(path.join(this.#logDirectory, "access.log"), { flags: "a" });
      const format = [
        '"remoteAddress":":remote-addr"',
        '"remoteUser":":remote-user"',
        '"timestamp":":date[iso]"',
        '"method":":method"',
        '"url":":url"',
        '"httpVersion":"HTTP/:http-version"',
        '"status"::status',
        '"contentLength"::res[content-length]',
        '"referrer":":referrer"',
        '"userAgent":":user-agent"',
      ];
      app.use(morgan(`{${format.join()}}`, { stream: accessLogStream }));
    } else {
      app.use(morgan("dev"));
    }
  }

  createApplicationLog() {
    const appLog = winston.createLogger({
      level: this.#logLevel,
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      defaultMeta: { service: "quack-rock-api" },
    });

    if (this.#nodeEnv === "production") {
      appLog.add(new winston.transports.Console());
      appLog.add(new winston.transports.File({ filename: path.join(this.#logDirectory, "error.log"), level: "error" }));
      appLog.add(new winston.transports.File({ filename: path.join(this.#logDirectory, "combined.log") }));
    } else {
      appLog.add(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.simple(), winston.format.colorize({ all: true })),
        })
      );
    }
    return appLog;
  }
}
