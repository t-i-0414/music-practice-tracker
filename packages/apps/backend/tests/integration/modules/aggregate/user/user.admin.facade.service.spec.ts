import { createIntegrationTestHelper, type IntegrationTestHelper } from '../../../helpers';

import { UserAdminFacadeService } from '@/modules/aggregate/user/user.admin.facade.service';
import { UserModule } from '@/modules/aggregate/user/user.module';
import { UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';

describe('userAdminFacadeService Integration', () => {
  let helper: IntegrationTestHelper;
  let facadeService: UserAdminFacadeService;
  let repositoryService: UserRepositoryService;

  beforeAll(async () => {
    helper = createIntegrationTestHelper();
    const { module } = await helper.setup([UserModule], []);
    facadeService = module.get<UserAdminFacadeService>(UserAdminFacadeService);
    repositoryService = module.get<UserRepositoryService>(UserRepositoryService);
  });

  beforeEach(async () => {
    await helper.cleanupBeforeEach();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  describe('findManyAnyUsers', () => {
    it('should return both active and deleted users', async () => {
      expect.assertions(3);

      // Create active users
      const user1 = await repositoryService.createUser({ name: 'Active User 1', email: 'active1@test.com' });
      const user2 = await repositoryService.createUser({ name: 'Active User 2', email: 'active2@test.com' });

      // Create and delete user
      const deletedUser = await repositoryService.createUser({ name: 'Deleted User', email: 'deleted@test.com' });
      await repositoryService.deleteUser({ publicId: deletedUser.publicId });

      // Get all users including deleted
      const result = await facadeService.findManyAnyUsers({
        publicIds: [user1.publicId, user2.publicId, deletedUser.publicId],
      });

      expect(result.users).toHaveLength(3);

      const activeUsers = result.users.filter((u) => u.deletedAt === null);

      expect(activeUsers).toHaveLength(2);

      const deletedUsers = result.users.filter((u) => u.deletedAt !== null);

      expect(deletedUsers).toHaveLength(1);
    });
  });

  describe('findDeletedUserById', () => {
    it('should find a deleted user', async () => {
      expect.assertions(1);

      // Create and delete user
      const user = await repositoryService.createUser({ name: 'To Delete', email: 'todelete@test.com' });
      await repositoryService.deleteUser({ publicId: user.publicId });

      // Find deleted user
      const foundUser = await facadeService.findDeletedUserById({ publicId: user.publicId });

      expect(foundUser).toMatchObject({
        publicId: user.publicId,
        name: user.name,
        email: user.email,
        deletedAt: expect.any(Date),
      });
    });
  });

  describe('createManyAndReturnUsers', () => {
    it('should create multiple users in batch', async () => {
      expect.assertions(2);

      const dto = {
        users: [
          { name: 'Batch User 1', email: 'batch1@test.com' },
          { name: 'Batch User 2', email: 'batch2@test.com' },
          { name: 'Batch User 3', email: 'batch3@test.com' },
        ],
      };

      const result = await facadeService.createManyAndReturnUsers(dto);

      expect(result.users).toHaveLength(3);

      const emails = result.users.map((u) => u.email).sort();

      expect(emails).toStrictEqual(['batch1@test.com', 'batch2@test.com', 'batch3@test.com']);
    });
  });

  describe('deleteManyUsersById', () => {
    it('should soft delete multiple users', async () => {
      expect.assertions(2);

      // Create users
      const user1 = await repositoryService.createUser({ name: 'Delete 1', email: 'delete1@test.com' });
      const user2 = await repositoryService.createUser({ name: 'Delete 2', email: 'delete2@test.com' });

      // Delete users
      await facadeService.deleteManyUsersById({ publicIds: [user1.publicId, user2.publicId] });

      // Verify users are deleted
      const activeUsers = await repositoryService.findManyActiveUsers({});

      expect(activeUsers).toHaveLength(0);

      const deletedUsers = await repositoryService.findManyDeletedUsers({});

      expect(deletedUsers).toHaveLength(2);
    });
  });

  describe('hardDeleteManyUsersById', () => {
    it('should permanently delete multiple users', async () => {
      expect.assertions(1);

      // Create users
      const user1 = await repositoryService.createUser({ name: 'Hard Delete 1', email: 'harddelete1@test.com' });
      const user2 = await repositoryService.createUser({ name: 'Hard Delete 2', email: 'harddelete2@test.com' });

      // Hard delete users
      await facadeService.hardDeleteManyUsersById({ publicIds: [user1.publicId, user2.publicId] });

      // Verify users are completely gone
      const allUsers = await repositoryService.findManyAnyUsers({});

      expect(allUsers).toHaveLength(0);
    });
  });

  describe('restoreManyUsersById', () => {
    it('should restore multiple soft-deleted users', async () => {
      expect.assertions(3);

      // Create and delete users
      const user1 = await repositoryService.createUser({ name: 'Restore 1', email: 'restore1@test.com' });
      const user2 = await repositoryService.createUser({ name: 'Restore 2', email: 'restore2@test.com' });
      await repositoryService.deleteUser({ publicId: user1.publicId });
      await repositoryService.deleteUser({ publicId: user2.publicId });

      // Restore users
      const result = await facadeService.restoreManyUsersById({ publicIds: [user1.publicId, user2.publicId] });

      expect(result.users).toHaveLength(2);

      // Verify users are active again
      const activeUsers = await repositoryService.findManyActiveUsers({});

      expect(activeUsers).toHaveLength(2);

      const deletedUsers = await repositoryService.findManyDeletedUsers({});

      expect(deletedUsers).toHaveLength(0);
    });
  });
});
