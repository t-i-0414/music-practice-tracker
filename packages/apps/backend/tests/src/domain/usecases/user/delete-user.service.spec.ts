import { Test, TestingModule } from '@nestjs/testing';

import { FirebaseAuthService } from '@/firebase-auth/firebase-auth.service';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { DeleteUserService } from '@/domain/usecases/user/delete-user.service';
import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('integration DeleteUserService', () => {
  let testingModule: TestingModule;
  let deleteUserService: DeleteUserService;
  let userCommandService: UserCommandService;
  let userQueryService: UserQueryService;
  let firebaseAuthService: jest.Mocked<Pick<FirebaseAuthService, 'deleteUser'>>;
  let databaseHelper: DatabaseHelper;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();

    firebaseAuthService = {
      deleteUser: jest.fn().mockResolvedValue(undefined),
    };

    testingModule = await Test.createTestingModule({
      providers: [
        DeleteUserService,
        UserCommandService,
        UserQueryService,
        {
          provide: FirebaseAuthService,
          useValue: firebaseAuthService,
        },
        {
          provide: RepositoryService,
          useValue: databaseHelper.client,
        },
      ],
    }).compile();

    deleteUserService = testingModule.get(DeleteUserService);
    userCommandService = testingModule.get(UserCommandService);
    userQueryService = testingModule.get(UserQueryService);
  });

  afterEach(async () => {
    await testingModule.close();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await databaseHelper.disconnect();
  });

  describe('execute', () => {
    it('deletes the firebase account before removing the database record', async () => {
      expect.assertions(4);

      const createDto = {
        name: 'Integration Delete User',
        firebaseUid: 'uid-int-delete-user',
      };

      const createdUser = await userCommandService.createUser(createDto);

      await deleteUserService.execute(createdUser.publicId);

      expect(firebaseAuthService.deleteUser).toHaveBeenCalledTimes(1);
      expect(firebaseAuthService.deleteUser).toHaveBeenCalledWith(createDto.firebaseUid);
      await expect(userQueryService.findUniqueOrThrowUserById({ publicId: createdUser.publicId })).rejects.toThrow(
        'No record was found for a query',
      );
      await expect(userQueryService.findUniqueUserByFirebaseUid(createDto.firebaseUid)).resolves.toBeNull();
    });

    it('propagates not-found errors without calling firebase', async () => {
      expect.assertions(2);

      const missingPublicId = '00000000-0000-0000-0000-000000000000';

      await expect(deleteUserService.execute(missingPublicId)).rejects.toThrow('No record was found for a query');
      expect(firebaseAuthService.deleteUser).not.toHaveBeenCalled();
    });
  });
});
