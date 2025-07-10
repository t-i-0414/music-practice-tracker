import type React from 'react';

import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type MyButtonProps = {
  onPress(): void;
  text: string;
};

export const MyButton = ({ onPress, text }: MyButtonProps): React.ReactNode => (
  <TouchableOpacity
    style={styles.container}
    onPress={() => {
      onPress();
    }}
  >
    <Text style={styles.text}>{text}</Text>
  </TouchableOpacity>
);

const purple = 'purple';
const white = 'white';
const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    backgroundColor: purple,
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 8,
  },
  text: { color: white, fontSize: 16, fontWeight: 'bold' },
});
