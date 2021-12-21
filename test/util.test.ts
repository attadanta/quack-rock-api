import { getIntFromEnvironment } from "../src/util";

describe("get integer from environment", () => {
  it("prefers the value from environment when set", () => {
    const env: NodeJS.ProcessEnv = {
      PORT: "4000",
    };
    expect(getIntFromEnvironment(env, "PORT", 3000)).toBe(4000);
  });

  it("defaults when environment variable not set", () => {
    const env: NodeJS.ProcessEnv = {};
    expect(getIntFromEnvironment(env, "PORT", 3000)).toBe(3000);
  });

  it("defaults when environment variable not a number", () => {
    const env: NodeJS.ProcessEnv = {
      PORT: "eight one eight one",
    };
    expect(getIntFromEnvironment(env, "PORT", 3000)).toBe(3000);
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
