# Mobile App Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the React Native/Expo mobile application, covering unit tests, integration tests, E2E tests, and platform-specific testing.

## Testing Stack

### Core Tools

- **Jest**: Unit and integration testing framework
- **React Native Testing Library**: Component testing utilities
- **Maestro**: E2E testing for mobile apps
- **Detox**: Alternative E2E testing (iOS/Android)
- **Storybook**: Component development and testing

## Test Structure

```
packages/apps/mobile/
├── tests/
│   ├── unit/               # Unit tests
│   │   ├── components/     # Component tests
│   │   ├── hooks/          # Custom hook tests
│   │   ├── utils/          # Utility function tests
│   │   └── services/       # Service tests
│   ├── integration/        # Integration tests
│   │   ├── screens/        # Screen integration tests
│   │   └── navigation/     # Navigation flow tests
│   ├── e2e/               # End-to-end tests
│   │   ├── flows/         # User flow tests
│   │   └── maestro/       # Maestro test files
│   └── fixtures/          # Test data and mocks
```

## Unit Testing

### Component Testing

```tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('should render correctly', () => {
    const { getByText } = render(<Button title='Click me' onPress={() => {}} />);

    expect(getByText('Click me')).toBeTruthy();
  });

  it('should handle press events', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title='Click me' onPress={onPress} />);

    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    const { getByTestId } = render(<Button title='Submit' onPress={() => {}} loading testID='submit-button' />);

    const button = getByTestId('submit-button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });
});
```

### Hook Testing

```tsx
import { renderHook, act } from '@testing-library/react-native';
import { useCounter } from '../useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should reset counter', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(5);
  });
});
```

### Service Testing

```tsx
import { ApiService } from '../ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('ApiService', () => {
  let apiService: ApiService;

  beforeEach(() => {
    apiService = new ApiService();
    jest.clearAllMocks();
  });

  describe('authentication', () => {
    it('should store token on successful login', async () => {
      const mockToken = 'test-token';
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: mockToken }),
      });

      await apiService.login('user@example.com', 'password');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', mockToken);
    });

    it('should handle login failure', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' }),
      });

      await expect(apiService.login('user@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });
});
```

## Integration Testing

### Screen Integration Tests

```tsx
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { UserScreen } from '../UserScreen';
import { ApiProvider } from '../contexts/ApiContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      <ApiProvider>{component}</ApiProvider>
    </NavigationContainer>,
  );
};

describe('UserScreen Integration', () => {
  it('should load and display user data', async () => {
    const mockUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ];

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockUsers }),
    });

    const { getByText, queryByTestId } = renderWithProviders(<UserScreen />);

    // Check loading state
    expect(queryByTestId('loading-indicator')).toBeTruthy();

    // Wait for data to load
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Jane Smith')).toBeTruthy();
    });

    // Loading indicator should be gone
    expect(queryByTestId('loading-indicator')).toBeFalsy();
  });
});
```

### Navigation Testing

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from '../HomeScreen';
import { DetailsScreen } from '../DetailsScreen';

const Stack = createNativeStackNavigator();

const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name='Home' component={HomeScreen} />
      <Stack.Screen name='Details' component={DetailsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Navigation Flow', () => {
  it('should navigate from Home to Details', () => {
    const { getByText, queryByText } = render(<TestNavigator />);

    // Initially on Home screen
    expect(getByText('Welcome to Home')).toBeTruthy();
    expect(queryByText('Details Screen')).toBeFalsy();

    // Navigate to Details
    fireEvent.press(getByText('Go to Details'));

    // Should be on Details screen
    expect(queryByText('Welcome to Home')).toBeFalsy();
    expect(getByText('Details Screen')).toBeTruthy();
  });
});
```

## E2E Testing with Maestro

### Maestro Test Configuration

```yaml
# tests/e2e/maestro/login-flow.yaml
appId: com.musicpracticetracker.mobile
---
- launchApp
- assertVisible: 'Welcome'
- tapOn: 'Get Started'
- assertVisible: 'Login'
- tapOn:
    id: 'email-input'
- inputText: 'user@example.com'
- tapOn:
    id: 'password-input'
- inputText: 'password123'
- tapOn: 'Sign In'
- assertVisible: 'Dashboard'
```

### Complex User Flow

```yaml
# tests/e2e/maestro/practice-session.yaml
appId: com.musicpracticetracker.mobile
---
- launchApp
- tapOn: 'Start Practice'
- assertVisible: 'Select Instrument'
- tapOn: 'Guitar'
- assertVisible: 'Session Timer'
- tapOn: 'Start'
- waitForAnimationToEnd
- tapOn: 'Pause'
- tapOn: 'Add Note'
- inputText: 'Worked on scales'
- tapOn: 'Save'
- tapOn: 'End Session'
- assertVisible: 'Session Summary'
- takeScreenshot: 'session-complete'
```

### Running Maestro Tests

```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Run single test
maestro test tests/e2e/maestro/login-flow.yaml

