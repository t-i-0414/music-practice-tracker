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
      if (e instanceof Error && 'code' in e) {
        switch (e.code) {
          case 'auth/id-token-expired':
            throw new FirebaseError('FB0004', ERROR_CODE_RECORDS.FB0004, e);
          case 'auth/id-token-revoked':
            throw new FirebaseError('FB0005', ERROR_CODE_RECORDS.FB0005, e);
          default:
            throw new FirebaseError('FB0006', ERROR_CODE_RECORDS.FB0006, e);
        }
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
}
