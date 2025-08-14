# Component: [ComponentName]

> Template for React Native components in Mobile app.

## Props Interface

```typescript
interface [ComponentName]Props {
  id: string;
  title: string;
  description?: string;
  isLoading?: boolean;
  onPress?: (id: string) => void;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
}
```

## Implementation

```tsx
import React, { useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export function ComponentName({
  id,
  title,
  description,
  isLoading = false,
  onPress,
  onError,
  children,
}: ComponentNameProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  const handlePress = useCallback(() => {
    try {
      onPress?.(id);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [id, onPress, onError]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return (
    <Pressable
      style={[styles.container, { backgroundColor }]}
      onPress={handlePress}
      disabled={!onPress}
      accessible={true}
      accessibilityLabel={title}
      accessibilityRole='button'
    >
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      {description && <Text style={[styles.description, { color: textColor }]}>{description}</Text>}
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
  },
});
```

## Platform-Specific

```tsx
import { Platform } from 'react-native';

// iOS specific
if (Platform.OS === 'ios') {
  // iOS implementation
}

// Android specific
if (Platform.OS === 'android') {
  // Android implementation
}
```

## Testing

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    const { getByText } = render(<ComponentName id='1' title='Test' />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('handles press', () => {
    const handlePress = jest.fn();
    const { getByText } = render(<ComponentName id='1' title='Test' onPress={handlePress} />);
    fireEvent.press(getByText('Test'));
    expect(handlePress).toHaveBeenCalledWith('1');
  });
});
```

## Animation (Optional)

```tsx
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const opacity = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
}));

// Trigger animation
opacity.value = withTiming(1, { duration: 300 });
```

## Checklist

- [ ] TypeScript props defined
- [ ] Loading & error states handled
- [ ] Theme colors used (not hardcoded)
- [ ] Accessibility properties added
- [ ] Platform differences handled (if needed)
- [ ] Unit tests written
- [ ] Performance optimized (memo if needed)
