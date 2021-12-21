import { InMemoryStockPricesService } from "../../src/alphavantage/simple-stock-prices-service";
import { UnknownSymbolError } from "../../src/core/errors";
import {
  CompoundSelector,
  SinceDateSelector,
  UntilSelector as UntilDateSelector,
} from "../../src/core/stock-prices-service";

describe("the in-memory prices service", () => {
  it("selects available stock prices", async () => {
    const service = new InMemoryStockPricesService({
      IBM: {
        "Time Series (Daily)": {
          "2021-12-20": {
            "4. close": "127.0600",
          },
          "2021-12-17": {
            "4. close": "127.4000",
          },
          "2021-12-16": {
            "4. close": "125.9300",
          },
          "2021-12-15": {
            "4. close": "123.1100",
          },
        },
      },
    });

    const selector = new CompoundSelector();
    selector.addSelector(new SinceDateSelector("2021-12-16"));
    selector.addSelector(new UntilDateSelector("2021-12-17"));

    const result = await service.fetchDailyClosingStockPrices("IBM", selector);

    expect(result.length).toBe(2);
    const [first, second] = result;
    expect(first.timestamp).toBe("2021-12-17");
    expect(second.timestamp).toBe("2021-12-16");
    expect(first.close).toBe(127.4);
    expect(second.close).toBe(125.93);
  });

  it("selects available stock prices", async () => {
    const service = new InMemoryStockPricesService({
      IBM: {
        "Time Series (Daily)": {},
      },
    });

    const selector = new CompoundSelector();
    selector.addSelector(new SinceDateSelector("2021-12-16"));
    selector.addSelector(new UntilDateSelector("2021-12-17"));

    try {
      return await service.fetchDailyClosingStockPrices("AAPL", selector);
    } catch (e) {
      return expect(e).toBeInstanceOf(UnknownSymbolError);
    }
  });
});