# Run all tests
maestro test tests/e2e/maestro/

# Run with cloud
maestro cloud tests/e2e/maestro/
```

## Snapshot Testing

```tsx
import renderer from 'react-test-renderer';
import { Card } from '../Card';

describe('Card Snapshots', () => {
  it('should match snapshot', () => {
    const tree = renderer.create(<Card title='Test Card' description='Test description' />).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should match snapshot with image', () => {
    const tree = renderer
      .create(
        <Card title='Test Card' description='Test description' image={{ uri: 'https://example.com/image.jpg' }} />,
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
```

## Platform-Specific Testing

### iOS-Specific Tests

```tsx
import { Platform } from 'react-native';
import { render } from '@testing-library/react-native';
import { IOSComponent } from '../IOSComponent';

describe('iOS Components', () => {
  beforeEach(() => {
    Platform.OS = 'ios';
  });

  it('should render iOS-specific UI', () => {
    const { getByTestId } = render(<IOSComponent />);
    expect(getByTestId('ios-specific-element')).toBeTruthy();
  });

  it('should use iOS navigation gestures', () => {
    // Test iOS-specific navigation behavior
  });
});
```

### Android-Specific Tests

```tsx
describe('Android Components', () => {
  beforeEach(() => {
    Platform.OS = 'android';
  });

  it('should render Android-specific UI', () => {
    const { getByTestId } = render(<AndroidComponent />);
    expect(getByTestId('android-back-button')).toBeTruthy();
  });

  it('should handle Android back button', () => {
    const handleBack = jest.fn();
    BackHandler.addEventListener('hardwareBackPress', handleBack);

    // Trigger back button
    BackHandler.mockPressBack();

    expect(handleBack).toHaveBeenCalled();
  });
});
```

## Performance Testing

```tsx
import { measurePerformance } from '@shopify/react-native-performance';

describe('Performance Tests', () => {
  it('should render list efficiently', async () => {
    const performance = measurePerformance();

    const { getByTestId } = render(<LargeList data={generateLargeDataset(1000)} />);

    const renderTime = performance.measure('list-render');

    expect(renderTime).toBeLessThan(100); // ms
    expect(getByTestId('list-container')).toBeTruthy();
  });

  it('should not have memory leaks', () => {
    const { unmount } = render(<ComplexComponent />);

    const initialMemory = performance.memory.usedJSHeapSize;

    // Perform operations
    act(() => {
      // Trigger state changes
    });

    unmount();

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const finalMemory = performance.memory.usedJSHeapSize;
    const memoryIncrease = finalMemory - initialMemory;

    expect(memoryIncrease).toBeLessThan(1000000); // 1MB tolerance
  });
});
```

## Mocking Strategies

### Module Mocking

```tsx
// __mocks__/@react-native-async-storage/async-storage.js
export default {
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
};
```

### API Mocking

```tsx
import { setupServer } from 'msw/native';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          { id: '1', name: 'John Doe' },
          { id: '2', name: 'Jane Smith' },
        ],
      }),
    );
  }),

  rest.post('/api/login', (req, res, ctx) => {
    const { email, password } = req.body as any;

    if (email === 'valid@example.com' && password === 'password') {
      return res(ctx.status(200), ctx.json({ token: 'mock-token' }));
    }

    return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/*.stories.tsx', '!src/**/index.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.{ts,tsx}', '<rootDir>/tests/**/*.test.{ts,tsx}'],
};
```

### Test Setup

```typescript
// tests/setup.ts
import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock native modules
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock expo modules
jest.mock('expo-font');
jest.mock('expo-asset');

// Global test utilities
global.testUtils = {
  waitForAsync: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
};
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Mobile Tests

on:
  push:
    paths:
      - 'packages/apps/mobile/**'
  pull_request:
    paths:
      - 'packages/apps/mobile/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH

      - name: Run E2E tests
        run: maestro test tests/e2e/maestro/
```

## Best Practices

### Do's

- ✅ Write tests alongside code development
- ✅ Test user interactions, not implementation
- ✅ Mock external dependencies
- ✅ Use data-testid for E2E test stability
- ✅ Test error scenarios
- ✅ Test on real devices
- ✅ Keep tests simple and focused
- ✅ Use descriptive test names

### Don'ts

- ❌ Test implementation details
- ❌ Write brittle tests dependent on timing
- ❌ Skip platform-specific testing
- ❌ Ignore flaky tests
- ❌ Test third-party library internals
- ❌ Use excessive mocking

## Related Documentation

- [Error Handling](./error-handling.md)
- [State Management](./state-management.md)
- [Performance Guidelines](./performance.md)
