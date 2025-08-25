import { type UserAuthTokenEnumType } from './user-auth-token.repository.service';

export const USER_AUTH_TOKEN_CONSTANTS = {
  JWT: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY_DAYS: 7,
    SECRET_KEY: 'JWT_SECRET',
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100,
    SALT_ROUNDS: 10,
  },
  OAUTH: {
    PROVIDERS: ['google', 'apple'] as const,
  },
} as const;

export type UserAuthTokenRecord = {
  [key in UserAuthTokenEnumType]: key;
};
export const UserAuthTokenRecord: UserAuthTokenRecord = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
  REFRESH: 'REFRESH',
};
export type UserAuthTokenType = (typeof UserAuthTokenRecord)[keyof typeof UserAuthTokenRecord];
