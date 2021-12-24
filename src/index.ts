import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { getIntFromEnvironment, getStringListFromEnvironment } from "./util";
import { FileBasedStockPricesService } from "./alphavantage/simple-stock-prices-service";
import { QuackRockApi as Api } from "./express/api";
import { LogConfiguration } from "./express/logging";

dotenv.config();

const port = getIntFromEnvironment(process.env, "PORT", 3000);
const symbols = getStringListFromEnvironment(process.env, "SYMBOLS", ",", ["GE", "AMZN", "AAPL", "IBM"]);
const dataDirectory = process.env.DATA_DIRECTORY ?? "./data";
const logDirectory = process.env.LOG_DIRECTORY ?? "./logs";
const logLevel = process.env.LOG_LEVEL === "debug" ? "debug" : "info";

const logging = new LogConfiguration(logLevel, logDirectory, process.env.NODE_ENV);
const logger = logging.createApplicationLog();

logger.info(`Configured a price service for [${symbols.join(", ")}]`);
const service = new FileBasedStockPricesService(symbols, dataDirectory);
const api = new Api(logger, service);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

logging.configureAccessLog(app);
api.configureApp(app);

app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});
