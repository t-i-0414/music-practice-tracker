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
    it('should find an active user by publicId', async () => {
      expect.assertions(1);

      const user = await repositoryService.createUser({ name: 'Find Test User', email: 'find@test.com' });
      const foundUser = await facadeService.findUserById({ publicId: user.publicId });

      expect(foundUser).toMatchObject({
        publicId: user.publicId,
        name: user.name,
        email: user.email,
      });
    });

    it('should not find deleted users', async () => {
      expect.assertions(1);

      const user = await repositoryService.createUser({ name: 'Deleted User', email: 'deleted@test.com' });
      await repositoryService.deleteUser({ publicId: user.publicId });

      await expect(facadeService.findUserById({ publicId: user.publicId })).rejects.toThrow(Error);
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
        publicId: expect.any(String),
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

      const user = await repositoryService.createUser({ name: 'Original Name', email: 'original@test.com' });
      const updateDto = {
        publicId: user.publicId,
        data: {
          name: 'Updated Name',
        },
      };
      const updatedUser = await facadeService.updateUserById(updateDto);

      expect(updatedUser).toMatchObject({
        publicId: user.publicId,
        name: updateDto.data.name,
        email: user.email,
      });
    });
  });
});
