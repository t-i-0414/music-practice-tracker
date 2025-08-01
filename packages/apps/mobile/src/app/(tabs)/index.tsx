import type React from 'react';

import { Platform, StyleSheet } from 'react-native';

import { Image } from 'expo-image';

import PartialReactLogo from '@/assets/images/partial-react-logo.png';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const HomeScreen: React.FC = () => (
  <ParallaxScrollView
    headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
    headerImage={<Image source={PartialReactLogo} style={styles.reactLogo} />}
  >
    <ThemedView style={styles.titleContainer}>
      <ThemedText type='title'>Welcome!</ThemedText>
      <HelloWave />
    </ThemedView>
    <ThemedView style={styles.stepContainer}>
      <ThemedText type='subtitle'>Step 1: Try it</ThemedText>
      <ThemedText>
        Edit <ThemedText type='defaultSemiBold'>app/(tabs)/index.tsx</ThemedText> to see changes. Press{' '}
        <ThemedText type='defaultSemiBold'>
          {Platform.select({
            ios: 'cmd + d',
            android: 'cmd + m',
            web: 'F12',
          })}
        </ThemedText>{' '}
        to open developer tools.
      </ThemedText>
    </ThemedView>
    <ThemedView style={styles.stepContainer}>
      <ThemedText type='subtitle'>Step 2: Explore</ThemedText>
      <ThemedText>{`Tap the Explore tab to learn more about what's included in this starter app.`}</ThemedText>
    </ThemedView>
    <ThemedView style={styles.stepContainer}>
      <ThemedText type='subtitle'>Step 3: Get a fresh start</ThemedText>
      <ThemedText>
        {`When you're ready, run `}
        <ThemedText type='defaultSemiBold'>npm run reset-project</ThemedText> to get a fresh{' '}
        <ThemedText type='defaultSemiBold'>app</ThemedText> directory. This will move the current{' '}
        <ThemedText type='defaultSemiBold'>app</ThemedText> to{' '}
        <ThemedText type='defaultSemiBold'>app-example</ThemedText>.
      </ThemedText>
    </ThemedView>
  </ParallaxScrollView>
);
export default HomeScreen;

const styles = StyleSheet.create({
  reactLogo: {
    bottom: 0,
    height: 178,
    left: 0,
    position: 'absolute',
    width: 290,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
