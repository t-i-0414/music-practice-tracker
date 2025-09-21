import { randomUUID } from 'node:crypto';

import { ApiError } from '@/apis/utils/api.error';

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

const tokenStore = new Map<string, TokenRecord>();
const uidStore = new Map<string, TokenRecord>();

const DEFAULT_SIGN_IN_PROVIDER = 'password';

export function ensureFirebaseEmulatorEnv(): void {
  // no-op: maintained for compatibility with previous implementation
}

export async function resetFirebaseAuthEmulator(): Promise<void> {
  tokenStore.clear();
  uidStore.clear();
}

export async function createFirebaseEmailUser(
  options: FirebaseEmulatorUserOptions = {},
): Promise<FirebaseEmulatorUser> {
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

export async function createVerifiedFirebaseUser(): Promise<FirebaseEmulatorUser> {
  return createFirebaseEmailUser({ emailVerified: true });
}

type DecodedIdToken = {
  uid: string;
  email?: string;
  email_verified: boolean;
  firebase: {
    sign_in_provider: string;
  };
};

class FirebaseAuthServiceFake {
  public async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    const record = tokenStore.get(idToken);
    if (record === undefined) {
      throw new ApiError('AP0401', 'Firebase invalid token');
    }

    return {
      uid: record.uid,
      email: record.email,
      email_verified: record.emailVerified,
      firebase: {
        sign_in_provider: record.signInProvider,
      },
    };
  }

  public async getUser(uid: string): Promise<{ uid: string; email: string; displayName: string }> {
    const record = uidStore.get(uid);
    if (record === undefined) {
      throw new ApiError('AP0404', 'Firebase user not found');
    }

    return {
      uid: record.uid,
      email: record.email,
      displayName: record.displayName,
    };
  }

  public async deleteUser(uid: string): Promise<void> {
    const record = uidStore.get(uid);
    if (record === undefined) {
      return;
    }

    uidStore.delete(uid);

    for (const [token, tokenRecord] of tokenStore.entries()) {
      if (tokenRecord.uid === uid) {
        tokenStore.delete(token);
      }
    }
  }
}

export function createFirebaseAuthServiceFake(): FirebaseAuthServiceFake {
  return new FirebaseAuthServiceFake();
}
