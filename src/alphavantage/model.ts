/*
 * This module contains the subset of the types relevant for this API.
 */

export const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export interface DailyClosingStockPrice {
  "4. close": string;
}

export type IndexOfDailyClosingStockPrices = {
  [date: string]: DailyClosingStockPrice;
};

export interface DailyClosingStockPrices {
  "Time Series (Daily)": IndexOfDailyClosingStockPrices;
}
