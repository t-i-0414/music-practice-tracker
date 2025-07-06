import type {
  ActiveUserResponseDto,
  AnyUserResponseDto,
  DeletedUserResponseDto,
} from '@/modules/aggregate/user/user.response.dto';

export const TEST_UUIDS = {
  ACTIVE_USER: '123e4567-e89b-12d3-a456-426614174000',
  DELETED_USER: '223e4567-e89b-12d3-a456-426614174001',
  ANY_USER: '323e4567-e89b-12d3-a456-426614174002',
  ANOTHER_USER: '423e4567-e89b-12d3-a456-426614174003',
  INVALID: 'invalid-uuid',
} as const;

export const TEST_DATES = {
  CREATED: new Date('2024-01-01'),
  UPDATED: new Date('2024-01-02'),
  DELETED: new Date('2024-01-03'),
} as const;

export const mockActiveUser: ActiveUserResponseDto = {
  id: TEST_UUIDS.ACTIVE_USER,
  name: 'Test User',
  email: 'test@example.com',
  createdAt: TEST_DATES.CREATED,
  updatedAt: TEST_DATES.UPDATED,
};

export const mockDeletedUser: DeletedUserResponseDto = {
  id: TEST_UUIDS.DELETED_USER,
  name: 'Deleted User',
  email: 'deleted@example.com',
  createdAt: TEST_DATES.CREATED,
  updatedAt: TEST_DATES.UPDATED,
  deletedAt: TEST_DATES.DELETED,
};

export const mockAnyUser: AnyUserResponseDto = {
  id: TEST_UUIDS.ANY_USER,
  name: 'Any User',
  email: 'any@example.com',
  createdAt: TEST_DATES.CREATED,
  updatedAt: TEST_DATES.UPDATED,
  deletedAt: TEST_DATES.DELETED,
};

export const mockActiveUserJson = {
  id: mockActiveUser.id,
  name: mockActiveUser.name,
  email: mockActiveUser.email,
  createdAt: mockActiveUser.createdAt.toISOString(),
  updatedAt: mockActiveUser.updatedAt.toISOString(),
};

export const mockDeletedUserJson = {
  id: mockDeletedUser.id,
  name: mockDeletedUser.name,
  email: mockDeletedUser.email,
  createdAt: mockDeletedUser.createdAt.toISOString(),
  updatedAt: mockDeletedUser.updatedAt.toISOString(),
  deletedAt: mockDeletedUser.deletedAt.toISOString(),
};

export const mockAnyUserJson = {
  id: mockAnyUser.id,
  name: mockAnyUser.name,
  email: mockAnyUser.email,
  createdAt: mockAnyUser.createdAt.toISOString(),
  updatedAt: mockAnyUser.updatedAt.toISOString(),
  deletedAt: mockAnyUser.deletedAt.toISOString(),
};

export const mockActiveUsersResponse = {
  users: [mockActiveUser],
};

export const mockDeletedUsersResponse = {
  users: [mockDeletedUser],
};

export const mockAnyUsersResponse = {
  users: [mockAnyUser],
};

export const mockActiveUsersResponseJson = {
  users: [mockActiveUserJson],
};

export const mockDeletedUsersResponseJson = {
  users: [mockDeletedUserJson],
};

export const mockAnyUsersResponseJson = {
  users: [mockAnyUserJson],
};

export const createUserInput = {
  name: 'New User',
  email: 'new@example.com',
};

export const updateUserInput = {
  name: 'Updated Name',
};

export const updateUserEmailInput = {
  email: 'newemail@example.com',
};

export const createManyUsersInput = {
  users: [
    { name: 'User 1', email: 'user1@example.com' },
    { name: 'User 2', email: 'user2@example.com' },
  ],
};

export const testUserIds = [TEST_UUIDS.ACTIVE_USER, TEST_UUIDS.DELETED_USER];
export const singleUserId = [TEST_UUIDS.ACTIVE_USER];
