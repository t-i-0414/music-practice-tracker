import { UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';
import { createIntegrationTestHelper, type IntegrationTestHelper } from '@/tests/helpers';

describe('UserRepositoryService (Integration)', () => {
  let helper: IntegrationTestHelper;
  let service: UserRepositoryService;

  beforeAll(async () => {
    helper = createIntegrationTestHelper();
    const { module } = await helper.setup([], [UserRepositoryService]);
    service = module.get<UserRepositoryService>(UserRepositoryService);
  });

  afterAll(async () => {
    await helper.teardown();
  });

  beforeEach(async () => {
    await helper.cleanupBeforeEach();
  });

  describe('createUser', () => {
    it('should create a new user in the database', async () => {
      const userData = {
        name: 'Integration Test User',
        email: 'integration@test.com',
      };

      const createdUser = await service.createUser(userData);

      expect(createdUser).toMatchObject({
        id: expect.any(String),
        name: userData.name,
        email: userData.email,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
      });

      // データベースに実際に保存されていることを確認
      const foundUser = await service.findUniqueActiveUser({ id: createdUser.id });
      expect(foundUser).toMatchObject(createdUser);
    });
  });

  describe('findUniqueActiveUser', () => {
    it('should find an active user by id', async () => {
      const userData = {
        name: 'Find Test User',
        email: 'find@test.com',
      };
      const createdUser = await service.createUser(userData);

      const foundUser = await service.findUniqueActiveUser({ id: createdUser.id });

      expect(foundUser).toMatchObject(createdUser);
    });

    it('should return null for non-existent user', async () => {
      const foundUser = await service.findUniqueActiveUser({ id: '00000000-0000-0000-0000-000000000000' });

      expect(foundUser).toBeNull();
    });

    it('should not find soft-deleted users', async () => {
      const userData = {
        name: 'Delete Test User',
        email: 'delete@test.com',
      };
      const createdUser = await service.createUser(userData);

      // ユーザーをソフトデリート
      await service.deleteUser({ id: createdUser.id });

      const foundUser = await service.findUniqueActiveUser({ id: createdUser.id });
      expect(foundUser).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user data', async () => {
      const userData = {
        name: 'Original Name',
        email: 'original@test.com',
      };
      const createdUser = await service.createUser(userData);

      const updateData = {
        name: 'Updated Name',
        email: 'updated@test.com',
      };
      const updatedUser = await service.updateUser({
        where: { id: createdUser.id },
        data: updateData,
      });

      expect(updatedUser).toMatchObject({
        id: createdUser.id,
        name: updateData.name,
        email: updateData.email,
        createdAt: createdUser.createdAt,
        updatedAt: expect.any(Date),
        deletedAt: null,
      });
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(createdUser.updatedAt.getTime());
    });
  });

  describe('deleteUser', () => {
    it('should soft delete a user', async () => {
      const userData = {
        name: 'To Be Deleted',
        email: 'tobedeleted@test.com',
      };
      const createdUser = await service.createUser(userData);

      await service.deleteUser({ id: createdUser.id });

      // 削除後のユーザーを取得
      const deletedUser = await service.findUniqueDeletedUser({ id: createdUser.id });
      expect(deletedUser).toMatchObject({
        id: createdUser.id,
        deletedAt: expect.any(Date),
      });

      // アクティブユーザーとして検索できないことを確認
      const activeUser = await service.findUniqueActiveUser({ id: createdUser.id });
      expect(activeUser).toBeNull();

      // 削除済みユーザーとして検索できることを確認
      const deletedFoundUser = await service.findUniqueDeletedUser({ id: createdUser.id });
      expect(deletedFoundUser).toBeTruthy();
      if (deletedUser && deletedFoundUser) {
        expect(deletedFoundUser).toMatchObject(deletedUser);
      }
    });
  });

  describe('restoreUser', () => {
    it('should restore a soft-deleted user', async () => {
      const userData = {
        name: 'To Be Restored',
        email: 'toberestored@test.com',
      };
      const createdUser = await service.createUser(userData);
      await service.deleteUser({ id: createdUser.id });

      const restoredUser = await service.restoreUser({ id: createdUser.id });

      expect(restoredUser).toMatchObject({
        id: createdUser.id,
        deletedAt: null,
      });

      // アクティブユーザーとして検索できることを確認
      const activeUser = await service.findUniqueActiveUser({ id: createdUser.id });
      expect(activeUser).toMatchObject(restoredUser);
    });
  });

  describe('hardDeleteUser', () => {
    it('should permanently delete a user', async () => {
      const userData = {
        name: 'To Be Hard Deleted',
        email: 'tobeharddeleted@test.com',
      };
      const createdUser = await service.createUser(userData);

      await service.hardDeleteUser({ id: createdUser.id });

      // どの検索でも見つからないことを確認
      const activeUser = await service.findUniqueActiveUser({ id: createdUser.id });
      expect(activeUser).toBeNull();

      const deletedUser = await service.findUniqueDeletedUser({ id: createdUser.id });
      expect(deletedUser).toBeNull();

      const anyUser = await service.findUniqueAnyUser({ id: createdUser.id });
      expect(anyUser).toBeNull();
    });
  });

  describe('findManyUsers', () => {
    it('should find multiple users with filters', async () => {
      // テストデータを作成
      await service.createUser({ name: 'User 1', email: 'user1@test.com' });
      await service.createUser({ name: 'User 2', email: 'user2@test.com' });
      const deletedUser = await service.createUser({ name: 'User 3', email: 'user3@test.com' });
      await service.deleteUser({ id: deletedUser.id });

      // アクティブユーザーのみを検索
      const activeUsers = await service.findManyActiveUsers({});
      expect(activeUsers).toHaveLength(2);
      expect(activeUsers.every((user) => user.deletedAt === null)).toBe(true);

      // 削除済みユーザーのみを検索
      const deletedUsers = await service.findManyDeletedUsers({});
      expect(deletedUsers).toHaveLength(1);
      expect(deletedUsers[0]).toMatchObject({ id: deletedUser.id });

      // すべてのユーザーを検索
      const allUsers = await service.findManyAnyUsers({});
      expect(allUsers).toHaveLength(3);
    });
  });
});
