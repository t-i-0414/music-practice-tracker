import { createIntegrationTestHelper, type IntegrationTestHelper } from '../../../helpers';

import { UserAppFacadeService } from '@/modules/aggregate/user/user.app.facade.service';
import { UserModule } from '@/modules/aggregate/user/user.module';
import { UserRepositoryService } from '@/modules/aggregate/user/user.repository.service';

describe('userAppFacadeService Integration', () => {
  let helper: IntegrationTestHelper;
  let facadeService: UserAppFacadeService;
  let repositoryService: UserRepositoryService;

  beforeAll(async () => {
    helper = createIntegrationTestHelper();
    const { module } = await helper.setup([UserModule], []);
    facadeService = module.get<UserAppFacadeService>(UserAppFacadeService);
    repositoryService = module.get<UserRepositoryService>(UserRepositoryService);
  });

  beforeEach(async () => {
    await helper.cleanupBeforeEach();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  describe('findUserById', () => {
    it('should find an active user by id', async () => {
      expect.assertions(1);

      // Create user
      const user = await repositoryService.createUser({ name: 'Find Test User', email: 'find@test.com' });

      // Find user through facade
      const foundUser = await facadeService.findUserById({ id: user.id });

      expect(foundUser).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    });

    it('should not find deleted users', async () => {
      expect.assertions(1);

      // Create and delete user
      const user = await repositoryService.createUser({ name: 'Deleted User', email: 'deleted@test.com' });
      await repositoryService.deleteUser({ id: user.id });

      // Should throw when trying to find deleted user
      await expect(facadeService.findUserById({ id: user.id })).rejects.toThrow(Error);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      expect.assertions(1);

      const dto = {
        name: 'New User',
        email: 'new@test.com',
      };

      const createdUser = await facadeService.createUser(dto);

      expect(createdUser).toMatchObject({
        id: expect.any(String),
        name: dto.name,
        email: dto.email,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('updateUserById', () => {
    it('should update an existing user', async () => {
      expect.assertions(1);

      // Create user
      const user = await repositoryService.createUser({ name: 'Original Name', email: 'original@test.com' });

      // Update through facade
      const updateDto = {
        id: user.id,
        data: {
          name: 'Updated Name',
        },
      };
      const updatedUser = await facadeService.updateUserById(updateDto);

      expect(updatedUser).toMatchObject({
        id: user.id,
        name: updateDto.data.name,
        email: user.email,
      });
    });
  });

  describe('deleteUserById', () => {
    it('should soft delete a user', async () => {
      expect.assertions(2);

      // Create user
      const user = await repositoryService.createUser({ name: 'To Delete', email: 'todelete@test.com' });

      // Delete through facade
      await facadeService.deleteUserById({ id: user.id });

      // Verify user is soft deleted
      const activeUser = await repositoryService.findUniqueActiveUser({ id: user.id });

      expect(activeUser).toBeNull();

      const deletedUser = await repositoryService.findUniqueDeletedUser({ id: user.id });

      expect(deletedUser).toBeTruthy();
    });
  });
});
