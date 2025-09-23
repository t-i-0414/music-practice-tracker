import { Test, TestingModule } from '@nestjs/testing';

import { AppApiUsersController } from '@/apis/app/users/users.controller';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { DeleteUserService } from '@/domain/usecases/user/delete-user.service';
import { FirebaseAuthProvider } from '@/firebase-auth/firebase-auth.provider';
import { FirebaseAuthService } from '@/firebase-auth/firebase-auth.service';
import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('integration AppApiUsersController', () => {
  let controller: AppApiUsersController;
  let databaseHelper: DatabaseHelper;
  let testUser: import('@/domain/aggregates/user/utils/dto').UserResponseDto;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppApiUsersController],
      providers: [
        FirebaseAuthProvider,
        FirebaseAuthService,
        UserCommandService,
        UserQueryService,
        {
          provide: DeleteUserService,
          useValue: { execute: jest.fn() },
        },
        {
          provide: RepositoryService,
          useValue: databaseHelper.client,
        },
      ],
    }).compile();

    controller = module.get<AppApiUsersController>(AppApiUsersController);

    // Create a test user for most tests (simulating logged-in user)
    const commandService = module.get<UserCommandService>(UserCommandService);
    testUser = await commandService.createUser({
      name: 'Current User',
      firebaseUid: 'uid-current-user',
    });
  });

  afterAll(async () => {
    await databaseHelper.disconnect();
  });

  describe('get /users/:publicId', () => {
    it('should return the current user by publicId', async () => {
      expect.assertions(2);

      const result = await controller.fetchUserById(testUser.publicId);

      expect(result.publicId).toBe(testUser.publicId);
      expect(result.name).toBe('Current User');
    });

    it('should throw error for non-existent user', async () => {
      expect.assertions(1);

      const fakePublicId = '00000000-0000-0000-0000-000000000000';

      await expect(controller.fetchUserById(fakePublicId)).rejects.toThrow('No record was found');
    });
  });
});
