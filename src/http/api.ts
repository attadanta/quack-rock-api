import winston from "winston";
import { Router, Request, Response, NextFunction } from "express";
import { UnknownSymbolError, ValidationError } from "../core/errors";
import {
  CompoundSelector,
  SinceDateSelector,
  StockPrice,
  StockPricesService,
  UntilSelector,
} from "../core/stock-prices-service";
import { HttpException, InternalServerError, BadRequestException } from "./errors";

export class QuackRockApi {
  #pricesService: StockPricesService;
  #logger: winston.Logger;
  #dateFormat = /^\d{4}-\d{2}-\d{2}$/;

  constructor(logger: winston.Logger, pricesService: StockPricesService) {
    this.#pricesService = pricesService;
    this.#logger = logger;
  }

  configurePriceRoute() {
    const router = Router();

    router.get(`/price/:ticker`, async (req: Request, res: Response, next: NextFunction) => {
      this.getTickerPrices(req, res)
        .then((results) => {
          res.status(200).send(results);
        })
        .catch(next);
    });

    return router;
  }

  errorHandler = (error: HttpException, request: Request, response: Response, _: NextFunction) => {
    const status = error.statusCode ?? 500;
    response.status(status).send(error);
  };

  private async getTickerPrices(req: Request, res: Response) {
    const ticker = req.params["ticker"];

    if (!this.#pricesService.symbols().includes(ticker)) {
      throw new BadRequestException(`Ticker is not configured ${ticker}`);
    }

    this.#logger.debug(`Fetching price data for ${ticker}`);
    const criteria = new CompoundSelector();

    this.validateDateQueryParameter(req, "from", (value) => criteria.addSelector(new SinceDateSelector(value)));
    this.validateDateQueryParameter(req, "to", (value) => criteria.addSelector(new UntilSelector(value)));

    let results: Array<StockPrice>;

    try {
      results = await this.#pricesService.fetchDailyClosingStockPrices(ticker, criteria);
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
}
