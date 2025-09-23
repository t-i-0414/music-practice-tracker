export const ALLOWLIST_PROVIDERS = ['google.com', 'apple.com'] as const;

export const isProviderAllowed = (provider: string | undefined): boolean =>
  ALLOWLIST_PROVIDERS.some((p) => p === provider);
