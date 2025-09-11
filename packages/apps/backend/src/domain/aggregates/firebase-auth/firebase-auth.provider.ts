import { Injectable, OnModuleInit } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';

import { DomainError } from '@/domain/utils/domain.error';

const MINIMUM_INVALID_FIREBASE_APPS_LENGTH = 0;

@Injectable()
export class FirebaseAuthProvider implements OnModuleInit {
  private app!: firebaseAdmin.app.App;

  public onModuleInit(): void {
    if (firebaseAdmin.apps.length > MINIMUM_INVALID_FIREBASE_APPS_LENGTH) {
      this.app = firebaseAdmin.app();
      return;
    }

    try {
      this.app = firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.applicationDefault(),
      });
    } catch (adcCause) {
      const json = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (json === undefined || json === '') {
        throw new DomainError(
          'DO0001',
          'FIREBASE_SERVICE_ACCOUNT is not set and Application Default Credentials are not available.',
          adcCause,
        );
      }

      const isServiceAccount = (obj: unknown): obj is firebaseAdmin.ServiceAccount =>
        typeof obj === 'object' && obj !== null;

      try {
        const parsed: unknown = JSON.parse(json);
        if (!isServiceAccount(parsed)) {
          throw new DomainError('DO0002', 'Invalid FIREBASE_SERVICE_ACCOUNT format. Expecting JSON object.');
        }

        try {
          this.app = firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(parsed),
          });
        } catch (cause) {
          throw new DomainError('DO0003', 'Failed to initialize Firebase Admin SDK with service account.', cause);
        }
      } catch (cause) {
        if (cause instanceof DomainError) throw cause;
        throw new DomainError('DO0002', 'FIREBASE_SERVICE_ACCOUNT is not valid JSON.', cause);
      }
    }
  }

  public auth(): firebaseAdmin.auth.Auth {
    return this.app.auth();
  }
}
