import { describe, it, expect } from 'vitest';
import {
  getEnv,
  getEnvOrThrow,
  getEnvOrDefault,
  getNumericEnvOrDefault,
  getBooleanEnvOrDefault,
  loadConfig,
  requireConfig,
  ConfigError,
} from '../src/config';

describe('config', () => {
  it('getEnv returns undefined for missing', () => {
    expect(getEnv('THIS_DOES_NOT_EXIST')).toBeUndefined();
  });

  it('getEnvOrThrow throws for missing', () => {
    expect(() => getEnvOrThrow('THIS_DOES_NOT_EXIST')).toThrow(ConfigError);
  });

  it('getEnvOrDefault returns default for missing', () => {
    expect(getEnvOrDefault('THIS_DOES_NOT_EXIST', 'default')).toBe('default');
  });

  it('getNumericEnvOrDefault returns default for missing', () => {
    expect(getNumericEnvOrDefault('THIS_DOES_NOT_EXIST', 42)).toBe(42);
  });

  it('getBooleanEnvOrDefault returns default for missing', () => {
    expect(getBooleanEnvOrDefault('THIS_DOES_NOT_EXIST', true)).toBe(true);
    expect(getBooleanEnvOrDefault('THIS_DOES_NOT_EXIST', false)).toBe(false);
  });

  it('loadConfig returns merged config', () => {
    const config = loadConfig({
      TEST_VAR: undefined,
      TEST_DEFAULT: 'default',
    });
    expect(config.TEST_DEFAULT).toBe('default');
  });

  it('requireConfig throws when required is missing', () => {
    expect(() =>
      requireConfig({
        TEST_REQUIRED: undefined,
      })
    ).toThrow(ConfigError);
  });
});
