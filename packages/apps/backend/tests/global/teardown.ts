import { clearAuthEmulatorState, getAuthEmulatorState, shutdownAuthEmulator } from './firebase-emulator-manager';

export default async function globalTeardown(): Promise<void> {
  const state = getAuthEmulatorState();
  await shutdownAuthEmulator(state);
  clearAuthEmulatorState();
}
