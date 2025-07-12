import { isDevelopment, isProduction, isTest, getEnvironment } from '@/utils/environment';

describe('environment utilities', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('isDevelopment', () => {
    it('should return true when NODE_ENV is not production', () => {
      expect.assertions(1);

      process.env.NODE_ENV = 'development';

      expect(isDevelopment()).toBe(true);
    });

    it('should return true when NODE_ENV is test', () => {
      expect.assertions(1);

      process.env.NODE_ENV = 'test';

      expect(isDevelopment()).toBe(true);
    });

    it('should return false when NODE_ENV is production', () => {
      expect.assertions(1);

      process.env.NODE_ENV = 'production';

      expect(isDevelopment()).toBe(false);
    });

    it('should return true when NODE_ENV is undefined', () => {
      expect.assertions(1);

      delete process.env.NODE_ENV;

      expect(isDevelopment()).toBe(true);
    });
  });

  describe('isProduction', () => {
    it('should return true when NODE_ENV is production', () => {
      expect.assertions(1);

      process.env.NODE_ENV = 'production';

      expect(isProduction()).toBe(true);
    });

    it('should return false when NODE_ENV is development', () => {
      expect.assertions(1);

      process.env.NODE_ENV = 'development';

      expect(isProduction()).toBe(false);
    });

    it('should return false when NODE_ENV is test', () => {
      expect.assertions(1);

      process.env.NODE_ENV = 'test';

      expect(isProduction()).toBe(false);
    });

    it('should return false when NODE_ENV is undefined', () => {
      expect.assertions(1);

      delete process.env.NODE_ENV;

      expect(isProduction()).toBe(false);
    });
  });

  describe('isTest', () => {
    it('should return true when NODE_ENV is test', () => {
      expect.assertions(1);

      process.env.NODE_ENV = 'test';

      expect(isTest()).toBe(true);
    });

    it('should return false when NODE_ENV is development', () => {
      expect.assertions(1);

      process.env.NODE_ENV = 'development';

      expect(isTest()).toBe(false);
    });

    it('should return false when NODE_ENV is production', () => {
      expect.assertions(1);

      process.env.NODE_ENV = 'production';

      expect(isTest()).toBe(false);
    });

    it('should return false when NODE_ENV is undefined', () => {
      expect.assertions(1);

      delete process.env.NODE_ENV;

      expect(isTest()).toBe(false);
    });
  });

  describe('getEnvironment', () => {
    it('should return NODE_ENV value when set', () => {
      expect.assertions(3);

      process.env.NODE_ENV = 'production';

      expect(getEnvironment()).toBe('production');

      process.env.NODE_ENV = 'test';

      expect(getEnvironment()).toBe('test');

      process.env.NODE_ENV = 'development';

      expect(getEnvironment()).toBe('development');
    });

    it('should return custom NODE_ENV value', () => {
      expect.assertions(1);

      process.env.NODE_ENV = 'staging';

      expect(getEnvironment()).toBe('staging');
    });

    it('should return development when NODE_ENV is undefined', () => {
      expect.assertions(1);

      delete process.env.NODE_ENV;

      expect(getEnvironment()).toBe('development');
    });
  });
});