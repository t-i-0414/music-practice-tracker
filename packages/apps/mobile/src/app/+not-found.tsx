import type React from 'react';

import { StyleSheet } from 'react-native';

import { Link, Stack } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const NotFoundScreen: React.FC = () => (
  <>
    <Stack.Screen options={{ title: 'Oops!' }} />
    <ThemedView style={styles.container}>
      <ThemedText type='title'>This screen does not exist.</ThemedText>
      <Link href='/' style={styles.link}>
        <ThemedText type='link'>Go to home screen!</ThemedText>
      </Link>
    </ThemedView>
  </>
);
export default NotFoundScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
