import { type User } from '@/modules/aggregate/user/user.repository.service';

/**
 * Prisma User エンティティを作成するファクトリー関数
 */
export const createUserEntity = (overrides: Partial<User> = {}): User => ({
  id: 'user-id',
  name: 'Mock User',
  email: 'mock@example.com',
  createdAt: new Date('2025-07-07T00:00:00Z'),
  updatedAt: new Date('2025-07-08T00:00:00Z'),
  deletedAt: null,
  ...overrides,
});
