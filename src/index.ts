import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import winston from "winston";
import { getIntFromEnvironment } from "./util";

dotenv.config();

const port = getIntFromEnvironment(process.env, "PORT", 3000);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "debug",
  format: winston.format.json(),
  defaultMeta: { service: "quack-rock-api" },
});

if (process.env.NODE_ENV === "production") {
  logger.add(new winston.transports.File({ filename: "error.log", level: "error" }));
  logger.add(new winston.transports.File({ filename: "combined.log" }));
} else {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});
