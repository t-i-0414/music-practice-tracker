import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';

import { createUser as createBackendUser, fetchCurrentUser } from '../services/userApi';
import type { AuthState, BackendUser } from '../types';

export type AuthContextValue = {
  authState: AuthState;
  beginRegistration(): void;
  endRegistration(): void;
  registerUser(name: string): Promise<void>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({ status: 'initializing' });
  const isRegistering = useRef(false);

  useEffect(() => {
    const clientId: unknown = Constants.expoConfig?.extra?.googleWebClientId;
    GoogleSignin.configure({
      webClientId: typeof clientId === 'string' ? clientId : '',
    });
  }, []);

  const beginRegistration = useCallback(() => {
    isRegistering.current = true;
  }, []);

  const endRegistration = useCallback(() => {
    isRegistering.current = false;
  }, []);

  const handleFirebaseUser = useCallback(async (firebaseUser: FirebaseAuthTypes.User | null) => {
    if (isRegistering.current) return;

    if (!firebaseUser) {
      setAuthState({ status: 'unauthenticated' });
      return;
    }

    try {
      const user = await fetchCurrentUser();
      setAuthState({ status: 'authenticated', user });
    } catch {
      setAuthState({ status: 'unauthenticated' });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      void handleFirebaseUser(firebaseUser);
    });
    return unsubscribe;
  }, [handleFirebaseUser]);

  const registerUser = useCallback(async (name: string): Promise<void> => {
    isRegistering.current = true;
    try {
      const user: BackendUser = await createBackendUser(name);
      setAuthState({ status: 'authenticated', user });
    } catch (err: unknown) {
      try {
        await auth().signOut();
      } catch {
        // Ignore sign-out errors during cleanup
      }
      setAuthState({ status: 'unauthenticated' });
      throw err;
    } finally {
      isRegistering.current = false;
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await auth().signOut();
    setAuthState({ status: 'unauthenticated' });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ authState, beginRegistration, endRegistration, registerUser, signOut }),
    [authState, beginRegistration, endRegistration, registerUser, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};
