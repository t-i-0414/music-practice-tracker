# ESLint Configs

## Overview

Shared ESLint configuration presets for the Music Practice Tracker monorepo. This package provides consistent linting rules across all applications and libraries.

## Installation

```bash
# From the monorepo root
bun add @music-practice-tracker/eslint-configs --dev
```

## Available Configurations

### Base Configuration

```javascript
// eslint.config.js
import { eslintConfigBase } from '@music-practice-tracker/eslint-configs';

export default eslintConfigBase;
```

### TypeScript Configuration

```javascript
import { eslintConfigTypescript } from '@music-practice-tracker/eslint-configs';

export default eslintConfigTypescript;
```

### React Configuration

```javascript
import { eslintConfigReact } from '@music-practice-tracker/eslint-configs';

export default eslintConfigReact;
```

### React Native Configuration

```javascript
import { eslintConfigReactNative } from '@music-practice-tracker/eslint-configs';

export default eslintConfigReactNative;
```

### Test Configurations

```javascript
// Jest
import { eslintConfigJest } from '@music-practice-tracker/eslint-configs';

// Cypress
import { eslintConfigCypress } from '@music-practice-tracker/eslint-configs';

// Playwright
import { eslintConfigPlaywright } from '@music-practice-tracker/eslint-configs';

// Vitest
import { eslintConfigVitest } from '@music-practice-tracker/eslint-configs';

// Storybook
import { eslintConfigStorybook } from '@music-practice-tracker/eslint-configs';
```

## Configuration Structure

```typescript
// Each configuration exports:
{
  files: string[];           // File patterns to apply rules to
  languageOptions?: {...};   // Parser options
  plugins?: {...};           // ESLint plugins
  rules: {...};             // Rule configurations
  settings?: {...};         // Shared settings
}
```

## Usage Examples

### Backend (NestJS) Configuration

```javascript
// packages/apps/backend/eslint.config.js
import { eslintConfigBase, eslintConfigTypescript } from '@music-practice-tracker/eslint-configs';
import backendPlugin from '@music-practice-tracker/eslint-plugins/backend';

export default [
  eslintConfigBase,
  eslintConfigTypescript,
  {
    plugins: {
      '@music-practice-tracker/backend': backendPlugin,
    },
    rules: {
      '@music-practice-tracker/backend/prisma-repository-only-access': 'error',
      '@music-practice-tracker/backend/no-internal-id': 'error',
    },
  },
];
```

### Frontend (Next.js) Configuration

```javascript
// packages/apps/admin/eslint.config.js
import { eslintConfigBase, eslintConfigTypescript, eslintConfigReact } from '@music-practice-tracker/eslint-configs';

export default [
  eslintConfigBase,
  eslintConfigTypescript,
  eslintConfigReact,
  {
    rules: {
      'react/react-in-jsx-scope': 'off', // Next.js doesn't require React import
    },
  },
];
```

### Mobile (React Native) Configuration

```javascript
// packages/apps/mobile/eslint.config.js
import {
  eslintConfigBase,
  eslintConfigTypescript,
  eslintConfigReactNative,
} from '@music-practice-tracker/eslint-configs';

export default [eslintConfigBase, eslintConfigTypescript, eslintConfigReactNative];
```

## Shared Patterns

### File Patterns

```javascript
import { sharedIgnores, sharedTestFilePatterns } from '@music-practice-tracker/eslint-configs';

// sharedIgnores includes:
// - '**/node_modules/**'
// - '**/dist/**'
// - '**/build/**'
// - '**/.next/**'
// - '**/coverage/**'
// - '**/*.config.js'

// sharedTestFilePatterns includes:
// - '**/*.test.{ts,tsx,js,jsx}'
// - '**/*.spec.{ts,tsx,js,jsx}'
// - '**/__tests__/**'
// - '**/tests/**'
```

## Rule Philosophy

### Error Prevention

- Catch common mistakes early
- Enforce consistent code style
- Prevent security vulnerabilities
- Ensure accessibility compliance

### Code Quality

- Enforce TypeScript strict mode
- Require explicit return types
- Prevent unused variables
- Enforce consistent naming

### Performance

- Prevent unnecessary re-renders (React)
- Enforce dependency arrays (React Hooks)
- Prevent memory leaks

## Customization

### Extending Configurations

```javascript
export default [
  eslintConfigBase,
  {
    // Override specific rules
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
```

### Adding Custom Rules

```javascript
export default [
  eslintConfigBase,
  {
    plugins: {
      custom: customPlugin,
    },
    rules: {
      'custom/my-rule': 'error',
    },
  },
];
```

## Development

### Building

```bash
cd packages/libs/eslint-configs
bun run build
```

### Testing

```bash
bun run test
```

### Adding New Configurations

1. Create new configuration file in `src/`
2. Export from `src/index.ts`
3. Add tests in `tests/`
4. Update this README

## Dependencies

- ESLint 9.x
- TypeScript ESLint 8.x
- ESLint React Plugin
- ESLint React Native Plugin
- Various testing framework plugins

## Migration Guide

### From ESLint 8.x

```javascript
// Old (.eslintrc.js)
module.exports = {
  extends: ['@music-practice-tracker/eslint-config'],
  rules: {...},
};

// New (eslint.config.js)
import { eslintConfigBase } from '@music-practice-tracker/eslint-configs';

export default [
  eslintConfigBase,
  {
    rules: {...},
  },
];
```

## Troubleshooting

### Common Issues

#### Issue: Configuration not found

**Solution:** Ensure package is built (`bun run build`)

#### Issue: Rule conflicts

**Solution:** Check rule precedence in flat config array

#### Issue: Parser errors

**Solution:** Verify TypeScript version compatibility

## Related Documentation

- [ESLint Plugins](../eslint-plugins/README.md)
- [TypeScript Config](../tsconfig-base/README.md)
- [Code Quality Standards](/docs/code-quality.md)
