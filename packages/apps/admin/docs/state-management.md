# State Management

## Overview

The Admin Dashboard uses a combination of state management strategies optimized for different types of data and use cases.

## State Categories

### 1. Server State

Managed by **React Query** (TanStack Query) for all API data.

```typescript
// Example: User data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['users', filters],
  queryFn: () => fetchUsers(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

**Benefits:**

- Automatic caching and invalidation
- Background refetching
- Optimistic updates
- Request deduplication

### 2. Client State

#### Local Component State

For UI-specific state that doesn't need to be shared.

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('overview');
```

#### Context API

For shared state across components.

```typescript
// Theme Context
const ThemeContext = createContext<ThemeContextType>();

// Auth Context
const AuthContext = createContext<AuthContextType>();
```

### 3. Form State

Managed by **React Hook Form** for complex forms.

```typescript
const { register, handleSubmit, formState } = useForm({
  defaultValues,
  resolver: zodResolver(schema),
});
```

## Data Flow Patterns

### Query and Mutation Pattern

```typescript
// Query for reading
const usersQuery = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});

// Mutation for writing
const createUserMutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries(['users']);
  },
});
```

### Optimistic Updates

```typescript
const updateUserMutation = useMutation({
  mutationFn: updateUser,
  onMutate: async (newUser) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['user', newUser.id]);

    // Snapshot previous value
    const previousUser = queryClient.getQueryData(['user', newUser.id]);

    // Optimistically update
    queryClient.setQueryData(['user', newUser.id], newUser);

    // Return context with snapshot
    return { previousUser };
  },
  onError: (err, newUser, context) => {
    // Rollback on error
    queryClient.setQueryData(['user', newUser.id], context.previousUser);
  },
});
```

## State Architecture

### Directory Structure

```
src/
├── contexts/           # Global contexts
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── NotificationContext.tsx
├── hooks/             # Custom hooks
│   ├── queries/       # React Query hooks
│   │   ├── useUsers.ts
│   │   └── usePractices.ts
│   └── state/         # State management hooks
│       ├── useLocalStorage.ts
│       └── useDebounce.ts
└── stores/            # Zustand stores (if needed)
    └── uiStore.ts
```

## Caching Strategy

### React Query Cache Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### Cache Invalidation Rules

1. **On Mutation Success**: Invalidate related queries
2. **On Focus**: Refetch stale data when window regains focus
3. **On Reconnect**: Refetch when network connection restored
4. **Manual**: User-triggered refresh actions

## Performance Optimization

### Query Keys Strategy

```typescript
// Hierarchical query keys for granular invalidation
const queryKeys = {
  all: ['users'],
  lists: () => [...queryKeys.all, 'list'],
  list: (filters) => [...queryKeys.lists(), filters],
  details: () => [...queryKeys.all, 'detail'],
  detail: (id) => [...queryKeys.details(), id],
};
```

### Selective Subscriptions

```typescript
// Subscribe only to needed data
const user = useQuery({
  queryKey: ['user', id],
  queryFn: fetchUser,
  select: (data) => ({
    id: data.id,
    name: data.name,
    // Only select needed fields
  }),
});
```

## State Persistence

### Local Storage Integration

```typescript
// Persist user preferences
const usePersistedState = (key: string, defaultValue: any) => {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
```

### Session Storage for Temporary Data

```typescript
// Store temporary filter states
sessionStorage.setItem('adminFilters', JSON.stringify(filters));
```

## Error State Management

### Global Error Boundary

```typescript
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
}
```

### Query Error Handling

```typescript
const { data, error, isError } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  onError: (error) => {
    toast.error(`Failed to load users: ${error.message}`);
  },
});
```

## Testing State Management

### Mock Query Client

```typescript
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
```

### Testing Hooks

```typescript
const { result } = renderHook(() => useUsers(), {
  wrapper: ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  ),
});
```

## Best Practices

1. **Colocate State**: Keep state as close to where it's used as possible
2. **Normalize Data**: Use consistent data shapes across the app
3. **Avoid Prop Drilling**: Use Context or composition for deeply nested data
4. **Memoize Expensive Operations**: Use useMemo and useCallback appropriately
5. **Handle Loading States**: Always provide feedback during async operations
6. **Error Recovery**: Implement retry mechanisms and fallback UI
7. **Type Safety**: Use TypeScript for all state definitions

## Migration Notes

When adding new state management needs:

1. Evaluate if React Query can handle it (for server state)
2. Consider Context API for cross-cutting concerns
3. Use local state for component-specific needs
4. Document any new patterns in this file
