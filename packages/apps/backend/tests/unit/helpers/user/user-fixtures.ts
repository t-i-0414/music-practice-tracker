import type {
  ActiveUserResponseDto,
  AnyUserResponseDto,
  DeletedUserResponseDto,
} from '@/modules/aggregate/user/user.response.dto';

export const USER_FIXTURE_IDS = {
  ACTIVE: '123e4567-e89b-12d3-a456-426614174000',
  DELETED: '223e4567-e89b-12d3-a456-426614174001',
  ANY: '323e4567-e89b-12d3-a456-426614174002',
  ANOTHER: '423e4567-e89b-12d3-a456-426614174003',
  INVALID: 'invalid-uuid',
} as const;

const FIXTURE_DATES = {
  CREATED: new Date('2024-01-01'),
  UPDATED: new Date('2024-01-02'),
  DELETED: new Date('2024-01-03'),
} as const;

export const activeUserFixture: ActiveUserResponseDto = {
  id: USER_FIXTURE_IDS.ACTIVE,
  name: 'Test User',
  email: 'test@example.com',
  createdAt: FIXTURE_DATES.CREATED,
  updatedAt: FIXTURE_DATES.UPDATED,
};

export const deletedUserFixture: DeletedUserResponseDto = {
  id: USER_FIXTURE_IDS.DELETED,
  name: 'Deleted User',
  email: 'deleted@example.com',
  createdAt: FIXTURE_DATES.CREATED,
  updatedAt: FIXTURE_DATES.UPDATED,
  deletedAt: FIXTURE_DATES.DELETED,
};

export const anyUserFixture: AnyUserResponseDto = {
  id: USER_FIXTURE_IDS.ANY,
  name: 'Any User',
  email: 'any@example.com',
  createdAt: FIXTURE_DATES.CREATED,
  updatedAt: FIXTURE_DATES.UPDATED,
  deletedAt: FIXTURE_DATES.DELETED,
};

export const activeUserJsonFixture = {
  id: activeUserFixture.id,
  name: activeUserFixture.name,
  email: activeUserFixture.email,
  createdAt: activeUserFixture.createdAt.toISOString(),
  updatedAt: activeUserFixture.updatedAt.toISOString(),
};

export const deletedUserJsonFixture = {
  id: deletedUserFixture.id,
  name: deletedUserFixture.name,
  email: deletedUserFixture.email,
  createdAt: deletedUserFixture.createdAt.toISOString(),
  updatedAt: deletedUserFixture.updatedAt.toISOString(),
  deletedAt: deletedUserFixture.deletedAt.toISOString(),
};

export const anyUserJsonFixture = {
  id: anyUserFixture.id,
  name: anyUserFixture.name,
  email: anyUserFixture.email,
  createdAt: anyUserFixture.createdAt.toISOString(),
  updatedAt: anyUserFixture.updatedAt.toISOString(),
  deletedAt: anyUserFixture.deletedAt?.toISOString(),
};

export const activeUsersResponseFixture = {
  users: [activeUserFixture],
};

export const deletedUsersResponseFixture = {
  users: [deletedUserFixture],
};

export const anyUsersResponseFixture = {
  users: [anyUserFixture],
};

export const activeUsersResponseJsonFixture = {
  users: [activeUserJsonFixture],
};

export const deletedUsersResponseJsonFixture = {
  users: [deletedUserJsonFixture],
};

export const anyUsersResponseJsonFixture = {
  users: [anyUserJsonFixture],
};

export const createUserInputFixture = {
  name: 'New User',
  email: 'new@example.com',
};

export const updateUserInputFixture = {
  name: 'Updated Name',
};

export const updateUserEmailInputFixture = {
  email: 'newemail@example.com',
};

export const createManyUsersInputFixture = {
  users: [
    { name: 'User 1', email: 'user1@example.com' },
    { name: 'User 2', email: 'user2@example.com' },
  ],
};

export const testUserIdsFixture = [USER_FIXTURE_IDS.ACTIVE, USER_FIXTURE_IDS.DELETED];
