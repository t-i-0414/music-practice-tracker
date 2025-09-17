import { ALLOWLIST_PROVIDERS, isProviderAllowed } from '@/domain/aggregates/firebase-auth/utils/constants';

describe('unit firebase auth constants', () => {
  it('exposes the expected allowlist of providers', () => {
    expect.assertions(1);

    expect(ALLOWLIST_PROVIDERS).toStrictEqual(['google.com', 'apple.com']);
  });

  it('returns true only when the provider is part of the allowlist', () => {
    expect.assertions(3);

    expect(isProviderAllowed('google.com')).toBe(true);
    expect(isProviderAllowed('apple.com')).toBe(true);
    expect(isProviderAllowed('github.com')).toBe(false);
  });

  it('returns false when provider is undefined', () => {
    expect.assertions(1);

    expect(isProviderAllowed(undefined)).toBe(false);
  });
});
