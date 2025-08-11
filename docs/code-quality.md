# Code Quality Standards

## Overview

This document defines the code quality standards and enforcement mechanisms for the Music Practice Tracker project. All code contributions must adhere to these standards before being merged.

## Quality Gates

### Required Checks Before Committing

All code changes **MUST** pass the following commands without errors:

```bash
# 1. Format code automatically
bun run format:fix

# 2. Check spelling
bun run cspell

# 3. Lint code
bun run lint:es:check

# 4. Type checking
bun run type:check

# 5. Run tests (if applicable to changes)
bun run test
```

### Quick Quality Check

Run all checks at once:

```bash
# Run all quality checks
npm run ci:temp
```

## Code Standards

### TypeScript

- **Strict Mode**: All TypeScript files use strict mode
- **No Any**: Avoid `any` type; use `unknown` or proper types
- **Explicit Return Types**: Functions should have explicit return types
- **Interface over Type**: Prefer interfaces for object shapes

### Naming Conventions

#### Files

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Services**: kebab-case with suffix (e.g., `user.query.service.ts`)
- **DTOs**: kebab-case with suffix (e.g., `user.input.dto.ts`)
- **Tests**: Same as source with `.spec.ts` or `.test.ts`
- **Documentation**: kebab-case (e.g., `testing-strategy.md`)

#### Code

- **Classes**: PascalCase (e.g., `UserService`)
- **Interfaces**: PascalCase with optional 'I' prefix
- **Functions/Methods**: camelCase (e.g., `findUserById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Variables**: camelCase

### Import Organization

```typescript
// 1. External imports
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// 2. Internal module imports
import { UserService } from '@/services/user.service';

// 3. Relative imports
import { CreateUserDto } from './dto/create-user.dto';

// 4. Type imports
import type { User } from './types';
```

### Comments

- **Minimal Comments**: Code should be self-documenting
- **When Required**: Add type prefix (e.g., `// NOTE:`, `// TODO:`, `// FIXME:`)
- **JSDoc**: For public APIs and complex functions
- **No Commented Code**: Remove instead of commenting out

## Testing Standards

### Coverage Requirements

- **Global**: Minimum 80% coverage
- **New Code**: 100% coverage for new features
- **Critical Paths**: 100% E2E coverage

### Test Organization

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do expected behavior when condition', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Test Naming

- Descriptive: "should create user when valid data provided"
- Not: "test 1" or "works"

## Documentation Standards

### Code Documentation

#### Required Documentation

1. **Public APIs**: All public methods/functions need JSDoc
2. **Complex Logic**: Add inline comments for non-obvious code
3. **Business Rules**: Document why, not what
4. **Breaking Changes**: Clear migration notes

#### JSDoc Format

```typescript
/**
 * Finds a user by their public ID or throws an exception.
 *
 * @param publicId - The UUID of the user
 * @returns The user entity
 * @throws {NotFoundException} When user is not found
 * @example
 * const user = await findUserByIdOrFail('123e4567-e89b-12d3-a456-426614174000');
 */
```

### Component Documentation

Each component must have a collocated README.md with:

- Purpose and usage
- Props interface
- States and behaviors
- Testing requirements
- Performance considerations

## Git Standards

### Commit Messages

Follow Conventional Commits:

```bash
type(scope): description

# Types: feat, fix, docs, style, refactor, test, chore
# Scope: backend, admin, mobile, or specific module

# Examples:
feat(backend): add practice session endpoints
fix(mobile): correct timer display on pause
docs(admin): update testing strategy
```

### Branch Naming

```bash
feature/add-practice-tracking
fix/timer-pause-bug
refactor/user-service-optimization
docs/update-architecture
```

### Pull Request Standards

#### PR Title

Same format as commit messages

#### PR Description

Must include:

- **What**: Changes made
- **Why**: Reason for changes
- **How**: Implementation approach
- **Testing**: How it was tested
- **Screenshots**: For UI changes
- **Breaking Changes**: If any

#### PR Checklist

```markdown
- [ ] Code passes all quality checks
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.logs or debugging code
- [ ] Reviewed for security issues
```

## Security Standards

### Never Commit

- Secrets, keys, tokens
- `.env` files with real values
- Personal information
- Debug/test data with real user info

### Input Validation

- Always validate at DTO level
- Sanitize user inputs
- Use parameterized queries
- Validate file uploads

### Authentication

- Never store plain passwords
- Use secure session management
- Implement proper CORS policies
- Rate limit API endpoints

## Performance Standards

### Frontend

- **Bundle Size**: Monitor with bundle analyzer
- **Images**: Optimize and use appropriate formats
- **Code Splitting**: Lazy load routes and components
- **Memoization**: Use React.memo, useMemo appropriately

### Backend

- **Query Optimization**: Use indexes, avoid N+1
- **Pagination**: Always paginate list endpoints
- **Caching**: Implement where appropriate
- **Connection Pooling**: Proper database connections

## Accessibility Standards

### Required

- **Semantic HTML**: Use proper elements
- **ARIA Labels**: For interactive elements
- **Keyboard Navigation**: Full support
- **Color Contrast**: WCAG AA minimum
- **Focus Management**: Visible focus indicators

### Testing

- Run axe-core in development
- Manual keyboard navigation testing
- Screen reader testing for critical paths

## Monitoring & Logging

### Logging Standards

```typescript
// Use structured logging
logger.info('User created', {
  userId: user.publicId,
  email: user.email,
});

// Not
console.log('User created: ' + user.email);
```

### Error Handling

```typescript
try {
  // operation
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    context: {
      /* relevant data */
    },
  });

  // Re-throw or handle appropriately
  throw new CustomException('User-friendly message');
}
```

## Pre-commit Hooks

Lefthook runs automatically on commit:

1. Spell checking (CSpell)
2. Code formatting (Prettier)
3. Linting (ESLint)
4. Secret detection (Secretlint)
5. Commit message validation (Commitlint)

## CI/CD Requirements

### GitHub Actions

All PRs must pass:

1. Type checking
2. Linting
3. Unit tests
4. Integration tests
5. E2E tests (for critical paths)
6. Coverage checks

### Deployment Checks

- No failing tests
- No security vulnerabilities
- Performance benchmarks met
- Documentation updated

## Enforcement

### Automated

- Pre-commit hooks via Lefthook
- CI/CD pipeline checks
- Custom ESLint rules
- Automated code review tools

### Manual Review

- Code review by peers
- Architecture review for significant changes
- Security review for sensitive changes

## Tools Configuration

### ESLint

Custom rules enforce:

- Repository pattern
- Naming conventions
- No internal ID exposure
- Domain boundaries

### Prettier

Consistent formatting:

- 2 spaces indentation
- Single quotes
- No semicolons (configurable)
- Trailing commas

### TypeScript

Strict configuration:

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUnusedLocals: true`

## Continuous Improvement

### Regular Reviews

- Monthly code quality metrics review
- Quarterly standards update
- Annual tool evaluation

### Metrics to Track

- Code coverage trends
- Build time
- Bundle size
- Type coverage
- Lint errors/warnings

## Quick Reference

### Before Committing

```bash
# Quick check
bun run format:fix && bun run cspell && bun run lint:es:check && bun run type:check

# Or use the combined command
npm run ci:temp
```

### Common Issues

| Issue           | Solution                       |
| --------------- | ------------------------------ |
| Spelling errors | Add to `.cspell.json` if valid |
| Lint errors     | Run `bun run lint:es:fix`      |
| Type errors     | Fix types, don't use `any`     |
| Format issues   | Run `bun run format:fix`       |

## Resources

- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [OWASP Security Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
