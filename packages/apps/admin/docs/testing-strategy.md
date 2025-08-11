# Testing Strategy - Admin Dashboard

## Overview

The admin dashboard uses a multi-layered testing approach with Vitest for unit tests, Cypress for integration tests, and Playwright for E2E tests.

## Test Categories

### Unit Tests (Vitest)

- **Location**: `tests/unit/`
- **Scope**: Individual components and utilities
- **Tools**: Vitest, React Testing Library

#### What to Test

- Component rendering
- Props handling
- Event handlers
- Utility functions

#### Example

```typescript
import { render, screen } from '@testing-library/react';
import { UserTable } from '@/components/UserTable';

describe('UserTable', () => {
  it('renders user data correctly', () => {
    const users = [{ id: '1', name: 'John' }];
    render(<UserTable users={users} />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

### Integration Tests (Cypress)

- **Location**: `tests/integration/`
- **Scope**: User flows and API integration
- **Tools**: Cypress, MSW for API mocking

#### What to Test

- Multi-step user flows
- Form submissions
- Navigation
- API interactions

#### Example

```typescript
describe('User Management', () => {
  it('creates a new user', () => {
    cy.visit('/users');
    cy.get('[data-testid="add-user"]').click();
    cy.get('input[name="email"]').type('new@user.com');
    cy.get('button[type="submit"]').click();
    cy.contains('User created successfully');
  });
});
```

### E2E Tests (Playwright)

- **Location**: `tests/e2e/`
- **Scope**: Critical user paths
- **Tools**: Playwright

#### What to Test

- Complete user journeys
- Cross-browser compatibility
- Real API interactions
- Performance metrics

## Component Testing

### Storybook Integration

```typescript
// Button.stories.ts
export default {
  title: 'Components/Button',
  component: Button,
};

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
};
```

### Visual Regression

- Storybook snapshots
- Percy integration (planned)
- Responsive testing

## API Mocking Strategy

### MSW Handlers

```typescript
// tests/msw/handlers.ts
export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json({ users: mockUsers }));
  }),
];
```

### Development Mocking

- MSW in development mode
- Realistic response delays
- Error state testing

## Test Data Management

### Fixtures

```typescript
export const mockUser = {
  publicId: 'test-123',
  email: 'test@example.com',
  name: 'Test User',
  status: 'ACTIVE',
};
```

### Factories

```typescript
export const createMockUser = (overrides = {}) => ({
  ...mockUser,
  ...overrides,
});
```

## Performance Testing

### Metrics to Track

- First Contentful Paint (FCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)
- Bundle size

### Tools

- Lighthouse CI
- Web Vitals monitoring
- Bundle analyzer

## Accessibility Testing

### Automated Checks

- axe-core integration
- ARIA compliance
- Keyboard navigation
- Screen reader testing

### Manual Testing

- Keyboard-only navigation
- Screen reader verification
- Color contrast validation
- Focus management

## CI/CD Integration

### Test Pipeline

1. Type checking
2. Linting
3. Unit tests
4. Build verification
5. Integration tests
6. E2E tests (staging)

### Parallel Execution

```yaml
test:
  parallel:
    - unit
    - integration
    - e2e
```

## Best Practices

### Component Tests

1. Test user behavior, not implementation
2. Use data-testid for reliable selectors
3. Mock at the network level
4. Test error states

### Test Organization

```
tests/
├── unit/
│   ├── components/
│   └── utils/
├── integration/
│   └── pages/
├── e2e/
│   └── flows/
└── msw/
    └── handlers/
```

### Writing Good Tests

1. Descriptive test names
2. Single assertion principle
3. Independent test cases
4. Clean test data

## Debugging

### Debug Commands

```bash
# Run Vitest in UI mode
bun run test:unit -- --ui

# Debug Cypress test
bun run test:integration -- --headed

# Playwright debug mode
bun run test:e2e -- --debug
```

### Common Issues

1. **Flaky tests**: Add proper waits
2. **State pollution**: Reset between tests
3. **Network timing**: Use MSW delays
4. **Component updates**: Wait for re-renders

## Coverage Goals

### Targets

- Unit: 80% coverage
- Integration: Critical paths
- E2E: Happy paths only

### Reports

- Coverage in `coverage/`
- Cypress videos/screenshots
- Playwright traces
