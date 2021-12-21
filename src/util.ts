export const getIntFromEnvironment = (env: NodeJS.ProcessEnv, name: string, defaultValue?: number) => {
  const rawValue = env[name];
  if (rawValue === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    } else {
      throw new Error(`Environment variable ${name} is undefined, and there is no default value supplied`);
    }
  }
  const numberValue = parseInt(rawValue, 10);
  if (Number.isNaN(numberValue)) {
    if (defaultValue !== undefined) {
      return defaultValue;
    } else {
      throw new Error(
        `The value for environment variable ${name} is not a number, and there is no default value supplied`
      );
    }
  }
  return numberValue;
};

export const getStringListFromEnvironment = (
  env: NodeJS.ProcessEnv,
  name: string,
  delimiter: string = ",",
  defaultValue?: string[]
) => {
  const rawValue = env[name];
  if (rawValue === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    } else {
      throw new Error(`Environment variable ${name} is undefined, and there is no default list of supplied`);
    }
  }
  return rawValue.split(delimiter).map((token) => token.trim());
};
