import { isDailyClosingStockPrice, isDailyStockPrices } from "../../src/alphavantage/io";

describe("alphavantage price type guards", () => {
  it("validates a daily closing price", () => {
    const data = {
      "1. open": "125.7200",
      "2. high": "127.2000",
      "3. low": "124.7000",
      "4. close": "127.0600",
      "5. volume": "4941411",
    };

    expect(isDailyClosingStockPrice(data)).toBe(true);
  });

  it("invalidates a daily closing price with a missing member", () => {
    const data = [
      {
        high: "127.2000",
        low: "124.7000",
        volume: "4941411",
      },
    ];

    expect(isDailyClosingStockPrice(data)).toBe(false);
  });

  it("invalidates a daily closing price with incorrect types", () => {
    expect(isDailyClosingStockPrice(null)).toBe(false);
    expect(isDailyClosingStockPrice(undefined)).toBe(false);
    expect(isDailyClosingStockPrice([])).toBe(false);
    expect(isDailyClosingStockPrice({})).toBe(false);
    expect(
      isDailyClosingStockPrice({
        "4. close": 127.06,
      })
    ).toBe(false);
  });
});

describe("alphavantage time series type guards", () => {
  it("validates a time series type guard", () => {
    const data = {
      "Meta Data": {
        "1. Information": "Daily Prices (open, high, low, close) and Volumes",
        "2. Symbol": "IBM",
        "3. Last Refreshed": "2021-12-20",
        "4. Output Size": "Compact",
        "5. Time Zone": "US/Eastern",
      },
      "Time Series (Daily)": {
        "2021-12-20": {
          "1. open": "125.7200",
          "2. high": "127.2000",
          "3. low": "124.7000",
          "4. close": "127.0600",
          "5. volume": "4941411",
        },
      },
    };

    expect(isDailyStockPrices(data)).toBe(true);
  });

  it("invalidates time series with incorrect types", () => {
    expect(isDailyStockPrices({})).toBe(false);
    expect(isDailyStockPrices([])).toBe(false);
    expect(isDailyStockPrices(null)).toBe(false);
    expect(isDailyStockPrices(undefined)).toBe(false);
    expect(isDailyStockPrices({ "Time Series (Daily)": null })).toBe(false);
    expect(isDailyStockPrices({ "Time Series (Daily)": undefined })).toBe(false);
    expect(isDailyStockPrices({ "Time Series (Daily)": [] })).toBe(false);
  });

  it("invalidates time series due to missing properties", () => {
    const data = {
      series: {
        "2021-12-20": {
          "1. open": "125.7200",
          "2. high": "127.2000",
          "3. low": "124.7000",
          "4. close": "127.0600",
          "5. volume": "4941411",
        },
      },
    };

    expect(isDailyStockPrices(data)).toBe(false);
  });

  it("invalidates time series on encountering an invalid time stamp", () => {
    const data = {
      "Time Series (Daily)": {
        "2021-12-20": {
          "1. open": "125.7200",
          "2. high": "127.2000",
          "3. low": "124.7000",
          "4. close": "127.0600",
          "5. volume": "4941411",
        },
        "21-11-12": {
          "1. open": "125.7200",
          "2. high": "127.2000",
          "3. low": "124.7000",
          "4. close": "127.0600",
          "5. volume": "4941411",
        },
      },
    };

    expect(isDailyStockPrices(data)).toBe(false);
  });

  it("invalidates time series on encountering an invalid closing price element", () => {
    const data = {
      "Time Series (Daily)": {
        "2021-12-19": {
          "1. open": "125.7200",
          "2. high": "127.2000",
          "3. low": "124.7000",
          "4. close": "127.0600",
          "5. volume": "4941411",
        },
        "2021-12-20": {},
      },
    };

    expect(isDailyStockPrices(data)).toBe(false);
  });
});
