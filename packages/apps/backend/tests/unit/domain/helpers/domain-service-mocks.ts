import { createMockQueryService, createMockRepository } from './mock-service.helper';

// User Service Mocks

// Admin User Service Mocks
export const ADMIN_USER_QUERY_METHODS = [
  'findUniqueOrThrowAdminUser',
  'findManyAdminUsersById',
  'findAllAdminUsers',
] as const;

export function createMockAdminUserQueryService() {
  return createMockQueryService([...ADMIN_USER_QUERY_METHODS]);
}

// Repository Mocks
export const USER_REPOSITORY_METHODS = [
  'create',
  'createMany',
  'createManyAndReturn',
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'update',
  'updateMany',
  'delete',
  'deleteMany',
  'count',
  'aggregate',
  'groupBy',
] as const;

export const ADMIN_USER_REPOSITORY_METHODS = USER_REPOSITORY_METHODS;

export function createMockAdminUserRepository() {
  return createMockRepository({
    adminUser: [...ADMIN_USER_REPOSITORY_METHODS],
  });
}
