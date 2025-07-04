import { getEnvironment, isDevelopment, isProduction, isTest } from '../../src/utils/environment';

describe('Environment utilities', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should detect test environment', () => {
    process.env.NODE_ENV = 'test';

    expect(isTest()).toBe(true);
    expect(isDevelopment()).toBe(true);
    expect(isProduction()).toBe(false);
    expect(getEnvironment()).toBe('test');
  });

  it('should detect development environment', () => {
    process.env.NODE_ENV = 'development';

    expect(isTest()).toBe(false);
    expect(isDevelopment()).toBe(true);
    expect(isProduction()).toBe(false);
    expect(getEnvironment()).toBe('development');
  });

  it('should detect production environment', () => {
    process.env.NODE_ENV = 'production';

    expect(isTest()).toBe(false);
    expect(isDevelopment()).toBe(false);
    expect(isProduction()).toBe(true);
    expect(getEnvironment()).toBe('production');
  });

  it('should default to development if NODE_ENV is undefined', () => {
    delete process.env.NODE_ENV;

    expect(isTest()).toBe(false);
    expect(isDevelopment()).toBe(true);
    expect(isProduction()).toBe(false);
    expect(getEnvironment()).toBe('development');
  });
});
