import { createMockQueryService, createMockCommandService } from './mock-service.helper';

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
