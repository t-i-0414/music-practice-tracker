import { Injectable } from '@nestjs/common';
import type { DecodedIdToken, UserRecord } from 'firebase-admin/auth';

import { FirebaseAuthProvider } from './firebase-auth.provider';

import { FirebaseError } from '@/firebase-auth/utils/firebase.error';
import { ERROR_CODE_RECORDS } from '@/utils/errors/error-code';

@Injectable()
export class FirebaseAuthService {
  public constructor(private readonly provider: FirebaseAuthProvider) {}

  public async verifyIdToken(idToken: string, checkRevoked = false): Promise<DecodedIdToken> {
    try {
      return await this.provider.auth().verifyIdToken(idToken, checkRevoked);
    } catch (e) {
      if (e instanceof Error && 'code' in e && e.code === 'auth/id-token-expired') {
        throw new FirebaseError('FB0004', ERROR_CODE_RECORDS.FB0004, e);
      }
      if (e instanceof Error && 'code' in e && e.code === 'auth/id-token-revoked') {
        throw new FirebaseError('FB0005', ERROR_CODE_RECORDS.FB0005, e);
      }
      throw new FirebaseError('FB0006', ERROR_CODE_RECORDS.FB0006, e);
    }
  }

  public async getUser(uid: string): Promise<UserRecord> {
    try {
      return await this.provider.auth().getUser(uid);
    } catch (e) {
      throw new FirebaseError('FB0007', ERROR_CODE_RECORDS.FB0007, e);
    }
  }

  public async deleteUser(uid: string): Promise<void> {
    try {
      await this.provider.auth().deleteUser(uid);
    } catch (e) {
      if (e instanceof Error && 'code' in e && e.code === 'auth/user-not-found') {
        // Idempotent: already deleted on Firebase side, treat as success
        return;
      }
      throw new FirebaseError('FB0008', ERROR_CODE_RECORDS.FB0008, e);
    }
  }

  /**
   * Delete multiple Firebase accounts in a single batch call.
   * Non-existing UIDs are silently ignored by Firebase (treated as successful deletions).
   * Throws a {@link FirebaseError} when the batch result contains failures.
   *
   * @remarks Firebase Admin SDK limits batch to 1000 UIDs per call.
   *          This method throws FB0009 if the limit is exceeded;
   *          callers handling larger sets must chunk before invoking.
   */
  public async deleteUsers(uids: string[]): Promise<void> {
    const EMPTY = 0;
    const FIREBASE_BATCH_LIMIT = 1000;
    if (uids.length === EMPTY) return;

    if (uids.length > FIREBASE_BATCH_LIMIT) {
      throw new FirebaseError(
        'FB0009',
        ERROR_CODE_RECORDS.FB0009,
        `Cannot delete more than ${String(FIREBASE_BATCH_LIMIT)} Firebase accounts in a single batch (received ${String(uids.length)})`,
      );
    }

    try {
      const result = await this.provider.auth().deleteUsers(uids);
      if (result.failureCount > EMPTY) {
        const errorDetails = result.errors.map((e) => `index=${String(e.index)} error=${e.error.message}`).join('; ');
        throw new FirebaseError(
          'FB0009',
          ERROR_CODE_RECORDS.FB0009,
          `${String(result.failureCount)} of ${String(uids.length)} Firebase account(s) failed to delete: ${errorDetails}`,
        );
      }
    } catch (e) {
      if (e instanceof FirebaseError) throw e;
      throw new FirebaseError('FB0009', ERROR_CODE_RECORDS.FB0009, e);
    }
  }
}
