# Mobile App Error Handling

## Overview

This document outlines the error handling strategy for the React Native/Expo mobile application, including error boundaries, API error handling, crash reporting, and user feedback.

## Error Boundaries

### Global Error Boundary

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Button } from 'react-native';
import * as Sentry from 'sentry-expo';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Report to Sentry
    Sentry.Native.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <View style={styles.container}>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>{this.state.error?.message || 'An unexpected error occurred'}</Text>
            <Button title='Try Again' onPress={this.handleReset} />
          </View>
        )
      );
    }

    return this.props.children;
  }
}
```

### Screen-Level Error Boundaries

```tsx
export function withErrorBoundary<P extends object>(Component: React.ComponentType<P>, fallback?: ReactNode) {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
}

// Usage
export default withErrorBoundary(UserScreen, <ErrorFallback />);
```

## API Error Handling

### HTTP Client Configuration

```typescript
import axios, { AxiosError, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response) {
          // Server responded with error
          switch (error.response.status) {
            case 401:
              await this.handleUnauthorized();
              break;
            case 403:
              this.handleForbidden();
              break;
            case 404:
              throw new NotFoundError(error.message);
            case 429:
              await this.handleRateLimit(error);
              break;
            case 500:
            case 502:
            case 503:
              throw new ServerError('Server is temporarily unavailable');
            default:
              throw new ApiError(error.response.data?.message || 'Request failed', error.response.status);
          }
        } else if (error.request) {
          // No response received
          throw new NetworkError('No internet connection');
        } else {
          // Request setup error
          throw new RequestError(error.message);
        }
      },
    );
  }

  private async handleUnauthorized() {
    await AsyncStorage.removeItem('authToken');
    // Navigate to login screen
    // EventEmitter.emit('auth:logout');
  }

  private handleForbidden() {
    throw new ForbiddenError('You do not have permission to access this resource');
  }

  private async handleRateLimit(error: AxiosError) {
    const retryAfter = error.response?.headers['retry-after'];
    if (retryAfter) {
      await new Promise((resolve) => setTimeout(resolve, parseInt(retryAfter) * 1000));
      return this.client.request(error.config!);
    }
    throw new RateLimitError('Too many requests. Please try again later.');
  }
}
```

### Custom Error Classes

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ApiError extends AppError {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network error occurred') {
    super(message, 'NETWORK_ERROR');
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND');
  }
}

export class ServerError extends AppError {
  constructor(message = 'Server error occurred') {
    super(message, 'SERVER_ERROR');
  }
}
```

## Form Validation Errors

### Form Error Handling

```tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

export function LoginForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await loginUser(data);
    } catch (error) {
      if (error instanceof ValidationError && error.errors) {
        // Set field-specific errors
        Object.entries(error.errors).forEach(([field, messages]) => {
          setError(field as any, {
            type: 'manual',
            message: messages[0],
          });
        });
      } else {
        // Set general form error
        setError('root', {
          type: 'manual',
          message: error.message,
        });
      }
    }
  };

  return (
    <View>
      {errors.root && <Text style={styles.errorText}>{errors.root.message}</Text>}
      {/* Form fields */}
    </View>
  );
}
```

## Crash Reporting

### Sentry Integration

```typescript
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: false,
  debug: __DEV__,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: __DEV__ ? 1.0 : 0.1,
  beforeSend(event, hint) {
    // Filter out sensitive information
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    return event;
  },
});

// Capture custom errors
export function logError(error: Error, context?: Record<string, any>) {
  console.error(error);

  if (!__DEV__) {
    Sentry.Native.captureException(error, {
      extra: context,
    });
  }
}

// Capture breadcrumbs
export function logBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.Native.addBreadcrumb({
    message,
    level: 'info',
    data,
  });
}
```

## User Feedback

### Error Toast Component

