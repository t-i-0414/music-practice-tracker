# ESLint Plugins

## Overview

Custom ESLint rules for enforcing architectural patterns and best practices in the Music Practice Tracker monorepo. These rules ensure consistent code quality and maintain architectural boundaries.

## Installation

```bash
# From the monorepo root
npm install @music-practice-tracker/eslint-plugins --save-dev
```

## Available Rules

### Backend Rules

Rules for enforcing backend architectural patterns:

#### `prisma-repository-only-access`

Ensures Prisma client is only accessed within repository service files.

```javascript
// ❌ Bad: Direct Prisma access in service
class UserService {
  async getUser() {
    return this.prisma.user.findUnique({ where: { id: 1 } });
  }
}

// ✅ Good: Access through repository
class UserService {
  constructor(private repository: UserRepositoryService) {}

  async getUser() {
    return this.repository.findUniqueUser({ where: { id: 1 } });
  }
}
```

#### `no-internal-id`

Prevents exposure of internal database IDs in DTOs and responses.

```typescript
// ❌ Bad: Exposing internal ID
class UserResponseDto {
  @Expose() id: number; // Internal ID exposed
  @Expose() publicId: string;
}

// ✅ Good: Only public ID exposed
class UserResponseDto {
  @Exclude() id: number; // Internal ID excluded
  @Expose() publicId: string;
}
```

#### `prisma-naming-convention`

Enforces consistent naming patterns for Prisma repository methods.

```typescript
// ✅ Valid method names:
findUniqueUser();
findManyUsers();
createUser();
updateUser();
deleteUser();
hardDeleteUser();
restoreUser();

// ❌ Invalid method names:
getUser(); // Should be findUniqueUser
saveUser(); // Should be createUser or updateUser
removeUser(); // Should be deleteUser
```

#### `repository-model-access-restriction`

Ensures repositories only access their designated Prisma models.

```typescript
// ❌ Bad: UserRepository accessing Post model
class UserRepositoryService {
  async getUserPosts() {
    return this.prisma.post.findMany(); // Error: accessing wrong model
  }
}

// ✅ Good: UserRepository only accesses User model
class UserRepositoryService {
  async findUserWithPosts() {
    return this.prisma.user.findUnique({
      include: { posts: true }, // OK: through relationship
    });
  }
}
```

## Usage

### ESLint Configuration

```javascript
// eslint.config.js
import backendPlugin from '@music-practice-tracker/eslint-plugins/backend';

export default [
  {
    plugins: {
      '@music-practice-tracker/backend': backendPlugin,
    },
    rules: {
      '@music-practice-tracker/backend/prisma-repository-only-access': 'error',
      '@music-practice-tracker/backend/no-internal-id': 'error',
      '@music-practice-tracker/backend/prisma-naming-convention': 'error',
      '@music-practice-tracker/backend/repository-model-access-restriction': 'error',
    },
  },
];
```

### Rule Configuration

Each rule can be configured with different severity levels:

```javascript
{
  rules: {
    // Error - will fail the build
    '@music-practice-tracker/backend/prisma-repository-only-access': 'error',

    // Warning - will show warning but not fail
    '@music-practice-tracker/backend/no-internal-id': 'warn',

    // Off - disable the rule
    '@music-practice-tracker/backend/prisma-naming-convention': 'off',
  },
}
```

## Rule Details

### Architecture Enforcement

These rules enforce Domain-Driven Design principles:

1. **Repository Pattern**: Database access only through repositories
2. **ID Obfuscation**: Never expose internal IDs
3. **Naming Consistency**: Predictable method names
4. **Bounded Contexts**: Repositories stay within their domain

### Error Messages

Each rule provides helpful error messages:

```
Error: Prisma client should only be accessed in repository service files
  File: user.service.ts
  Suggestion: Move database access to UserRepositoryService

Error: Internal ID field should not be exposed in DTOs
  Field: id
  Suggestion: Use @Exclude() decorator or remove the field

Error: Repository method name doesn't follow naming convention
  Method: getUser
  Suggestion: Rename to findUniqueUser or findManyUsers
```

## Development

### Creating New Rules

1. Create rule file in `src/plugin-backend/`:

```typescript
// src/plugin-backend/my-new-rule.ts
import { Rule } from 'eslint';

export const myNewRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Description of what the rule does',
    },
    messages: {
      errorMessage: 'Helpful error message',
    },
    schema: [],
  },
  create(context) {
    return {
      // AST visitor methods
      CallExpression(node) {
        // Rule logic
        if (/* violation condition */) {
          context.report({
            node,
            messageId: 'errorMessage',
          });
        }
      },
    };
  },
};
```

1. Export from plugin index:

```typescript
// src/plugin-backend/index.ts
import { myNewRule } from './my-new-rule';

export default {
  rules: {
    'my-new-rule': myNewRule,
  },
};
```

1. Add tests:

```typescript
// tests/plugin-backend/my-new-rule.spec.ts
import { RuleTester } from 'eslint';
import { myNewRule } from '../../src/plugin-backend/my-new-rule';

const ruleTester = new RuleTester();

ruleTester.run('my-new-rule', myNewRule, {
  valid: [
    // Valid code examples
    'validCode()',
  ],
  invalid: [
    {
      code: 'invalidCode()',
      errors: [{ messageId: 'errorMessage' }],
    },
  ],
});
```

### Testing

```bash
cd packages/libs/eslint-plugins
npm run test
npm run test:watch
```

### Building

```bash
npm run build
```

## Utilities

### Prisma Helpers

Helper functions for Prisma-related rules:

```typescript
import { isPrismaClientAccess, isRepositoryFile } from './utils/prisma-helpers';

// Check if node is accessing Prisma client
if (isPrismaClientAccess(node)) {
  // ...
}

// Check if current file is a repository
if (!isRepositoryFile(context.filename)) {
  // Report error
}
```

## Best Practices

### Rule Design

1. **Clear Error Messages**: Provide actionable feedback
2. **Performance**: Avoid expensive operations in hot paths
3. **False Positives**: Minimize incorrect detections
4. **Fixable**: Provide auto-fix when possible

### Testing

1. **Comprehensive Cases**: Test edge cases
2. **Valid Examples**: Include plenty of valid code
3. **Error Messages**: Verify correct messages
4. **Performance**: Test with large files

## Troubleshooting

### Common Issues

#### Issue: Rule not triggering

**Solution:** Check file patterns and rule configuration

#### Issue: False positives

**Solution:** Refine AST selectors and conditions

#### Issue: Performance impact

**Solution:** Optimize visitor methods, cache results

## Future Rules

Planned rules for future implementation:

- `enforce-dto-validation`: Ensure all DTOs have validation
- `require-error-handling`: Enforce try-catch in async operations
- `circular-dependency-check`: Detect circular dependencies
- `enforce-test-coverage`: Require tests for public methods

## Related Documentation

- [ESLint Configs](../eslint-configs/README.md)
- [Backend Architecture](/packages/apps/backend/README.md)
- [Code Quality Standards](/docs/code-quality.md)
