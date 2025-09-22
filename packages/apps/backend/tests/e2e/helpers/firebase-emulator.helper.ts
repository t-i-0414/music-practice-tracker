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

type FirebaseAuthError = Error & { code?: string };

function buildFirebaseError(code: string, message: string): FirebaseAuthError {
  const error = new Error(message) as FirebaseAuthError;
  error.code = code;
  return error;
}

class FirebaseAuthServiceFake {
  public verifyIdToken(token: string) {
    const record = tokenStore.get(token);
    if (record === undefined) {
      throw buildFirebaseError('auth/invalid-id-token', 'The provided ID token is invalid.');
    }

    return {
      uid: record.uid,
      email_verified: record.emailVerified,
      firebase: {
        sign_in_provider: record.signInProvider,
      },
    };
  }

  public getUser(uid: string) {
    const record = uidStore.get(uid);
    if (record === undefined) {
      throw buildFirebaseError('auth/user-not-found', 'No user found for the provided UID.');
    }

    return {
      uid,
      email: record.email,
      displayName: record.displayName,
      emailVerified: record.emailVerified,
    };
  }

  public deleteUser(uid: string): void {
    if (!uidStore.has(uid)) {
      return;
    }

    uidStore.delete(uid);

    // ensure corresponding tokens are removed to mimic Firebase behavior
    for (const [token, record] of tokenStore.entries()) {
      if (record.uid === uid) {
        tokenStore.delete(token);
      }
    }
  }
}

export function createFirebaseAuthServiceFake(): FirebaseAuthServiceFake {
  return new FirebaseAuthServiceFake();
}
