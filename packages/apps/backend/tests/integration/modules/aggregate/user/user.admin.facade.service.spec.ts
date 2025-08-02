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

  describe('findManyUsers', () => {
    it('should find multiple users', async () => {
      expect.assertions(2);

      const user1 = await repositoryService.createUser({ name: 'User 1', email: 'user1@test.com' });
      const user2 = await repositoryService.createUser({ name: 'User 2', email: 'user2@test.com' });

      const result = await facadeService.findManyUsers({
        publicIds: [user1.publicId, user2.publicId],
      });

      expect(result.users).toHaveLength(2);
      expect(result.users.map((u) => u.email).sort()).toStrictEqual(['user1@test.com', 'user2@test.com']);
    });
  });

  describe('findUserById', () => {
    it('should find a user by id', async () => {
      expect.assertions(1);

      const user = await repositoryService.createUser({ name: 'Test User', email: 'test@test.com' });
      const foundUser = await facadeService.findUserById({ publicId: user.publicId });

      expect(foundUser).toMatchObject({
        publicId: user.publicId,
        name: user.name,
        email: user.email,
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
      expect(result.users.map((u) => u.email).sort()).toStrictEqual([
        'batch1@test.com',
        'batch2@test.com',
        'batch3@test.com',
      ]);
    });
  });

  describe('deleteManyUsersById', () => {
    it('should delete multiple users', async () => {
      expect.assertions(1);

      const user1 = await repositoryService.createUser({ name: 'Delete 1', email: 'delete1@test.com' });
      const user2 = await repositoryService.createUser({ name: 'Delete 2', email: 'delete2@test.com' });

      await facadeService.deleteManyUsersById({ publicIds: [user1.publicId, user2.publicId] });

      const users = await repositoryService.findManyUsers({
        where: { publicId: { in: [user1.publicId, user2.publicId] } },
      });

      expect(users).toHaveLength(0);
    });
  });
});
