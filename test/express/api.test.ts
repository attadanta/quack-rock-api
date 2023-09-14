import path from "path";
import winston, { format } from "winston";
import express, { Express } from "express";
import { FileBasedStockPricesService } from "../../src/alphavantage/simple-stock-prices-service";
import { QuackRockApi as Api } from "../../src/express/api";
import supertest, { Response } from "supertest";

describe("the quack rock REST API", () => {
  let app: Express;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(() => {
    const logger = winston.createLogger();
    const { combine, errors } = format;
    logger.add(
      new winston.transports.Console({
        format: combine(winston.format.simple(), errors({ stack: true })),
      })
    );

    const dataDirectory = path.join(process.cwd(), "/test/fixtures");
    const symbols = ["GE", "IBM"];
    const service = new FileBasedStockPricesService(symbols, dataDirectory);
    const api = new Api(logger, service);

    app = express();
    api.configureApp(app);
  });

  const assertResponseConstraints = (response: Response) => {
    expect(response.type).toEqual("application/json");
  };

  beforeEach(() => {
    request = supertest(app);
  });

  it("returns all stock prices for a known ticker", async () => {
    const response = await request.get("/price/GE");
    assertResponseConstraints(response);
    expect(response.body).toEqual([
      { timestamp: "2021-12-20", close: 89.98 },
      { timestamp: "2021-12-17", close: 91.45 },
      { timestamp: "2021-12-16", close: 92.53 },
      { timestamp: "2021-12-15", close: 92.08 },
    ]);
    expect(response.status).toBe(200);
  });

  it("constrains the result set by the `from' parameter", async () => {
    const response = await request.get("/price/GE?from=2021-12-17");
    assertResponseConstraints(response);
    expect(response.body).toEqual([
      { timestamp: "2021-12-20", close: 89.98 },
      { timestamp: "2021-12-17", close: 91.45 },
    ]);
    expect(response.status).toBe(200);
  });

  it("constrains the result set by the `to' parameter", async () => {
    const response = await request.get("/price/GE?to=2021-12-17");
    assertResponseConstraints(response);
    expect(response.body).toEqual([
      { timestamp: "2021-12-17", close: 91.45 },
      { timestamp: "2021-12-16", close: 92.53 },
      { timestamp: "2021-12-15", close: 92.08 },
    ]);
    expect(response.status).toBe(200);
  });

  it("constrains the result set by both `from' and `to' parameters", async () => {
    const response = await request.get("/price/GE?from=2021-12-16&to=2021-12-17");
    assertResponseConstraints(response);
    expect(response.body).toEqual([
      { timestamp: "2021-12-17", close: 91.45 },
      { timestamp: "2021-12-16", close: 92.53 },
    ]);
    expect(response.status).toBe(200);
  });

  it("returns not found when requesting an undefined resource", async () => {
    const response = await request.get("/crypto");
    assertResponseConstraints(response);
    expect(response.status).toBe(404);
  });

  it("returns an internal server error when trying to access invalid price ticker data", async () => {
    const response = await request.get("/price/IBM");
    assertResponseConstraints(response);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("contains invalid data");
    expect(response.status).toBe(500);
  });

  it("returns a bad request when fetching an unknown ticker", async () => {
    const response = await request.get("/price/TSLA");
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toEqual("Ticker is not configured: TSLA");
    assertResponseConstraints(response);
    expect(response.status).toBe(400);
  });

  it("returns a bad request receiving an invalid date in the `from' parameter", async () => {
    const response = await request.get("/price/GE?from=%24%7Bjndi%3Aldap%3A%2F%2F127.0.0.1%3A3001%7D&to=2021-12-31");
    assertResponseConstraints(response);
    expect(response.status).toBe(400);
  });

  it("returns a bad request receiving an invalid date in the `to' parameter", async () => {
    const response = await request.get("/price/GE?to=%24%7Bjndi%3Aldap%3A%2F%2F127.0.0.1%3A3001%7D&from=2021-12-01");
    assertResponseConstraints(response);
    expect(response.status).toBe(400);
  });
});
