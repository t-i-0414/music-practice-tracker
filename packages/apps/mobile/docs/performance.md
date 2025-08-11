# Mobile App Performance Guidelines

## Overview

This document outlines performance optimization strategies, monitoring practices, and best practices for the React Native/Expo mobile application.

## Performance Targets

### Key Metrics

| Metric            | Target    | Critical   |
| ----------------- | --------- | ---------- |
| App Launch Time   | < 2s      | < 4s       |
| Screen Transition | < 300ms   | < 500ms    |
| List Scroll FPS   | 60 FPS    | 30 FPS     |
| Memory Usage      | < 150MB   | < 300MB    |
| JS Bundle Size    | < 2MB     | < 4MB      |
| API Response Time | < 1s      | < 3s       |
| Battery Drain     | < 5%/hour | < 10%/hour |

## Bundle Size Optimization

### Code Splitting

```typescript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

export function MyScreen() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Tree Shaking

```typescript
// ❌ Bad: Imports entire library
import * as Icons from '@expo/vector-icons';

// ✅ Good: Import only what you need
import { Ionicons } from '@expo/vector-icons';
```

### Dynamic Imports

```typescript
// Load libraries on demand
async function processImage(imageUri: string) {
  const ImageManipulator = await import('expo-image-manipulator');

  return ImageManipulator.manipulateAsync(imageUri, [{ resize: { width: 800 } }], {
    compress: 0.7,
    format: ImageManipulator.SaveFormat.JPEG,
  });
}
```

## Rendering Optimization

### Memoization

```tsx
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
export const ExpensiveComponent = memo(
  ({ data }: Props) => {
    return <ComplexVisualization data={data} />;
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.data.id === nextProps.data.id;
  },
);

// Memoize expensive computations
export function DataProcessor({ items }: { items: Item[] }) {
  const processedData = useMemo(() => {
    return items
      .filter((item) => item.active)
      .sort((a, b) => b.priority - a.priority)
      .map((item) => ({
        ...item,
        displayName: formatName(item.name),
      }));
  }, [items]);

  return <DataList data={processedData} />;
}

// Memoize callbacks
export function InteractiveList({ onItemPress }: Props) {
  const handlePress = useCallback(
    (id: string) => {
      onItemPress(id);
    },
    [onItemPress],
  );

  return items.map((item) => <ListItem key={item.id} onPress={() => handlePress(item.id)} />);
}
```

### List Optimization

```tsx
import { FlashList } from '@shopify/flash-list';

export function OptimizedList({ data }: { data: Item[] }) {
  const renderItem = useCallback(({ item }: { item: Item }) => <ListItem item={item} />, []);

  const keyExtractor = useCallback((item: Item) => item.id, []);

  const getItemType = useCallback((item: Item) => {
    // Return different types for heterogeneous lists
    return item.type;
  }, []);

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      estimatedItemSize={100}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
      }}
    />
  );
}
```

### Image Optimization

```tsx
import { Image } from 'expo-image';

export function OptimizedImage({ source, style }: Props) {
  return (
    <Image
      source={source}
      style={style}
      placeholder={blurhash}
      contentFit='cover'
      transition={200}
      cachePolicy='memory-disk' // Cache in memory and disk
      priority='high' // For above-the-fold images
      responsivePolicy='live' // Adjust quality based on network
    />
  );
}

// Lazy load images
export function LazyImage({ source, style }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <InView onChange={setIsVisible}>
      {isVisible ? <Image source={source} style={style} /> : <View style={[style, styles.placeholder]} />}
    </InView>
  );
}
```

## Animation Performance

### Using Reanimated

```tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, runOnUI } from 'react-native-reanimated';

export function PerformantAnimation() {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = () => {
    'worklet';
    // Run on UI thread for better performance
    translateX.value = withSpring(100);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={handlePress}>
        <Text>Animate</Text>
      </Pressable>
    </Animated.View>
  );
}
```

### Gesture Performance

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export function GestureExample() {
  const position = useSharedValue({ x: 0, y: 0 });

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      position.value = {
        x: event.translationX,
        y: event.translationY,
      };
    })
    .runOnJS(false); // Keep on UI thread

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value.x }, { translateY: position.value.y }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        <DraggableContent />
      </Animated.View>
    </GestureDetector>
  );
}
```

## Memory Management

### Cleanup Hooks

```tsx
export function useCleanup() {
  useEffect(() => {
    const subscription = EventEmitter.addListener('event', handler);
    const timer = setInterval(polling, 5000);
    const observer = new IntersectionObserver(callback);

    return () => {
      subscription.remove();
      clearInterval(timer);
      observer.disconnect();
    };
  }, []);
}
```

### Image Memory Management

```tsx
import { Image } from 'expo-image';

export function ImageGallery({ images }: Props) {
  useEffect(() => {
    // Preload critical images
    Image.prefetch(images.slice(0, 3));

    return () => {
      // Clear image cache when component unmounts
      Image.clearMemoryCache();
    };
  }, [images]);

  return (
    <FlatList
      data={images}
      renderItem={({ item }) => (
        <Image
          source={item.uri}
          recyclingKey={item.id} // Reuse image views
        />
      )}
    />
  );
}
```

