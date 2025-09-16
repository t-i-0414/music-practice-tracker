import { createMockQueryService, createMockCommandService, createMockRepository } from './mock-service.helper';

// Firebase Auth Service Mock
export function createMockFirebaseAuthService() {
  return {
    verifyIdToken: jest.fn(),
  };
}

// User Service Mocks
export const USER_QUERY_METHODS = [
  'findUniqueOrThrowUserById',
  'findUniqueOrThrowUserByEmail',
  'findUniqueOrThrowUserByFirebaseUid',
  'findUniqueUserByFirebaseUid',
  'findManyUsersById',
  'findAllUsers',
] as const;

export const USER_COMMAND_METHODS = [
  'createUser',
  'createManyAndReturnUsers',
  'updateUserById',
  'deleteUserById',
  'deleteManyUsersById',
] as const;

export function createMockUserQueryService() {
  return createMockQueryService([...USER_QUERY_METHODS]);
}

export function createMockUserCommandService() {
  return createMockCommandService([...USER_COMMAND_METHODS]);
}

// Admin User Service Mocks
export const ADMIN_USER_QUERY_METHODS = [
  'findUniqueOrThrowAdminUser',
  'findManyAdminUsersById',
  'findAllAdminUsers',
] as const;

export const ADMIN_USER_COMMAND_METHODS = [
  'createAdminUser',
  'createManyAndReturnAdminUsers',
  'updateAdminUserById',
  'deleteAdminUserById',
  'deleteManyAdminUsersByIds',
] as const;

export function createMockAdminUserQueryService() {
  return createMockQueryService([...ADMIN_USER_QUERY_METHODS]);
}

export function createMockAdminUserCommandService() {
  return createMockCommandService([...ADMIN_USER_COMMAND_METHODS]);
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

export function createMockUserRepository() {
  return createMockRepository({
    user: [...USER_REPOSITORY_METHODS],
  });
}

export function createMockAdminUserRepository() {
  return createMockRepository({
    adminUser: [...ADMIN_USER_REPOSITORY_METHODS],
  });
}
