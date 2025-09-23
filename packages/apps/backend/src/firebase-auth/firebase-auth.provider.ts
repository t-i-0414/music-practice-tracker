import { Injectable, OnModuleInit } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';

import { DomainError } from '@/domain/utils/domain.error';
import { ERROR_CODE_RECORDS } from '@/utils/errors/error-code';

@Injectable()
export class FirebaseAuthProvider implements OnModuleInit {
  public onModuleInit(): void {
    if (this.hasInitialized()) {
      this.app = firebaseAdmin.app();
      return;
    }

    const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
    if (typeof emulatorHost === 'string' && emulatorHost.trim() !== '') {
      const projectId =
        process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID;
      if (typeof projectId === 'string' && projectId.trim() !== '') {
        this.app = firebaseAdmin.initializeApp({ projectId: projectId.trim() });
        return;
      }
    }

    try {
      this.app = firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.applicationDefault(),
      });
    } catch (adcCause) {
      const serviceAccountJsonString = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (serviceAccountJsonString === undefined || serviceAccountJsonString.trim() === '') {
        throw new DomainError('DO0001', ERROR_CODE_RECORDS.DO0001, adcCause);
      }
      try {
        JSON.parse(serviceAccountJsonString);
      } catch (e) {
        throw new DomainError('DO0002', ERROR_CODE_RECORDS.DO0002, e);
      }

      const serviceAccount: unknown = JSON.parse(serviceAccountJsonString);
      if (!this.isServiceAccount(serviceAccount)) {
        throw new DomainError(
          'DO0002',
          ERROR_CODE_RECORDS.DO0002,
          'Invalid FIREBASE_SERVICE_ACCOUNT format. Expecting JSON object.',
        );
      }
      const normalizedServiceAccount: firebaseAdmin.ServiceAccount = {
        projectId: serviceAccount.projectId,
        clientEmail: serviceAccount.clientEmail,
        privateKey: serviceAccount.privateKey.replace(/\\n/gu, '\n'),
      };

      try {
        this.app = firebaseAdmin.initializeApp({
          credential: firebaseAdmin.credential.cert(normalizedServiceAccount),
        });
      } catch (cause) {
        throw new DomainError('DO0003', ERROR_CODE_RECORDS.DO0003, cause);
      }
    }
  }

  public onModuleDestroy(): Promise<void> | void {
    const EXIT_CODE_ON_CATCH = 0;
    return this.app.delete().catch(() => void EXIT_CODE_ON_CATCH);
  }

  public auth(): firebaseAdmin.auth.Auth {
    return this.app.auth();
  }

  private app!: firebaseAdmin.app.App;

  private hasInitialized(): boolean {
    const MINIMUM_INVALID_FIREBASE_APPS_LENGTH = 0;
    return firebaseAdmin.apps.length > MINIMUM_INVALID_FIREBASE_APPS_LENGTH;
  }

  private isServiceAccount(obj: unknown): obj is {
    projectId: string;
    clientEmail: string;
    privateKey: string;
  } {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'projectId' in obj &&
      typeof obj.projectId === 'string' &&
      'clientEmail' in obj &&
      typeof obj.clientEmail === 'string' &&
      'privateKey' in obj &&
      typeof obj.privateKey === 'string'
    );
  }
}
