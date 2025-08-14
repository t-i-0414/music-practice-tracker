# Mobile App

React Native + Expo mobile app for Music Practice Tracker.

## Quick Start

```bash
# Install dependencies
bun install

# Start development
bun run start:dev        # All platforms
bun run start:dev:ios    # iOS simulator
bun run start:dev:android # Android emulator
bun run start:dev:web    # Web browser (http://localhost:8081)
```

## Tech Stack

- **Framework**: React Native 0.79 + Expo 53
- **Navigation**: Expo Router (file-based)
- **Styling**: StyleSheet + Theme system
- **Testing**: Jest + React Native Testing Library
- **Platforms**: iOS, Android, Web

## Project Structure

```
src/
├── app/                # Expo Router pages
│   ├── (tabs)/         # Tab navigation
│   │   ├── index.tsx   # Home tab
│   │   └── explore.tsx # Explore tab
│   ├── _layout.tsx     # Root layout
│   └── +not-found.tsx  # 404 page
├── components/         # Reusable components
├── constants/          # App constants
├── hooks/              # Custom hooks
└── assets/            # Images, fonts, etc.
```

## Commands

### Development

```bash
bun run start:dev       # Start Expo Go
bun run start:dev:ios   # iOS simulator
bun run start:dev:android # Android emulator
bun run start:dev:web   # Web browser
```

### Building

```bash
bun run build:ios       # iOS build
bun run build:android   # Android build
bun run build:web       # Web build
```

### Testing

```bash
bun run test            # Run Jest tests
bun run test:watch      # Watch mode
bun run test:e2e        # Maestro E2E tests
```

## Key Patterns

- **Platform-specific code**: Use `.ios.tsx` and `.android.tsx` extensions
- **Theme hooks**: `useThemeColor()` for consistent theming
- **Gesture handling**: React Native Gesture Handler
- **Animations**: React Native Reanimated
- **Navigation**: File-based routing with Expo Router

## Environment Variables

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Development Tools

- **Expo Go**: Development client for testing
- **React DevTools**: Component debugging
- **Flipper**: Advanced debugging (optional)

## Platform Guidelines

### iOS

- Follow Human Interface Guidelines
- Test on multiple device sizes
- Handle safe areas properly

### Android

- Follow Material Design
- Test on different API levels
- Handle back button navigation

### Web

- Ensure responsive design
- Test keyboard navigation
- Optimize bundle size
