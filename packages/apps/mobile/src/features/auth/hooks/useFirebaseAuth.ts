import { useCallback, useState } from 'react';

import { Platform } from 'react-native';

import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

export type UseFirebaseAuthReturn = {
  loading: boolean;
  error: string | null;
  signUpWithEmail(email: string, password: string, name: string): Promise<{ emailVerificationRequired: boolean }>;
  signInWithGoogle(): Promise<{ name: string }>;
  signInWithApple(): Promise<{ name: string }>;
  clearError(): void;
};

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
  'auth/invalid-email': 'メールアドレスの形式が正しくありません',
  'auth/weak-password': 'パスワードは6文字以上にしてください',
  'auth/operation-not-allowed': 'この認証方法は無効です',
  'auth/network-request-failed': 'ネットワークエラーが発生しました',
};

const DEFAULT_ERROR_MESSAGE = '認証エラーが発生しました';

const NONCE_BYTE_LENGTH = 32;
const HEX_RADIX = 16;
const HEX_BYTE_WIDTH = 2;
const MIN_NAME_LENGTH = 1;

const getFirebaseErrorMessage = (code: string): string => FIREBASE_ERROR_MESSAGES[code] ?? DEFAULT_ERROR_MESSAGE;

const getFirebaseErrorCode = (err: unknown): string | undefined => {
  if (typeof err !== 'object' || err === null || !('code' in err)) return undefined;
  return typeof err.code === 'string' ? err.code : undefined;
};

export const useFirebaseAuth = (): UseFirebaseAuthReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, name: string): Promise<{ emailVerificationRequired: boolean }> => {
      setLoading(true);
      setError(null);
      try {
        const { user } = await auth().createUserWithEmailAndPassword(email, password);
        await user.updateProfile({ displayName: name });
        await user.sendEmailVerification();
        await auth().signOut();
        return { emailVerificationRequired: true };
      } catch (err: unknown) {
        const code = getFirebaseErrorCode(err);
        const message = typeof code === 'string' ? getFirebaseErrorMessage(code) : DEFAULT_ERROR_MESSAGE;
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const signInWithGoogle = useCallback(async (): Promise<{ name: string }> => {
    setLoading(true);
    setError(null);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (response.type !== 'success') {
        throw new Error('Google Sign-In was cancelled');
      }
      const { idToken } = response.data;
      if (typeof idToken !== 'string') {
        throw new Error('Google Sign-In failed: idToken not available');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const { user } = await auth().signInWithCredential(googleCredential);
      return { name: user.displayName ?? '' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithApple = useCallback(async (): Promise<{ name: string }> => {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In is only available on iOS');
    }

    setLoading(true);
    setError(null);
    try {
      const rawNonce = Array.from(Crypto.getRandomBytes(NONCE_BYTE_LENGTH), (byte) =>
        byte.toString(HEX_RADIX).padStart(HEX_BYTE_WIDTH, '0'),
      ).join('');
      const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (typeof appleCredential.identityToken !== 'string') {
        throw new Error('Apple Sign-In failed: identityToken not available');
      }

      const credential = auth.AppleAuthProvider.credential(appleCredential.identityToken, rawNonce);
      const { user } = await auth().signInWithCredential(credential);

      const { fullName } = appleCredential;
      const appleName = fullName !== null ? [fullName.givenName, fullName.familyName].filter(Boolean).join(' ') : '';
      return { name: appleName.length >= MIN_NAME_LENGTH ? appleName : (user.displayName ?? '') };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, signUpWithEmail, signInWithGoogle, signInWithApple, clearError };
};
