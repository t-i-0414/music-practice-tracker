import { randomUUID } from 'node:crypto';

type TokenRecord = {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  signInProvider: string;
};

type FirebaseEmulatorUserOptions = {
  email?: string;
  password?: string;
  displayName?: string;
  emailVerified?: boolean;
  signInProvider?: string;
};

export type FirebaseEmulatorUser = {
  email: string;
  localId: string;
  idToken: string;
  refreshToken: string;
};

const tokenStore: Map<string, TokenRecord> = new Map();
const uidStore: Map<string, TokenRecord> = new Map();

const DEFAULT_SIGN_IN_PROVIDER = 'password';

export function ensureFirebaseEmulatorEnv(): void {
  // no-op: maintained for compatibility with previous implementation
}

export function resetFirebaseAuthEmulator(): void {
  tokenStore.clear();
  uidStore.clear();
}

export function createFirebaseEmailUser(options: FirebaseEmulatorUserOptions = {}): FirebaseEmulatorUser {
  const localId = options.password ?? randomUUID();
  const token = `token-${randomUUID()}`;

  const record: TokenRecord = {
    uid: localId,
    email: options.email ?? `user-${randomUUID()}@example.com`,
    displayName: options.displayName ?? 'E2E Test User',
    emailVerified: options.emailVerified ?? false,
    signInProvider: options.signInProvider ?? DEFAULT_SIGN_IN_PROVIDER,
  };

  uidStore.set(localId, record);
  tokenStore.set(token, record);

  return {
    email: record.email,
    localId,
    idToken: token,
    refreshToken: `refresh-${randomUUID()}`,
  };
}

class FirebaseAuthServiceFake {}

export function createFirebaseAuthServiceFake(): FirebaseAuthServiceFake {
  return new FirebaseAuthServiceFake();
}
