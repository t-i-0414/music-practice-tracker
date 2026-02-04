import { type ConfigContext, type ExpoConfig } from 'expo/config';

type AppEnv = 'production' | 'staging' | 'storybook' | 'development';

const getAppEnv = (): AppEnv => {
  const env = String(process.env.APP_ENV ?? '');
  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  if (env === 'storybook') return 'storybook';
  return 'development';
};

const getName = (appEnv: AppEnv): string => (appEnv === 'production' ? 'Music Practice Tracker' : `MPT (${appEnv})`);

const getBundleId = (appEnv: AppEnv): string => {
  const base = 'com.takudev.musicpracticetracker';
  return appEnv === 'production' ? base : `${base}.${appEnv}`;
};

const getScheme = (appEnv: AppEnv): string =>
  appEnv === 'production' ? 'music-practice-tracker' : `music-practice-tracker-${appEnv}`;

const getSplashImage = (appEnv: AppEnv): string =>
  appEnv === 'storybook' ? './src/assets/images/splash-storybook.png' : './src/assets/images/splash-icon.png';

const getIconImage = (appEnv: AppEnv): string =>
  appEnv === 'storybook' ? './src/assets/images/icon-storybook.png' : './src/assets/images/icon.png';

const getForegroundImage = (appEnv: AppEnv): string =>
  appEnv === 'storybook' ? './src/assets/images/icon-storybook.png' : './src/assets/images/adaptive-icon.png';

const getBackgroundImage = (appEnv: AppEnv): string | undefined =>
  appEnv === 'storybook' ? undefined : './src/assets/images/adaptive-background.png';

const getOrientation = (appEnv: AppEnv): 'portrait' | 'landscape' =>
  appEnv === 'storybook' ? 'landscape' : 'portrait';

const getResizeMode = (appEnv: AppEnv): 'contain' | 'cover' => (appEnv === 'storybook' ? 'cover' : 'contain');

const enabledStorybook = process.env.ENABLED_STORYBOOK === 'true';
const lightBackgroundColor = '#ffffff';
const darkBackgroundColor = '#1a191b';
const easProjectId = '382a6dba-a16c-4b4d-91be-abade4f6c750';

export default ({ config: _config }: ConfigContext): ExpoConfig => {
  const appEnv = getAppEnv();
  const name = getName(appEnv);
  const bundleId = getBundleId(appEnv);
  const scheme = getScheme(appEnv);
  const splash = getSplashImage(appEnv);
  const icon = getIconImage(appEnv);
  const foregroundImage = getForegroundImage(appEnv);
  const backgroundImage = getBackgroundImage(appEnv);
  const orientation = getOrientation(appEnv);
  const resizeMode = getResizeMode(appEnv);

  return {
    name,
    owner: 'takudev',
    slug: 'music-practice-tracker',
    scheme,
    version: '1.0.0',
    runtimeVersion: {
      policy: 'appVersion',
    },
    orientation,
    icon,
    userInterfaceStyle: 'automatic',
    splash: {
      image: splash,
      resizeMode,
      backgroundColor: lightBackgroundColor,
      dark: {
        image: splash,
        backgroundColor: darkBackgroundColor,
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
        foregroundImage,
        backgroundImage,
      },
      edgeToEdgeEnabled: true,
    },
    updates: {
      url: `https://u.expo.dev/${easProjectId}`,
      fallbackToCacheTimeout: 0,
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: splash,
          imageWidth: 200,
          resizeMode,
          backgroundColor: lightBackgroundColor,
          dark: {
            image: splash,
            backgroundColor: darkBackgroundColor,
          },
        },
      ],
      'expo-web-browser',
      'expo-font',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      appEnv,
      enabledStorybook,
      eas: {
        projectId: easProjectId,
      },
    },
  };
};
