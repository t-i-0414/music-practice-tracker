# Testing Strategy - Backend API

## Overview

The backend follows a comprehensive testing pyramid with unit, integration, and E2E tests, maintaining minimum 80% code coverage.

## Test Categories

### Unit Tests (70%)

- **Location**: `tests/unit/`
- **Scope**: Individual services in isolation
- **Mocking**: All dependencies mocked
- **Tools**: Jest, jest-mock-extended

#### What to Test

- Service business logic
- DTO validation
- Utility functions
- Error handling

#### Example Structure

```typescript
describe('UserQueryService', () => {
  let service: UserQueryService;
  let mockRepository: MockProxy<UserRepositoryService>;

  beforeEach(() => {
    mockRepository = createMockUserRepositoryService();
    service = new UserQueryService(mockRepository);
  });

  it('should find user by ID or fail', async () => {
    // Test implementation
  });
});
```

### Integration Tests (20%)

- **Location**: `tests/integration/`
- **Scope**: Service interactions with real database
- **Database**: Test database on port 15433
- **Tools**: IntegrationTestHelper, transactions

#### What to Test

- Repository operations
- Service orchestration
- Database constraints
- Transaction handling

#### Test Isolation

```typescript
const helper = new IntegrationTestHelper();
await helper.setup([UserModule]);
// Run tests in transaction
await helper.teardown();
```

### E2E Tests (10%)

- **Location**: `tests/e2e/`
- **Scope**: Full API request/response cycle
- **Tools**: Supertest, real database

#### What to Test

- API endpoints
- Authentication/authorization
- Request validation
- Response format

## Test Data Management

### Factories

```typescript
export const createTestUser = (overrides?: Partial<User>): User => ({
  id: 1,
  publicId: 'test-uuid',
  email: 'test@example.com',
  name: 'Test User',
  ...overrides,
});
```

### Database Seeding

- Use factories for consistent test data
- Clean database between tests
- Transaction rollback for isolation

## Mocking Strategy

### Repository Mocks

```typescript
export const createMockUserRepositoryService = (): MockProxy<UserRepositoryService> => {
  const mock = mock<UserRepositoryService>();
  // Set default behaviors
  return mock;
};
```

### External Service Mocks

- Mock external APIs
- Stub time-dependent functions
- Control async behavior

## Coverage Requirements

### Minimum Thresholds

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### Coverage Reports

- HTML report: `coverage/index.html`
- CI integration with coverage checks
- Pre-commit hooks for coverage

## Best Practices

### Test Organization

1. One test file per source file
2. Mirror source directory structure
3. Group related tests with describe blocks
4. Use descriptive test names

### Test Quality

1. Test behavior, not implementation
2. Avoid testing framework code
3. Keep tests focused and isolated
4. Use AAA pattern (Arrange, Act, Assert)

### Performance

1. Run unit tests in parallel
2. Use test database transactions
3. Mock expensive operations
4. Optimize test data creation

## CI/CD Integration

### Test Execution Order

1. Linting and type checking
2. Unit tests (fast feedback)
3. Integration tests
4. E2E tests
5. Coverage report

### Failure Handling

- Fail fast on critical tests
- Detailed error reporting
- Test result artifacts
- Retry flaky tests (with limits)

## Common Test Scenarios

### Testing Soft Delete

```typescript
it('should soft delete user', async () => {
  await service.deleteUser({ publicId });
  const user = await service.findDeletedUser({ publicId });
  expect(user.deletedAt).toBeDefined();
});
```

### Testing OrFail Pattern

```typescript
it('should throw NotFoundException', async () => {
  await expect(service.findUserByIdOrFail({ publicId: 'invalid' })).rejects.toThrow(NotFoundException);
});
```

### Testing Facades

```typescript
it('admin facade should access deleted records', async () => {
  const users = await adminFacade.findAllUsers({ includeDeleted: true });
  expect(users).toContainEqual(expect.objectContaining({ deletedAt: expect.any(Date) }));
});
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure test DB is on 15433
2. **Transaction locks**: Properly teardown tests
3. **Timing issues**: Use proper async/await
4. **Mock leaks**: Reset mocks in afterEach

### Debug Commands

```bash
# Run specific test file
bunx jest user.query.service.spec.ts

# Run with coverage
npm run test:cov

# Debug mode
npm run test:debug

# Watch mode
npm run test:watch
```
