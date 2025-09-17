import { Injectable } from '@nestjs/common';
import type { DecodedIdToken, UserRecord } from 'firebase-admin/auth';

import { FirebaseAuthProvider } from './firebase-auth.provider';

import { ApiError } from '@/apis/utils/api.error';

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
            throw new ApiError('AP0401', 'Firebase token expired', e);
          case 'auth/id-token-revoked':
            throw new ApiError('AP0401', 'Firebase token revoked', e);
          default:
            throw new ApiError('AP0401', 'Firebase invalid token', e);
        }
      }

      throw new ApiError('AP0401', 'Firebase invalid token', e);
    }
  }

  public async getUser(uid: string): Promise<UserRecord> {
    try {
      return await this.provider.auth().getUser(uid);
    } catch (e) {
      throw new ApiError('AP0404', 'Firebase user not found', e);
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
      throw new ApiError('AP0500', 'Failed to delete Firebase user', e);
    }
  }
}
