import { createFirebaseEmailUser, FirebaseEmulatorUser } from './firebase-emulator.helper';

export async function createVerifiedFirebaseUser(): Promise<FirebaseEmulatorUser> {
  return createFirebaseEmailUser({ emailVerified: true });
}

export function buildAuthHeader(idToken: string): string {
  return `Bearer ${idToken}`;
}
