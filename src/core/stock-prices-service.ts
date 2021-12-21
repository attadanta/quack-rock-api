export interface StockPrice {
  timestamp: string;
  close: number;
}

/**
 * In line with the precepts of QuackRock, this service expressly refuses to deal with time instants in a reliable manner.
 */
export interface Selector {
  apply: (timestamp: string) => boolean;
}

export class CompoundSelector implements Selector {
  #selectors: Selector[];

  constructor() {
    this.#selectors = [];
  }

  addSelector(selector: Selector) {
    this.#selectors.push(selector);
  }

  apply(date: string) {
    return this.#selectors.reduce((prev, selector) => prev && selector.apply(date), true);
  }
}

export class SinceDateSelector implements Selector {
  #referenceDate: string;

  constructor(date: string) {
    this.#referenceDate = date;
  }

  apply(date: string) {
    return date.localeCompare(this.#referenceDate) >= 0;
  }
}

export class UntilSelector implements Selector {
  #referenceDate: string;

  constructor(date: string) {
    this.#referenceDate = date;
  }

  apply(date: string) {
    return this.#referenceDate.localeCompare(date) >= 0;
  }
}

export interface StockPricesService {
  symbols(): string[];
  fetchDailyClosingStockPrices(symbol: string, selector: Selector): Promise<Array<StockPrice>>;
}
