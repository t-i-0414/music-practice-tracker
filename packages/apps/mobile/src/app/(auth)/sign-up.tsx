import type React from 'react';
import { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuthContext, useFirebaseAuth } from '@/features/auth';
import { useThemeColor } from '@/hooks/useThemeColor';

const PADDING = 24;
const INPUT_HEIGHT = 56;
const BUTTON_HEIGHT = 52;
const BORDER_RADIUS = 12;
const BORDER_RADIUS_SM = 8;
const SOCIAL_BUTTON_SIZE = 56;
const GAP = 16;
const GAP_SM = 12;
const GAP_XS = 8;
const FONT_SIZE_TITLE = 28;
const FONT_SIZE_BODY = 16;
const FONT_SIZE_SM = 14;
const FONT_SIZE_XS = 12;
const SOCIAL_ICON_SIZE = 24;
const BORDER_WIDTH = 1;
const DIVIDER_HEIGHT = 1;
const CHECKBOX_SIZE = 24;
const CHECKBOX_BORDER_RADIUS = 4;
const CHECKBOX_BORDER_WIDTH = 2;
const MIN_INPUT_LENGTH = 1;
const TRANSPARENT = 'transparent';

const TERMS_URL = 'https://example.com/terms';
const PRIVACY_URL = 'https://example.com/privacy';

const REGISTRATION_ERROR_MESSAGE = 'ユーザー登録に失敗しました。もう一度お試しください。';

const SignUpScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { registerUser, beginRegistration, endRegistration } = useAuthContext();
  const { loading, error, signUpWithEmail, signInWithGoogle, signInWithApple, clearError } = useFirebaseAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const primaryColor = useThemeColor({}, 'primary');
  const onPrimaryColor = useThemeColor({}, 'onPrimary');
  const surfaceColor = useThemeColor({}, 'surface');
  const onSurfaceColor = useThemeColor({}, 'onSurface');
  const outlineColor = useThemeColor({}, 'outline');
  const outlineVariantColor = useThemeColor({}, 'outlineVariant');
  const onSurfaceVariantColor = useThemeColor({}, 'onSurfaceVariant');
  const errorColor = useThemeColor({}, 'error');
  const surfaceContainerColor = useThemeColor({}, 'surfaceContainer');

  const isFormValid =
    name.trim().length >= MIN_INPUT_LENGTH &&
    email.trim().length >= MIN_INPUT_LENGTH &&
    password.length >= MIN_INPUT_LENGTH &&
    termsAccepted;

  const handleGoogleSignIn = useCallback(async () => {
    clearError();
    setRegistrationError(null);
    beginRegistration();
    try {
      const { name: googleName } = await signInWithGoogle();
      try {
        await registerUser(googleName || 'User');
      } catch {
        setRegistrationError(REGISTRATION_ERROR_MESSAGE);
      }
    } catch {
      // Firebase auth errors are captured in useFirebaseAuth.error
    } finally {
      endRegistration();
    }
  }, [signInWithGoogle, registerUser, clearError, beginRegistration, endRegistration]);

  const handleAppleSignIn = useCallback(async () => {
    clearError();
    setRegistrationError(null);
    beginRegistration();
    try {
      const { name: appleName } = await signInWithApple();
      try {
        await registerUser(appleName || 'User');
      } catch {
        setRegistrationError(REGISTRATION_ERROR_MESSAGE);
      }
    } catch {
      // Firebase auth errors are captured in useFirebaseAuth.error
    } finally {
      endRegistration();
    }
  }, [signInWithApple, registerUser, clearError, beginRegistration, endRegistration]);

  const handleEmailSignUp = useCallback(async () => {
    if (!isFormValid) return;
    clearError();
    try {
      const { emailVerificationRequired } = await signUpWithEmail(email.trim(), password, name.trim());
      if (emailVerificationRequired) {
        Alert.alert(
          'メール確認',
          '確認メールを送信しました。メール内のリンクをクリックしてアカウントを有効化してください。',
        );
        setName('');
        setEmail('');
        setPassword('');
        setTermsAccepted(false);
      }
    } catch {
      // Error is captured in useFirebaseAuth
    }
  }, [isFormValid, signUpWithEmail, email, password, name, clearError]);

  const handleOpenTerms = useCallback(() => {
    void WebBrowser.openBrowserAsync(TERMS_URL);
  }, []);

  const handleOpenPrivacy = useCallback(() => {
    void WebBrowser.openBrowserAsync(PRIVACY_URL);
  }, []);

  const toggleTerms = useCallback(() => {
    setTermsAccepted((prev) => !prev);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + PADDING, paddingBottom: insets.bottom + PADDING },
          ]}
          keyboardShouldPersistTaps='handled'
        >
          <ThemedText style={styles.title}>アカウント登録</ThemedText>

          {/* Social Login */}
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[
                styles.socialButton,
                { backgroundColor: surfaceContainerColor, borderColor: outlineVariantColor },
              ]}
              onPress={() => {
                void handleGoogleSignIn();
              }}
              disabled={loading}
              activeOpacity={0.7}
              accessibilityLabel='Googleでサインアップ'
              accessibilityRole='button'
            >
              <Ionicons name='logo-google' size={SOCIAL_ICON_SIZE} color={onSurfaceColor} />
            </TouchableOpacity>

            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  { backgroundColor: surfaceContainerColor, borderColor: outlineVariantColor },
                ]}
                onPress={() => {
                  void handleAppleSignIn();
                }}
                disabled={loading}
                activeOpacity={0.7}
                accessibilityLabel='Appleでサインアップ'
                accessibilityRole='button'
              >
                <Ionicons name='logo-apple' size={SOCIAL_ICON_SIZE} color={onSurfaceColor} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: outlineVariantColor }]} />
            <ThemedText style={[styles.dividerText, { color: onSurfaceVariantColor }]}>or</ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: outlineVariantColor }]} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: surfaceColor, borderColor: outlineColor, color: onSurfaceColor },
              ]}
              placeholder='名前'
              placeholderTextColor={onSurfaceVariantColor}
              value={name}
              onChangeText={setName}
              autoCapitalize='words'
              autoComplete='name'
              textContentType='name'
              editable={!loading}
              accessibilityLabel='名前'
            />

            <TextInput
              style={[
                styles.input,
                { backgroundColor: surfaceColor, borderColor: outlineColor, color: onSurfaceColor },
              ]}
              placeholder='メールアドレス'
              placeholderTextColor={onSurfaceVariantColor}
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              autoCapitalize='none'
              autoComplete='email'
              textContentType='emailAddress'
              editable={!loading}
              accessibilityLabel='メールアドレス'
            />

            <TextInput
              style={[
                styles.input,
                { backgroundColor: surfaceColor, borderColor: outlineColor, color: onSurfaceColor },
              ]}
              placeholder='パスワード'
              placeholderTextColor={onSurfaceVariantColor}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete='new-password'
              textContentType='newPassword'
              editable={!loading}
              accessibilityLabel='パスワード'
            />
          </View>

          {/* Terms Checkbox */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={toggleTerms}
            activeOpacity={0.7}
            disabled={loading}
            accessibilityRole='checkbox'
            accessibilityState={{ checked: termsAccepted }}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: termsAccepted ? primaryColor : outlineColor,
                  backgroundColor: termsAccepted ? primaryColor : TRANSPARENT,
                },
              ]}
            >
              {termsAccepted ? <ThemedText style={[styles.checkmark, { color: onPrimaryColor }]}>✓</ThemedText> : null}
            </View>
            <ThemedText style={[styles.termsText, { color: onSurfaceVariantColor }]}>
              <ThemedText style={[styles.termsLink, { color: primaryColor }]} onPress={handleOpenTerms}>
                利用規約
              </ThemedText>
              {'と'}
              <ThemedText style={[styles.termsLink, { color: primaryColor }]} onPress={handleOpenPrivacy}>
                プライバシーポリシー
              </ThemedText>
              {'に同意する'}
            </ThemedText>
          </TouchableOpacity>

          {/* Error */}
          {(error ?? registrationError) !== null ? (
            <ThemedText style={[styles.errorText, { color: errorColor }]}>{error ?? registrationError}</ThemedText>
          ) : null}

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[
              styles.signUpButton,
              { backgroundColor: isFormValid && !loading ? primaryColor : outlineVariantColor },
            ]}
            onPress={() => {
              void handleEmailSignUp();
            }}
            disabled={!isFormValid || loading}
            activeOpacity={0.7}
            accessibilityLabel='アカウントを作成'
            accessibilityRole='button'
          >
            {loading ? (
              <ActivityIndicator color={onPrimaryColor} />
            ) : (
              <ThemedText style={[styles.signUpButtonText, { color: onPrimaryColor }]}>アカウントを作成</ThemedText>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  checkbox: {
    alignItems: 'center',
    borderRadius: CHECKBOX_BORDER_RADIUS,
    borderWidth: CHECKBOX_BORDER_WIDTH,
    height: CHECKBOX_SIZE,
    justifyContent: 'center',
    width: CHECKBOX_SIZE,
  },
  checkmark: {
    fontSize: FONT_SIZE_SM,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: GAP,
    marginVertical: PADDING,
  },
  dividerLine: {
    flex: 1,
    height: DIVIDER_HEIGHT,
  },
  dividerText: {
    fontSize: FONT_SIZE_SM,
  },
  errorText: {
    fontSize: FONT_SIZE_SM,
    marginTop: GAP_XS,
    textAlign: 'center',
  },
  flex: {
    flex: 1,
  },
  form: {
    gap: GAP_SM,
  },
  input: {
    borderRadius: BORDER_RADIUS_SM,
    borderWidth: BORDER_WIDTH,
    fontSize: FONT_SIZE_BODY,
    height: INPUT_HEIGHT,
    paddingHorizontal: GAP,
  },
  scrollContent: {
    paddingHorizontal: PADDING,
  },
  signUpButton: {
    alignItems: 'center',
    borderRadius: BORDER_RADIUS,
    height: BUTTON_HEIGHT,
    justifyContent: 'center',
    marginTop: PADDING,
  },
  signUpButtonText: {
    fontSize: FONT_SIZE_BODY,
    fontWeight: '600',
  },
  socialButton: {
    alignItems: 'center',
    borderRadius: BORDER_RADIUS,
    borderWidth: BORDER_WIDTH,
    height: SOCIAL_BUTTON_SIZE,
    justifyContent: 'center',
    width: SOCIAL_BUTTON_SIZE,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: GAP,
    justifyContent: 'center',
    marginTop: PADDING,
  },
  termsLink: {
    fontSize: FONT_SIZE_XS,
    textDecorationLine: 'underline',
  },
  termsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: GAP_XS,
    marginTop: GAP,
  },
  termsText: {
    flex: 1,
    fontSize: FONT_SIZE_XS,
  },
  title: {
    fontSize: FONT_SIZE_TITLE,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