## Network Optimization

### Request Batching

```typescript
class BatchedApiClient {
  private queue: Request[] = [];
  private timer: NodeJS.Timeout | null = null;

  async batchRequest(request: Request): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.queue.push({ ...request, resolve, reject });

      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), 50);
      }
    });
  }

  private async flush() {
    const batch = [...this.queue];
    this.queue = [];
    this.timer = null;

    try {
      const response = await fetch('/api/batch', {
        method: 'POST',
        body: JSON.stringify(batch.map((r) => r.data)),
      });

      const results = await response.json();

      batch.forEach((request, index) => {
        request.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach((request) => request.reject(error));
    }
  }
}
```

### Caching Strategy

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

class CacheManager {
  private memoryCache = new Map<string, CacheEntry>();

  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memEntry = this.memoryCache.get(key);
    if (memEntry && !this.isExpired(memEntry)) {
      return memEntry.data as T;
    }

    // Check disk cache
    const diskEntry = await AsyncStorage.getItem(key);
    if (diskEntry) {
      const parsed = JSON.parse(diskEntry);
      if (!this.isExpired(parsed)) {
        // Update memory cache
        this.memoryCache.set(key, parsed);
        return parsed.data as T;
      }
    }

    return null;
  }

  async set<T>(key: string, data: T, ttl = 3600000): Promise<void> {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Update memory cache
    this.memoryCache.set(key, entry);

    // Update disk cache
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }
}
```

## Startup Optimization

### Splash Screen Management

```tsx
import * as SplashScreen from 'expo-splash-screen';

// Keep splash screen visible
SplashScreen.preventAutoHideAsync();

export function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Preload fonts
        await Font.loadAsync({
          'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
        });

        // Preload critical data
        await preloadUserData();

        // Artificial delay if needed for branding
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <View onLayout={onLayoutRootView}>
      <MainApp />
    </View>
  );
}
```

## Monitoring

### Performance Monitoring

```typescript
import * as Analytics from 'expo-analytics';

export class PerformanceMonitor {
  private marks = new Map<string, number>();

  mark(name: string) {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string) {
    const start = this.marks.get(startMark) || 0;
    const end = endMark ? this.marks.get(endMark) : performance.now();
    const duration = end - start;

    Analytics.track('Performance', {
      metric: name,
      duration,
      timestamp: Date.now(),
    });

    return duration;
  }

  // Monitor component render time
  useRenderTime(componentName: string) {
    useEffect(() => {
      const startTime = performance.now();

      return () => {
        const renderTime = performance.now() - startTime;
        if (renderTime > 100) {
          console.warn(`Slow render: ${componentName} took ${renderTime}ms`);
        }
      };
    });
  }
}
```

### Memory Monitoring

```typescript
export function useMemoryMonitor() {
  useEffect(() => {
    const interval = setInterval(() => {
      if (performance.memory) {
        const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
        const usage = (usedJSHeapSize / totalJSHeapSize) * 100;

        if (usage > 90) {
          console.warn(`High memory usage: ${usage.toFixed(2)}%`);
          // Trigger cleanup
          Image.clearMemoryCache();
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);
}
```

## Platform-Specific Optimizations

### iOS Optimizations

```tsx
import { Platform } from 'react-native';

if (Platform.OS === 'ios') {
  // Use iOS-specific optimizations
  InteractionManager.runAfterInteractions(() => {
    // Heavy operations after animations
  });
}
```

### Android Optimizations

```tsx
if (Platform.OS === 'android') {
  // Enable Hermes for better performance
  // android/app/build.gradle: enableHermes: true

  // Reduce overdraw
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
```

## Best Practices

### Do's

- ✅ Profile before optimizing
- ✅ Use production builds for performance testing
- ✅ Implement lazy loading
- ✅ Optimize images and assets
- ✅ Use native drivers for animations
- ✅ Implement proper list virtualization
- ✅ Monitor performance in production
- ✅ Test on low-end devices

### Don'ts

- ❌ Premature optimization
- ❌ Inline functions in render
- ❌ Unnecessary re-renders
- ❌ Large component trees
- ❌ Synchronous storage operations
- ❌ Blocking the main thread
- ❌ Memory leaks from subscriptions

## Performance Checklist

- [ ] Bundle size < 2MB
- [ ] App launch time < 2s
- [ ] List scroll at 60 FPS
- [ ] Images optimized and lazy loaded
- [ ] Animations use native driver
- [ ] Memory leaks checked
- [ ] Network requests optimized
- [ ] Profiled on low-end devices
- [ ] Performance monitoring enabled
- [ ] Critical paths optimized

## Related Documentation

- [Testing Strategy](./testing-strategy.md)
- [Error Handling](./error-handling.md)
- [State Management](./state-management.md)
