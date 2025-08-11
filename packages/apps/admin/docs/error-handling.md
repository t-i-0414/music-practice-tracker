# Error Handling

## Overview

Comprehensive error handling strategy for the Admin Dashboard to ensure graceful degradation and excellent user experience.

## Error Categories

### 1. Network Errors

Errors related to API communication and network connectivity.

```typescript
enum NetworkErrorType {
  TIMEOUT = 'NETWORK_TIMEOUT',
  CONNECTION_LOST = 'CONNECTION_LOST',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}
```

### 2. Validation Errors

Client-side and server-side validation failures.

```typescript
interface ValidationError {
  field: string;
  message: string;
  code: string;
}
```

### 3. Authentication Errors

Auth-related issues requiring user action.

```typescript
enum AuthErrorType {
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  SESSION_TIMEOUT = 'SESSION_TIMEOUT',
}
```

### 4. Application Errors

Unexpected application-level errors.

```typescript
enum AppErrorType {
  RENDER_ERROR = 'RENDER_ERROR',
  SCRIPT_ERROR = 'SCRIPT_ERROR',
  CHUNK_LOAD_ERROR = 'CHUNK_LOAD_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
```

## Error Boundaries

### Global Error Boundary

```typescript
// src/app/error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="error-container">
          <h2>Something went wrong!</h2>
          <button onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  );
}
```

### Component Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## API Error Handling

### Axios Interceptors

```typescript
// src/lib/api-client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await refreshToken();
      return apiClient(originalRequest);
    }

    // Transform error for consistent handling
    return Promise.reject(transformError(error));
  },
);
```

### React Query Error Handling

```typescript
// Global query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      onError: (error) => {
        handleQueryError(error);
      },
    },
    mutations: {
      onError: (error) => {
        handleMutationError(error);
      },
    },
  },
});
```

## Form Error Handling

### Validation with Zod

```typescript
// src/schemas/user.schema.ts
const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
});

// Form component
const {
  formState: { errors },
} = useForm({
  resolver: zodResolver(userSchema),
});
```

### Field-Level Error Display

```typescript
// src/components/FormField.tsx
function FormField({ error, ...props }) {
  return (
    <div className="form-field">
      <input {...props} aria-invalid={!!error} />
      {error && (
        <span role="alert" className="error-message">
          {error.message}
        </span>
      )}
    </div>
  );
}
```

## User Feedback

### Toast Notifications

```typescript
// src/hooks/useToast.ts
const toast = {
  error: (message: string, options?: ToastOptions) => {
    showToast({
      type: 'error',
      message,
      duration: 5000,
      ...options,
    });
  },
  success: (message: string) => {
    /* ... */
  },
  warning: (message: string) => {
    /* ... */
  },
};

// Usage
mutation.mutate(data, {
  onError: (error) => {
    toast.error(getErrorMessage(error));
  },
});
```

### Inline Error Messages

```typescript
// src/components/ErrorMessage.tsx
function ErrorMessage({ error }: { error: Error | null }) {
  if (!error) return null;

  return (
    <div className="error-alert" role="alert">
      <Icon name="error" />
      <p>{error.message}</p>
      {error.details && (
        <details>
          <summary>Details</summary>
          <pre>{JSON.stringify(error.details, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}
```

## Retry Mechanisms

### Exponential Backoff

```typescript
// src/utils/retry.ts
async function retryWithBackoff<T>(fn: () => Promise<T>, maxAttempts = 3, baseDelay = 1000): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error;

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retry attempts reached');
}
```

### User-Initiated Retry

```typescript
// src/components/RetryableError.tsx
function RetryableError({ error, onRetry }) {
  return (
    <div className="error-container">
      <p>Failed to load data: {error.message}</p>
      <button onClick={onRetry}>
        <Icon name="refresh" /> Retry
      </button>
    </div>
  );
}
```

## Logging and Monitoring

### Error Logging Service

```typescript
// src/services/error-logger.ts
class ErrorLogger {
  log(error: Error, context?: Record<string, any>) {
    // Development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error, context);
      return;
    }

    // Production - send to monitoring service
    // Example: Sentry, LogRocket, etc.
    captureException(error, {
      extra: context,
      tags: {
        app: 'admin-dashboard',
      },
    });
  }
}

export const errorLogger = new ErrorLogger();
```

### Performance Monitoring

```typescript
// Track error rates
window.addEventListener('error', (event) => {
  trackError({
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
  });
});

// Track unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  trackError({
    type: 'unhandledRejection',
    reason: event.reason,
  });
});
```

## Fallback Strategies

### Progressive Enhancement

```typescript
// Graceful degradation for missing features
function FeatureComponent() {
  const isSupported = checkFeatureSupport();

  if (!isSupported) {
    return <FallbackComponent />;
  }

  return <FullFeatureComponent />;
}
```

### Offline Support

```typescript
// Service worker for offline fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match('/offline.html');
    }),
  );
});
```

## Error Recovery

### State Recovery

```typescript
// Save state to localStorage on error
const saveStateOnError = (state: AppState) => {
  localStorage.setItem('errorRecoveryState', JSON.stringify(state));
};

// Restore on recovery
const restoreState = () => {
  const saved = localStorage.getItem('errorRecoveryState');
  if (saved) {
    return JSON.parse(saved);
  }
  return null;
};
```

### Session Recovery

```typescript
// Auto-save form data
const useAutoSave = (formData: any, key: string) => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      sessionStorage.setItem(key, JSON.stringify(formData));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData, key]);
};
```

## Testing Error Scenarios

### Unit Tests

```typescript
test('handles network error', async () => {
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res.networkError('Failed to connect');
    })
  );

  render(<UserList />);
  await screen.findByText(/failed to load/i);
});
```

### E2E Tests

```typescript
test('recovers from error state', async ({ page }) => {
  // Simulate error
  await page.route('**/api/users', (route) => route.abort());
  await page.goto('/users');

  // Verify error display
  await expect(page.locator('.error-message')).toBeVisible();

  // Retry
  await page.unroute('**/api/users');
  await page.click('button:has-text("Retry")');

  // Verify recovery
  await expect(page.locator('.user-list')).toBeVisible();
});
```

## Best Practices

1. **Be Specific**: Provide clear, actionable error messages
2. **Be Helpful**: Suggest next steps or alternatives
3. **Be Consistent**: Use standard error formats across the app
4. **Be Secure**: Don't expose sensitive information in errors
5. **Be Accessible**: Ensure error messages are screen-reader friendly
6. **Be Proactive**: Validate early to prevent errors
7. **Be Resilient**: Always provide fallback options
