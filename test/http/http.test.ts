import winston from "winston";
import express, { Express } from "express";
import { FileBasedStockPricesService } from "../../src/alphavantage/simple-stock-prices-service";
import { QuackRockApi as Api } from "../../src/http/api";
import supertest from "supertest";

describe("the quack rock API", () => {
  let app: Express;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(() => {
    const logger = winston.createLogger();
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
        silent: true,
      })
    );

    const dataDirectory = "./test/fixtures";
    const symbols = ["GE", "IBM"];
    const service = new FileBasedStockPricesService(symbols, dataDirectory);
    const api = new Api(logger, service);
    app = express();
    app.use(api.configurePriceRoute());
    app.use(api.errorHandler);
  });

  beforeEach(() => {
    request = supertest(app);
  });

  it("returns the stock prices for a known ticker", async () => {
    const response = await request.get("/price/GE");
    expect(response.status).toBe(200);
  });

  it("returns a bad request when fetching an unknown ticker", async () => {
    const response = await request.get("/price/TSLA");
    expect(response.status).toBe(400);
  });
});
