import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import winston from "winston";
import { getIntFromEnvironment, getStringListFromEnvironment } from "./util";
import { FileBasedStockPricesService } from "./alphavantage/simple-stock-prices-service";
import { errorHandler, PriceRoutes } from "./http/common-http";

dotenv.config();

const port = getIntFromEnvironment(process.env, "PORT", 3000);
const symbols = getStringListFromEnvironment(process.env, "SYMBOLS", ",", ["GE", "AMZN", "AAPL", "IBM"]);
const dataDirectory = process.env.DATA_DIRECTORY ?? "./data";
const logLevel = process.env.LOG_LEVEL ?? "debug";

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.json(),
  defaultMeta: { service: "quack-rock-api" },
});

if (process.env.NODE_ENV === "production") {
  logger.add(new winston.transports.File({ filename: "error.log", level: "error" }));
  logger.add(new winston.transports.File({ filename: "combined.log" }));
} else {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.simple(), winston.format.colorize({ all: true })),
    })
  );
}

const service = new FileBasedStockPricesService(symbols, dataDirectory);
const routes = new PriceRoutes(logger, service);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

routes.configureRoutes(app);
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});
