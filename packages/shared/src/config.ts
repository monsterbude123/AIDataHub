export type ConfigSchema = Record<string, string | undefined>;

export class ConfigError extends Error {
  constructor(key: string) {
    super(`Missing required environment variable: ${key}`);
    this.name = 'ConfigError';
  }
}

export function getEnv(key: string): string | undefined {
  return process.env[key];
}

export function getEnvOrThrow(key: string): string {
  const value = getEnv(key);
  if (value === undefined) {
    throw new ConfigError(key);
  }
  return value;
}

export function getEnvOrDefault(key: string, defaultValue: string): string {
  const value = getEnv(key);
  return value ?? defaultValue;
}

export function getNumericEnvOrDefault(
  key: string,
  defaultValue: number
): number {
  const value = getEnv(key);
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return defaultValue;
  }
  return parsed;
}

export function getBooleanEnvOrDefault(
  key: string,
  defaultValue: boolean
): boolean {
  const value = getEnv(key);
  if (value === undefined) {
    return defaultValue;
  }
  return ['true', '1', 'yes'].includes(value.toLowerCase());
}

export function loadConfig<T extends ConfigSchema>(schema: T): T {
  const result: ConfigSchema = {};
  for (const [key, defaultValue] of Object.entries(schema)) {
    if (defaultValue === undefined) {
      result[key] = getEnv(key);
    } else {
      result[key] = getEnvOrDefault(key, defaultValue);
    }
  }
  return result as T;
}

export type AppEnv = 'dev' | 'stage' | 'prod';

export function getAppEnv(): AppEnv {
  const raw = getEnvOrDefault('APP_ENV', 'dev').toLowerCase();
  if (raw === 'stage') return 'stage';
  if (raw === 'prod') return 'prod';
  return 'dev';
}

export function getDatabaseUrl(): string {
  const env = getAppEnv().toUpperCase();
  const key = `DATABASE_URL_${env}`;
  return getEnvOrThrow(key);
}

export function requireConfig<T extends ConfigSchema>(schema: T): T {
  const result: ConfigSchema = {};
  for (const [key, defaultValue] of Object.entries(schema)) {
    if (defaultValue === undefined) {
      result[key] = getEnvOrThrow(key);
    } else {
      result[key] = getEnvOrDefault(key, defaultValue);
    }
  }
  return result as T;
}
