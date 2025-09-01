import { isDevelopment, isProduction, isTest, getEnvironment } from '@/utils/environment';

describe('environment utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getEnvironment', () => {
    it('should return NODE_ENV value', () => {
      process.env.NODE_ENV = 'test';

      expect(getEnvironment()).toBe('test');
    });

    it('should default to development if NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;

      expect(getEnvironment()).toBe('development');
    });
  });

  describe('isProduction', () => {
    it('should return true when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';

      expect(isProduction()).toBe(true);
    });

    it('should return false when NODE_ENV is not production', () => {
      process.env.NODE_ENV = 'development';

      expect(isProduction()).toBe(false);
    });
  });

  describe('isDevelopment', () => {
    it('should return true when NODE_ENV is not production', () => {
      process.env.NODE_ENV = 'development';

      expect(isDevelopment()).toBe(true);
    });

    it('should return false when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';

      expect(isDevelopment()).toBe(false);
    });

    it('should return true when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';

      expect(isDevelopment()).toBe(true);
    });
  });

  describe('isTest', () => {
    it('should return true when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';

      expect(isTest()).toBe(true);
    });

    it('should return false when NODE_ENV is not test', () => {
      process.env.NODE_ENV = 'production';

      expect(isTest()).toBe(false);
    });
  });
});
