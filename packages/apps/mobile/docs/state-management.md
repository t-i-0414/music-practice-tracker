# State Management Strategy - Mobile App

## Overview

The mobile app uses React Context and local component state for state management, with plans to integrate React Query for server state.

## State Categories

### Local UI State

- Component-level state using `useState`
- Form inputs, toggles, modals
- No global synchronization needed

### Global App State

- Theme preferences (light/dark mode)
- User session information
- App-wide settings

### Server State

- API data fetching (planned: React Query)
- Caching strategy
- Optimistic updates

## Current Implementation

### Theme Context

```typescript
const ThemeContext = createContext<{
  colorScheme: 'light' | 'dark';
  toggleColorScheme: () => void;
}>(...);
```

### User Context (Planned)

```typescript
const UserContext = createContext<{
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials) => Promise<void>;
  logout: () => void;
}>(...);
```

## Data Flow Patterns

### Practice Session State

1. Local state for timer and UI
2. Periodic sync to backend
3. Offline queue for reliability
4. Optimistic updates for UX

## Performance Optimizations

- Context splitting to minimize re-renders
- React.memo for expensive components
- useMemo/useCallback where appropriate

## Testing Strategy

- Mock contexts in tests
- Test state transitions
- Verify side effects

## Future Improvements

- React Query for server state
- Redux Toolkit if complexity grows
- State persistence with AsyncStorage
