import { validateEnvironment } from '@/config/env-validation';

describe('unit validateEnvironment', () => {
  const validConfig: Record<string, unknown> = {
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    NODE_ENV: 'development',
  };

  it('passes with valid required and optional fields', () => {
    expect.assertions(2);

    const result = validateEnvironment(validConfig);

    expect(result.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db');
    expect(result.NODE_ENV).toBe('development');
  });

  it('throws when DATABASE_URL is missing', () => {
    expect.assertions(1);

    expect(() => validateEnvironment({ NODE_ENV: 'test' })).toThrow('DATABASE_URL');
  });

  it('throws when DATABASE_URL is an empty string', () => {
    expect.assertions(1);

    expect(() => validateEnvironment({ DATABASE_URL: '' })).toThrow('DATABASE_URL');
  });

  it('throws when NODE_ENV is an invalid enum value', () => {
    expect.assertions(1);

    expect(() => validateEnvironment({ ...validConfig, NODE_ENV: 'invalid' })).toThrow('NODE_ENV');
  });

  it('passes when NODE_ENV is omitted', () => {
    expect.assertions(1);

    const result = validateEnvironment({ DATABASE_URL: 'postgresql://localhost/db' });

    expect(result.NODE_ENV).toBeUndefined();
  });

  it.each(['development', 'staging', 'production', 'test'] as const)('accepts NODE_ENV=%s', (env) => {
    expect.assertions(1);

    const result = validateEnvironment({ ...validConfig, NODE_ENV: env });

    expect(result.NODE_ENV).toBe(env);
  });

  it('converts APP_API_PORT string to number', () => {
    expect.assertions(1);

    const result = validateEnvironment({ ...validConfig, APP_API_PORT: '4000' });

    expect(result.APP_API_PORT).toBe(4000);
  });

  it('converts ADMIN_API_PORT string to number', () => {
    expect.assertions(1);

    const result = validateEnvironment({ ...validConfig, ADMIN_API_PORT: '4001' });

    expect(result.ADMIN_API_PORT).toBe(4001);
  });

  it('passes with all optional Firebase fields', () => {
    expect.assertions(4);

    const result = validateEnvironment({
      ...validConfig,
      FIREBASE_AUTH_EMULATOR_HOST: 'localhost:9099',
      GOOGLE_CLOUD_PROJECT: 'test-project',
      FIREBASE_SERVICE_ACCOUNT: '{"key":"value"}',
      FIREBASE_CHECK_REVOKED: 'true',
    });

    expect(result.FIREBASE_AUTH_EMULATOR_HOST).toBe('localhost:9099');
    expect(result.GOOGLE_CLOUD_PROJECT).toBe('test-project');
    expect(result.FIREBASE_SERVICE_ACCOUNT).toBe('{"key":"value"}');
    expect(result.FIREBASE_CHECK_REVOKED).toBe('true');
  });

  it('passes without any optional fields', () => {
    expect.assertions(1);

    const result = validateEnvironment({ DATABASE_URL: 'postgresql://localhost/db' });

    expect(result.DATABASE_URL).toBe('postgresql://localhost/db');
  });

  it('does not strip unknown environment variables', () => {
    expect.assertions(1);

    const config = { ...validConfig, PATH: '/usr/bin', SOME_OTHER_VAR: 'value' };

    expect(() => validateEnvironment(config)).not.toThrow();
  });
});
