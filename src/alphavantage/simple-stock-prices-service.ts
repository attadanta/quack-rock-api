import path from "path";
import fs from "fs";
import { DailyClosingStockPrices } from "./model";
import { Selector, StockPrice, StockPricesService } from "../core/stock-prices-service";
import { IoError, UnknownSymbolError, ValidationError } from "../core/errors";
import { isDailyStockPrices } from "./io";

export class FileBasedStockPricesService implements StockPricesService {
  #symbols: string[];
  #basePath: string;

  constructor(symbols: string[], basePath: string) {
    this.#symbols = symbols;
    this.#basePath = basePath;
  }

  symbols(): string[] {
    return this.#symbols;
  }

  async fetchDailyClosingStockPrices(symbol: string, selector: Selector): Promise<StockPrice[]> {
    if (!this.#symbols.includes(symbol)) {
      throw new UnknownSymbolError(`Symbol ${symbol} is not configured with this service`);
    }

    const pathToStore = path.join(this.#basePath, `${symbol}.JSON`);
    if (!fs.existsSync(pathToStore)) {
      throw new UnknownSymbolError(`No time series file for ${symbol} at ${pathToStore} found`);
    }

    let rawData: string;
    try {
      rawData = fs.readFileSync(pathToStore, "utf8");
    } catch (e: unknown) {
      throw new IoError(`Could not read the time series for ${symbol} at ${pathToStore}: ${JSON.stringify(e)}`);
    }

    let jsonData;
    try {
      jsonData = JSON.parse(rawData);
    } catch (e: unknown) {
      throw new IoError(`Failed to parse the time series for ${symbol} at ${pathToStore}: ${JSON.stringify(e)}`);
    }

    let store: DailyClosingStockPrices;
    if (isDailyStockPrices(jsonData)) {
      store = jsonData;
    } else {
      throw new ValidationError(`The time series file for ${symbol} at ${pathToStore} contains invalid data`);
    }

    return selectStockPrices(store, selector);
  }
}

export class InMemoryStockPricesService implements StockPricesService {
  #store: { [symbol: string]: DailyClosingStockPrices };

  constructor(store: { [symbol: string]: DailyClosingStockPrices }) {
    this.#store = store;
  }

  symbols(): string[] {
    return Object.keys(this.#store);
  }

  async fetchDailyClosingStockPrices(symbol: string, selector: Selector): Promise<StockPrice[]> {
    const prices = this.#store[symbol];

    if (prices === undefined) {
      throw new UnknownSymbolError(symbol);
    }

    return selectStockPrices(prices, selector);
  }
}

const selectStockPrices = (store: DailyClosingStockPrices, selector: Selector): Array<StockPrice> => {
  // We forfeit data validation at this stage, since we assume that the first argument has passed a type guard.
  const timeSeries = store["Time Series (Daily)"];

  const result: StockPrice[] = [];

  for (const timestamp of Object.keys(timeSeries)) {
    if (selector.apply(timestamp)) {
      const close = parseFloat(timeSeries[timestamp]["4. close"]);
      result.push({ timestamp, close });
    }
  }

  result.sort((priceA, priceB) => priceB.timestamp.localeCompare(priceA.timestamp));

  return result;
};
