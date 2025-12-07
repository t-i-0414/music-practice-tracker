import { type ConfigContext, type ExpoConfig } from 'expo/config';

const getAppEnv = (): 'production' | 'staging' | 'storybook' | 'development' => {
  const env = process.env.APP_ENV;
  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  if (env === 'storybook') return 'storybook';
  return 'development';
};

const getBundleId = (appEnv: string): string => {
  const base = 'com.takudev.musicpracticetracker';
  return appEnv === 'production' ? base : `${base}.${appEnv}`;
};

export default ({ config: _config }: ConfigContext): ExpoConfig => {
  const appEnv = getAppEnv();
  const name = appEnv === 'production' ? 'Music Practice Tracker' : `MPT (${appEnv})`;
  const bundleId = getBundleId(appEnv);

  const baseConfig: ExpoConfig = {
    name,
    slug: 'music-practice-tracker',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './src/assets/images/icon.png',
    scheme: 'music-practice-tracker',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './src/assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
      dark: {
        image: './src/assets/images/splash-icon.png',
        backgroundColor: '#1a191b',
      },
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: bundleId,
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      package: bundleId,
      adaptiveIcon: {
        foregroundImage: './src/assets/images/splash-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './src/assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            image: './src/assets/images/splash-icon.png',
            backgroundColor: '#1a191b',
          },
        },
      ],
      'expo-web-browser',
      'expo-font',
    ],
    experiments: {
      typedRoutes: true,
    },
    owner: 'takudev',
    extra: {
      eas: {
        projectId: '382a6dba-a16c-4b4d-91be-abade4f6c750',
      },
    },
  };

  return {
    ...baseConfig,
    ...(appEnv === 'storybook'
      ? {
          orientation: 'landscape',
          icon: './src/assets/images/icon-storybook.png',
          splash: {
            ...baseConfig.splash,
            image: './src/assets/images/splash-storybook.png',
            resizeMode: 'cover',
            backgroundColor: '#ffffff',
          },
        }
      : {}),
  };
};
