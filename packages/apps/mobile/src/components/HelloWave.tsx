import type React from 'react';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';

export const HelloWave: React.FC = () => {
  const INITIAL_VALUE = 0;
  const rotationAnimation = useSharedValue(INITIAL_VALUE);

  useEffect(() => {
    const TO_VALUE = 25;
    const SECOND_VALUE = 0;
    const NUMBER_OF_REPS = 4;
    rotationAnimation.value = withRepeat(
      withSequence(withTiming(TO_VALUE, { duration: 150 }), withTiming(SECOND_VALUE, { duration: 150 })),
      NUMBER_OF_REPS, // Run the animation 4 times
    );
  }, [rotationAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationAnimation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.text}>👋</ThemedText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
