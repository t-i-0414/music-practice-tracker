import { Injectable } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';

import { FirebaseAuthProvider } from './firebase-auth.provider';

import { ApiError } from '@/apis/utils/api.error';

@Injectable()
export class FirebaseAuthService {
  public constructor(private readonly provider: FirebaseAuthProvider) {}

  public async verifyIdToken(idToken: string, checkRevoked = false): Promise<DecodedIdToken> {
    try {
      return await this.provider.auth().verifyIdToken(idToken, checkRevoked);
    } catch (e) {
      const error = e instanceof Error && 'code' in e ? e : { code: undefined, message: 'Unknown error' };
      if (error.code === 'auth/id-token-expired') {
        throw new ApiError('AP0401', 'Token expired', e);
      }
      if (error.code === 'auth/id-token-revoked') {
        throw new ApiError('AP0401', 'Token revoked', e);
      }
      throw new ApiError('AP0401', 'Invalid token', e);
    }
  }

  public async createCustomToken(uid: string, claims?: object): Promise<string> {
    try {
      return await this.provider.auth().createCustomToken(uid, claims);
    } catch (e) {
      throw new ApiError('AP0500', 'Failed to create custom token', e);
    }
  }
}
