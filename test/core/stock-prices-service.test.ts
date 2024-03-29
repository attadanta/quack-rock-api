import {
  CompoundSelector,
  SinceSelector as SinceSelector,
  UntilSelector,
} from "../../src/core/stock-prices-service";

describe("the compound selector", () => {
  it("yields true when no selectors given", () => {
    const selector = new CompoundSelector();
    expect(selector.apply(new Date("2021-12-21"))).toBe(true);
  });

  it("selects a date in range", () => {
    const selector = new CompoundSelector();
    selector.addSelector(new SinceSelector(new Date("2021-12-21")));
    selector.addSelector(new UntilSelector(new Date("2021-12-31")));

    expect(selector.apply(new Date("2021-12-21"))).toBe(true);
    expect(selector.apply(new Date("2021-12-25"))).toBe(true);
    expect(selector.apply(new Date("2021-12-31"))).toBe(true);
    expect(selector.apply(new Date("2021-12-15"))).toBe(false);
    expect(selector.apply(new Date("2022-01-01)"))).toBe(false);
  });

  it("selects a date since (inclusive)", () => {
    const selector = new CompoundSelector();
    selector.addSelector(new SinceSelector(new Date("2021-12-21")));

    expect(selector.apply(new Date("2021-12-21"))).toBe(true);
    expect(selector.apply(new Date("2021-12-25"))).toBe(true);
    expect(selector.apply(new Date("2021-12-31"))).toBe(true);
    expect(selector.apply(new Date("2022-12-31"))).toBe(true);
    expect(selector.apply(new Date("2021-12-15"))).toBe(false);
  });

  it("selects a date until (inclusive)", () => {
    const selector = new CompoundSelector();
    selector.addSelector(new UntilSelector(new Date("2021-12-21")));

    expect(selector.apply(new Date("2021-01-10"))).toBe(true);
    expect(selector.apply(new Date("2021-12-15"))).toBe(true);
    expect(selector.apply(new Date("2021-12-21"))).toBe(true);
    expect(selector.apply(new Date("2021-12-25"))).toBe(false);
    expect(selector.apply(new Date("2021-12-31"))).toBe(false);
    expect(selector.apply(new Date("2022-12-31"))).toBe(false);
  });
});
