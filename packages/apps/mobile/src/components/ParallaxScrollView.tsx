import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { interpolate, useAnimatedRef, useAnimatedStyle, useScrollViewOffset } from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({ children, headerImage, headerBackgroundColor }: Props): React.JSX.Element {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const HEADER_OUTPUT_START_POSITION_DIVIDER = 2;
    const HEADER_OUTPUT_END_POSITION_RATE = 0.75;
    const MIDDLE_POSITION = 0;
    const OUTPUT_RANGE_FIRST_INDEX = 2;
    const OUTPUT_RANGE_SECOND_INDEX = 1;
    const OUTPUT_RANGE_THIRD_INDEX = 1;

    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, MIDDLE_POSITION, HEADER_HEIGHT],
            [
              -HEADER_HEIGHT / HEADER_OUTPUT_START_POSITION_DIVIDER,
              MIDDLE_POSITION,
              HEADER_HEIGHT * HEADER_OUTPUT_END_POSITION_RATE,
            ],
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, MIDDLE_POSITION, HEADER_HEIGHT],
            [OUTPUT_RANGE_FIRST_INDEX, OUTPUT_RANGE_SECOND_INDEX, OUTPUT_RANGE_THIRD_INDEX],
          ),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}
      >
        <Animated.View
          style={[styles.header, { backgroundColor: headerBackgroundColor[colorScheme] }, headerAnimatedStyle]}
        >
          {headerImage}
        </Animated.View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});
