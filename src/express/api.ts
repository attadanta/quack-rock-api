import winston from "winston";
import { Router, Request, Response, NextFunction, Application } from "express";
import { UnknownSymbolError, ValidationError } from "../core/errors";
import {
  CompoundSelector,
  SinceSelector,
  StockPrice,
  StockPricesService,
  UntilSelector,
} from "../core/stock-prices-service";
import { HttpException, InternalServerError, BadRequestException, NotFoundError } from "./errors";

interface DailyStockPriceResponse {
  timestamp: string;
  close: number;
}

type DailyStockPricesResponse = Array<DailyStockPriceResponse>;

export class QuackRockApi {
  #pricesService: StockPricesService;
  #logger: winston.Logger;
  #dateFormat = /^\d{4}-\d{2}-\d{2}$/;

  constructor(logger: winston.Logger, pricesService: StockPricesService) {
    this.#pricesService = pricesService;
    this.#logger = logger;
  }

  configureApp(app: Application) {
    app.use(this.configurePriceRoute());
    app.use(this.notFound);
    app.use(this.errorHandler);
  }

  configurePriceRoute() {
    const router = Router();

    router.get("/price/:ticker", async (req: Request, res: Response, next: NextFunction) => {
      this.getTickerPrices(req)
        .then((results) => {
          res.status(200).send(results);
        })
        .catch(next);
    });

    return router;
  }

  notFound = () => {
    throw new NotFoundError();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  errorHandler = (error: HttpException, request: Request, response: Response, next: NextFunction) => {
    if (error instanceof InternalServerError) {
      this.#logger.error("Caught an error", error);
    }
    const status = error.statusCode ?? 500;
    response.status(status).send(error);
  };

  private async getTickerPrices(req: Request) {
    const ticker = req.params["ticker"];

    if (!this.#pricesService.symbols().includes(ticker)) {
      throw new BadRequestException(`Ticker is not configured: ${ticker}`);
    }

    const criteria = new CompoundSelector();

    this.validateDateQueryParameter(req, "from", (from) => criteria.addSelector(new SinceSelector(new Date(from))));
    this.validateDateQueryParameter(req, "to", (to) => criteria.addSelector(new UntilSelector(new Date(to))));

    let results: DailyStockPricesResponse;

    try {
      results = await this.#pricesService
        .fetchDailyClosingStockPrices(ticker, criteria)
        .then((prices) => prices.map(this.toStockPriceResponse));
    } catch (e: unknown) {
      if (e instanceof ValidationError || e instanceof UnknownSymbolError) {
        throw new InternalServerError(e.message);
      } else {
        throw new InternalServerError("An unexpected error occurred");
      }
    }

    return results;
  }

  private validateDateQueryParameter(req: Request, name: string, onValid: (parameterValue: string) => void) {
    const parameterValue = req.query[name];
    if (parameterValue) {
      if (typeof parameterValue !== "string" || !this.#dateFormat.test(parameterValue)) {
        throw new BadRequestException(`Invalid date representation in parameter ${name}: ${parameterValue}`);
      } else {
        onValid(parameterValue);
      }
    }
  }

  private toStockPriceResponse(price: StockPrice): DailyStockPriceResponse {
    return {
      timestamp: price.timestamp.toISOString().substring(0, 10),
      close: price.close,
    };
  }
}
