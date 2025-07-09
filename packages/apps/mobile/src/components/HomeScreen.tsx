import type React from 'react';
import { type PropsWithChildren } from 'react';

import { StyleSheet, Text, View } from 'react-native';

export const CustomText = ({ children }: PropsWithChildren): React.ReactNode => <Text>{children}</Text>;

const HomeScreen = (): React.ReactNode => (
  <View style={styles.container}>
    <CustomText>Welcome!</CustomText>
  </View>
);

export default HomeScreen;

const bgColor = '#fff'; // Default background color
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: bgColor,
    flex: 1,
    justifyContent: 'center',
  },
});