```tsx
import Toast from 'react-native-toast-message';

export const ErrorToast = {
  show(message: string, description?: string) {
    Toast.show({
      type: 'error',
      text1: message,
      text2: description,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
    });
  },

  showNetworkError() {
    this.show('Connection Error', 'Please check your internet connection and try again.');
  },

  showServerError() {
    this.show('Server Error', 'Something went wrong on our end. Please try again later.');
  },

  showValidationError(errors: string[]) {
    this.show('Validation Error', errors.join('\n'));
  },
};
```

### Retry Mechanism

```tsx
import { useState, useCallback } from 'react';

export function useRetry<T>(asyncFunction: () => Promise<T>, maxRetries = 3, delay = 1000) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const executeWithRetry = useCallback(async (): Promise<T> => {
    try {
      return await asyncFunction();
    } catch (error) {
      if (retryCount < maxRetries) {
        setIsRetrying(true);
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, retryCount)));
        setRetryCount((prev) => prev + 1);
        return executeWithRetry();
      }
      throw error;
    } finally {
      setIsRetrying(false);
    }
  }, [asyncFunction, retryCount, maxRetries, delay]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return { executeWithRetry, retryCount, isRetrying, reset };
}
```

## Offline Error Handling

### Network State Management

```tsx
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useNetworkState() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
    });

    return unsubscribe;
  }, []);

  return { isConnected, isInternetReachable };
}

// Offline indicator component
export function OfflineIndicator() {
  const { isConnected } = useNetworkState();

  if (isConnected === false) {
    return (
      <View style={styles.offlineContainer}>
        <Text style={styles.offlineText}>No Internet Connection</Text>
      </View>
    );
  }

  return null;
}
```

### Offline Queue

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineQueue {
  private queue: QueueItem[] = [];
  private readonly STORAGE_KEY = 'offline_queue';

  async init() {
    const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.queue = JSON.parse(stored);
    }
  }

  async add(item: QueueItem) {
    this.queue.push({
      ...item,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    });
    await this.persist();
  }

  async process() {
    const isOnline = await NetInfo.fetch().then((state) => state.isConnected);

    if (!isOnline || this.queue.length === 0) {
      return;
    }

    const processing = [...this.queue];
    this.queue = [];

    for (const item of processing) {
      try {
        await this.executeRequest(item);
      } catch (error) {
        // Re-add to queue if failed
        this.queue.push(item);
      }
    }

    await this.persist();
  }

  private async executeRequest(item: QueueItem) {
    // Execute the queued request
    const response = await fetch(item.url, {
      method: item.method,
      headers: item.headers,
      body: item.body,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
  }

  private async persist() {
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
  }
}
```

## Testing Error Scenarios

```tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ErrorBoundary } from '../ErrorBoundary';

describe('Error Handling', () => {
  it('should display error boundary fallback', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(getByText(/Something went wrong/)).toBeTruthy();
  });

  it('should handle network errors', async () => {
    // Mock network error
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network request failed'));

    const { getByText } = render(<UserList />);

    await waitFor(() => {
      expect(getByText(/No internet connection/)).toBeTruthy();
    });
  });

  it('should retry failed requests', async () => {
    const mockFetch = jest
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    const { getByText, queryByText } = render(<DataFetcher />);

    // First attempt fails
    await waitFor(() => {
      expect(getByText(/Retrying/)).toBeTruthy();
    });

    // Retry succeeds
    await waitFor(() => {
      expect(queryByText(/Retrying/)).toBeFalsy();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
```

## Best Practices

### Do's

- ✅ Use error boundaries for component isolation
- ✅ Provide user-friendly error messages
- ✅ Log errors for debugging and monitoring
- ✅ Implement retry mechanisms for transient failures
- ✅ Handle offline scenarios gracefully
- ✅ Validate user input before submission
- ✅ Show loading states during async operations
- ✅ Test error scenarios thoroughly

### Don'ts

- ❌ Show technical error details to users
- ❌ Silently swallow errors
- ❌ Retry non-idempotent operations automatically
- ❌ Block the UI during error recovery
- ❌ Log sensitive user information
- ❌ Ignore network state changes

## Related Documentation

- [State Management](./state-management.md)
- [Testing Strategy](./testing-strategy.md)
- [Performance Guidelines](./performance.md)
