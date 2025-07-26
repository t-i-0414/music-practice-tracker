import { type ConfigContext, type ExpoConfig } from 'expo/config';

export default ({ config: _config }: ConfigContext): ExpoConfig => {
  const baseConfig: ExpoConfig = {
    name: 'music-practice-tracker',
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
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      package: 'com.takudev.musicpracticetracker',
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
        },
      ],
      'expo-web-browser',
    ],
    experiments: {
      typedRoutes: true,
    },
    owner: 'takudev',
    extra: {
      eas: {
        projectId: '382a6dba-a16c-4b4d-91be-abade4f6c750',
      },
      storybookEnabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true',
    },
  };

  return {
    ...baseConfig,
    ...(process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true' && {
      name: `${baseConfig.name}-storybook`,
      slug: `${baseConfig.slug}-storybook`,
      orientation: 'landscape',
      icon: './src/assets/images/icon-storybook.png',
      splash: {
        ...baseConfig.splash,
        image: './src/assets/images/splash-storybook.png',
        resizeMode: 'cover',
        backgroundColor: '#ffffff',
      },
    }),
  };
};
