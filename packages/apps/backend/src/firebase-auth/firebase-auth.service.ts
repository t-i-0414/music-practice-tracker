import { Injectable } from '@nestjs/common';
import type { DecodedIdToken, UserRecord } from 'firebase-admin/auth';

import { FirebaseAuthProvider } from './firebase-auth.provider';

import { DomainError } from '@/domain/utils/domain.error';
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
            throw new DomainError('DO0005', ERROR_CODE_RECORDS.DO0005, e);
          case 'auth/id-token-revoked':
            throw new DomainError('DO0006', ERROR_CODE_RECORDS.DO0006, e);
          default:
            throw new DomainError('DO0007', ERROR_CODE_RECORDS.DO0007, e);
        }
      }

      throw new DomainError('DO0007', ERROR_CODE_RECORDS.DO0007, e);
    }
  }

  public async getUser(uid: string): Promise<UserRecord> {
    try {
      return await this.provider.auth().getUser(uid);
    } catch (e) {
      throw new DomainError('DO0008', ERROR_CODE_RECORDS.DO0008, e);
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
      throw new DomainError('DO0009', ERROR_CODE_RECORDS.DO0009, e);
    }
  }
}
