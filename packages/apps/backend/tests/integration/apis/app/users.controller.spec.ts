import { Test, TestingModule } from '@nestjs/testing';

import { AppApiUsersController } from '@/apis/app/users/users.controller';
import { FirebaseAuthProvider } from '@/domain/aggregates/firebase-auth/firebase-auth.provider';
import { FirebaseAuthService } from '@/domain/aggregates/firebase-auth/firebase-auth.service';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('integration AppApiUsersController', () => {
  let controller: AppApiUsersController;
  let databaseHelper: DatabaseHelper;
  let testUser: { publicId: string; email: string; name: string };

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
          provide: RepositoryService,
          useValue: databaseHelper.client,
        },
      ],
    }).compile();

    controller = module.get<AppApiUsersController>(AppApiUsersController);

    // Create a test user for most tests (simulating logged-in user)
    const commandService = module.get<UserCommandService>(UserCommandService);
    testUser = await commandService.createUser({
      email: 'current-user@example.com',
      name: 'Current User',
    });
  });

  afterAll(async () => {
    await databaseHelper.disconnect();
  });

  describe('get /users/:publicId', () => {
    it('should return the current user by publicId', async () => {
      expect.assertions(3);

      const result = await controller.findUniqueOrThrowUserById(testUser.publicId);

      expect(result.publicId).toBe(testUser.publicId);
      expect(result.email).toBe('current-user@example.com');
      expect(result.name).toBe('Current User');
    });

    it('should throw error for non-existent user', async () => {
      expect.assertions(1);

      const fakePublicId = '00000000-0000-0000-0000-000000000000';

      await expect(controller.findUniqueOrThrowUserById(fakePublicId)).rejects.toThrow('No record was found');
    });
  });
});
