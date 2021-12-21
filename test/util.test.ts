import { getIntFromEnvironment, getStringListFromEnvironment } from "../src/util";

describe("get integer from environment", () => {
  it("prefers the value from environment when set", () => {
    const env: NodeJS.ProcessEnv = {
      PORT: "4000",
    };
    expect(getIntFromEnvironment(env, "PORT", 3000)).toEqual(4000);
  });

  it("defaults when environment variable not set", () => {
    const env: NodeJS.ProcessEnv = {};
    expect(getIntFromEnvironment(env, "PORT", 3000)).toEqual(3000);
  });

  it("defaults when environment variable not a number", () => {
    const env: NodeJS.ProcessEnv = {
      PORT: "eight one eight one",
    };
    expect(getIntFromEnvironment(env, "PORT", 3000)).toEqual(3000);
  });

  it("absent a default value, throws when environment variable not set", () => {
    const env: NodeJS.ProcessEnv = {};
    expect(() => getIntFromEnvironment(env, "PORT")).toThrow();
  });

  it("absent a default value, throws when environment variable is not an integer", () => {
    const env: NodeJS.ProcessEnv = {
      PORT: "three thousand",
    };
    expect(() => getIntFromEnvironment(env, "PORT")).toThrow();
  });
});

describe("get string list from environment", () => {
  it("prefers the value from environment when set", () => {
    const env: NodeJS.ProcessEnv = {
      SYMBOLS: "a,b, c",
    };
    expect(getStringListFromEnvironment(env, "SYMBOLS", ",", ["GE", "AMZN", "AAPL", "IBM"])).toEqual(["a", "b", "c"]);
  });
});
