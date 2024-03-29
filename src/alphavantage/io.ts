import { DailyClosingStockPrice, DailyClosingStockPrices, IndexOfDailyClosingStockPrices, datePattern } from "./model";

export const isDailyStockPrices = (data: unknown): data is DailyClosingStockPrices => {
  const key = "Time Series (Daily)";

  if (!isLikeDailyStockPrices(data)) {
    return false;
  }

  const rawTimeSeries = data[key];
  if (!isLikeIndexOfDailyStockPrices(rawTimeSeries)) {
    return false;
  }

  for (const currentKey of Object.keys(rawTimeSeries)) {
    if (!datePattern.test(currentKey)) {
      return false;
    }
    if (!isDailyClosingStockPrice(rawTimeSeries[currentKey])) {
      return false;
    }
  }
  return true;
};

const isLikeIndexOfDailyStockPrices = (
  data: unknown
): data is Partial<Record<keyof IndexOfDailyClosingStockPrices, unknown>> => {
  return isNonNullObject(data);
};

const isLikeDailyStockPrices = (data: unknown): data is Partial<Record<keyof DailyClosingStockPrices, unknown>> => {
  return isNonNullObject(data);
};

const isLikeClosingPrice = (data: unknown): data is Partial<Record<keyof DailyClosingStockPrice, unknown>> => {
  return isNonNullObject(data);
};

export const isDailyClosingStockPrice = (data: unknown): data is DailyClosingStockPrice => {
  if (isLikeClosingPrice(data)) {
    const rawValue = data["4. close"];
    return typeof rawValue === "string" && !Number.isNaN(parseFloat(rawValue));
  } else {
    return false;
  }
};

const isNonNullObject = (data: unknown): boolean => {
  return typeof data === "object" && data !== null && !Array.isArray(data);
};
