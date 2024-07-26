export const ensureEnvVarExists = (varName: string): string => {
  const value = process.env[varName];
  if (!value) {
    throw new Error(
      `Environment variable ${varName} is not set or has no value`
    );
  }
  return process.env[varName] as string;
};
export const getEnvVar = (name: string, fallback?: string): string => {
  const value = process.env[name];
  if (value) return value;
  if (fallback) return fallback;
  throw new Error(`Environment variable ${name} is not set`);
};
