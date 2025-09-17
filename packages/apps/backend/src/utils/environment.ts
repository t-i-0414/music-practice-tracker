export const isDevelopment = (): boolean =>
  process.env.NODE_ENV === undefined || process.env.NODE_ENV === 'development';

export const isStaging = (): boolean => process.env.NODE_ENV === 'staging';

export const isProduction = (): boolean => process.env.NODE_ENV === 'production';

export const isTest = (): boolean => process.env.NODE_ENV === 'test';

export const getEnvironment = (): string => process.env.NODE_ENV ?? 'development';
