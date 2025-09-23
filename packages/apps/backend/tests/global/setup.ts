import { ensureAuthEmulator, setAuthEmulatorState } from './firebase-emulator-manager';

export default async function globalSetup(): Promise<void> {
  const state = await ensureAuthEmulator();
  setAuthEmulatorState(state);
}
