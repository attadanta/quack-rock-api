export interface StockPrice {
  timestamp: Date;
  close: number;
}

export interface Selector {
  apply: (date: Date) => boolean;
}

export class CompoundSelector implements Selector {
  #selectors: Selector[];

  constructor() {
    this.#selectors = [];
  }

  addSelector(selector: Selector) {
    this.#selectors.push(selector);
  }

  apply(date: Date) {
    return this.#selectors.reduce((prev, selector) => prev && selector.apply(date), true);
  }
}

export class SinceDateSelector implements Selector {
  #referenceDate: Date;

  constructor(date: Date) {
    this.#referenceDate = date;
  }

  apply(date: Date) {
    return date.getTime() - this.#referenceDate.getTime() >= 0;
  }
}

export class UntilSelector implements Selector {
  #referenceDate: Date;

  constructor(date: Date) {
    this.#referenceDate = date;
  }

  apply(date: Date) {
    return this.#referenceDate.getTime() - date.getTime() >= 0;
  }
}

export interface StockPricesService {
  symbols(): string[];
  fetchDailyClosingStockPrices(symbol: string, selector: Selector): Promise<Array<StockPrice>>;
}
