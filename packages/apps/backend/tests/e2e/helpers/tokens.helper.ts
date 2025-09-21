import { createFirebaseEmailUser, FirebaseEmulatorUser } from './firebase-emulator.helper';

export function createVerifiedFirebaseUser(): FirebaseEmulatorUser {
  return createFirebaseEmailUser({ emailVerified: true });
}

export function buildAuthHeader(idToken: string): string {
  return `Bearer ${idToken}`;
}
