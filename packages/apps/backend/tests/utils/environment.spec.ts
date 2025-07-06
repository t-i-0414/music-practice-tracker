import { getEnvironment, isDevelopment, isProduction, isTest } from '@/utils/environment';

describe('Environment Utilities', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NODE_ENV = originalEnv;
    } else {
      delete process.env.NODE_ENV;
    }
  });

  describe('isTest()', () => {
    it('should return true when NODE_ENV is "test"', () => {
      process.env.NODE_ENV = 'test';
      expect(isTest()).toBe(true);
    });

    it('should return false when NODE_ENV is "development"', () => {
      process.env.NODE_ENV = 'development';
      expect(isTest()).toBe(false);
    });

    it('should return false when NODE_ENV is "production"', () => {
      process.env.NODE_ENV = 'production';
      expect(isTest()).toBe(false);
    });

    it('should return false when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV;
      expect(isTest()).toBe(false);
    });

    it('should return false for any other value', () => {
      process.env.NODE_ENV = 'staging';
      expect(isTest()).toBe(false);
    });
  });

  describe('isDevelopment()', () => {
    it('should return true when NODE_ENV is "development"', () => {
      process.env.NODE_ENV = 'development';
      expect(isDevelopment()).toBe(true);
    });

    it('should return true when NODE_ENV is "test"', () => {
      process.env.NODE_ENV = 'test';
      expect(isDevelopment()).toBe(true);
    });

    it('should return false when NODE_ENV is "production"', () => {
      process.env.NODE_ENV = 'production';
      expect(isDevelopment()).toBe(false);
    });

    it('should return true when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV;
      expect(isDevelopment()).toBe(true);
    });

    it('should return true for any non-production value', () => {
      process.env.NODE_ENV = 'staging';
      expect(isDevelopment()).toBe(true);

      process.env.NODE_ENV = 'qa';
      expect(isDevelopment()).toBe(true);

      process.env.NODE_ENV = 'local';
      expect(isDevelopment()).toBe(true);
    });
  });

  describe('isProduction()', () => {
    it('should return true when NODE_ENV is "production"', () => {
      process.env.NODE_ENV = 'production';
      expect(isProduction()).toBe(true);
    });

    it('should return false when NODE_ENV is "development"', () => {
      process.env.NODE_ENV = 'development';
      expect(isProduction()).toBe(false);
    });

    it('should return false when NODE_ENV is "test"', () => {
      process.env.NODE_ENV = 'test';
      expect(isProduction()).toBe(false);
    });

    it('should return false when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV;
      expect(isProduction()).toBe(false);
    });

    it('should return false for any non-production value', () => {
      process.env.NODE_ENV = 'staging';
      expect(isProduction()).toBe(false);

      process.env.NODE_ENV = 'prod'; // Close but not exact
      expect(isProduction()).toBe(false);

      process.env.NODE_ENV = 'PRODUCTION'; // Case sensitive
      expect(isProduction()).toBe(false);
    });
  });

  describe('getEnvironment()', () => {
    it('should return "test" when NODE_ENV is "test"', () => {
      process.env.NODE_ENV = 'test';
      expect(getEnvironment()).toBe('test');
    });

    it('should return "development" when NODE_ENV is "development"', () => {
      process.env.NODE_ENV = 'development';
      expect(getEnvironment()).toBe('development');
    });

    it('should return "production" when NODE_ENV is "production"', () => {
      process.env.NODE_ENV = 'production';
      expect(getEnvironment()).toBe('production');
    });

    it('should return "development" as default when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV;
      expect(getEnvironment()).toBe('development');
    });

    it('should return custom environment values', () => {
      process.env.NODE_ENV = 'staging';
      expect(getEnvironment()).toBe('staging');

      process.env.NODE_ENV = 'qa';
      expect(getEnvironment()).toBe('qa');

      process.env.NODE_ENV = 'local';
      expect(getEnvironment()).toBe('local');
    });

    it('should handle empty string', () => {
      process.env.NODE_ENV = '';
      expect(getEnvironment()).toBe('');
    });

    it('should handle whitespace', () => {
      process.env.NODE_ENV = '  ';
      expect(getEnvironment()).toBe('  ');
    });
  });

  describe('Combined behavior', () => {
    it('should have consistent behavior in test environment', () => {
      process.env.NODE_ENV = 'test';

      expect(isTest()).toBe(true);
      expect(isDevelopment()).toBe(true); // Test is considered development
      expect(isProduction()).toBe(false);
      expect(getEnvironment()).toBe('test');
    });

    it('should have consistent behavior in development environment', () => {
      process.env.NODE_ENV = 'development';

      expect(isTest()).toBe(false);
      expect(isDevelopment()).toBe(true);
      expect(isProduction()).toBe(false);
      expect(getEnvironment()).toBe('development');
    });

    it('should have consistent behavior in production environment', () => {
      process.env.NODE_ENV = 'production';

      expect(isTest()).toBe(false);
      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(true);
      expect(getEnvironment()).toBe('production');
    });

    it('should have consistent behavior when environment is undefined', () => {
      delete process.env.NODE_ENV;

      expect(isTest()).toBe(false);
      expect(isDevelopment()).toBe(true);
      expect(isProduction()).toBe(false);
      expect(getEnvironment()).toBe('development');
    });
  });

  describe('Edge cases', () => {
    it('should handle null-like string values', () => {
      process.env.NODE_ENV = 'null';
      expect(isTest()).toBe(false);
      expect(isDevelopment()).toBe(true);
      expect(isProduction()).toBe(false);
      expect(getEnvironment()).toBe('null');

      process.env.NODE_ENV = 'undefined';
      expect(isTest()).toBe(false);
      expect(isDevelopment()).toBe(true);
      expect(isProduction()).toBe(false);
      expect(getEnvironment()).toBe('undefined');
    });

    it('should be case sensitive', () => {
      process.env.NODE_ENV = 'TEST';
      expect(isTest()).toBe(false);

      process.env.NODE_ENV = 'DEVELOPMENT';
      expect(isDevelopment()).toBe(true); // Still not production

      process.env.NODE_ENV = 'PRODUCTION';
      expect(isProduction()).toBe(false);
    });

    it('should handle special characters', () => {
      process.env.NODE_ENV = 'test-env';
      expect(isTest()).toBe(false);
      expect(getEnvironment()).toBe('test-env');

      process.env.NODE_ENV = 'dev_environment';
      expect(isDevelopment()).toBe(true);
      expect(getEnvironment()).toBe('dev_environment');
    });
  });

  describe('Type safety', () => {
    it('should return boolean for check functions', () => {
      process.env.NODE_ENV = 'test';

      const testResult: boolean = isTest();
      const devResult: boolean = isDevelopment();
      const prodResult: boolean = isProduction();

      expect(typeof testResult).toBe('boolean');
      expect(typeof devResult).toBe('boolean');
      expect(typeof prodResult).toBe('boolean');
    });

    it('should return string for getEnvironment', () => {
      process.env.NODE_ENV = 'test';

      const env: string = getEnvironment();
      expect(typeof env).toBe('string');
    });
  });

  describe('Real-world scenarios', () => {
    it('should correctly identify CI/CD environments', () => {
      // CI environments often use 'test'
      process.env.NODE_ENV = 'test';
      expect(isTest()).toBe(true);
      expect(isDevelopment()).toBe(true); // For non-production behavior
    });

    it('should handle Docker environments', () => {
      // Docker might use custom environment names
      process.env.NODE_ENV = 'docker-dev';
      expect(isDevelopment()).toBe(true);
      expect(isProduction()).toBe(false);
      expect(getEnvironment()).toBe('docker-dev');
    });

    it('should handle cloud environments', () => {
      // Cloud providers might use different naming
      process.env.NODE_ENV = 'aws-production';
      expect(isProduction()).toBe(false); // Exact match required
      expect(getEnvironment()).toBe('aws-production');

      process.env.NODE_ENV = 'production';
      expect(isProduction()).toBe(true);
    });
  });
});
