import { Test, TestingModule } from '@nestjs/testing';

import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { DeleteUserService } from '@/domain/usecases/user/delete-user.service';
import { DomainEventPublisher } from '@/domain/utils/domain-event-publisher.service';
import { FirebaseAuthService } from '@/firebase-auth/firebase-auth.service';
import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('integration DeleteUserService', () => {
  let testingModule: TestingModule;
  let deleteUserService: DeleteUserService;
  let userCommandService: UserCommandService;
  let userQueryService: UserQueryService;
  let firebaseAuthService: jest.Mocked<Pick<FirebaseAuthService, 'deleteUser'>>;
  let eventPublisher: { publishAll: jest.Mock };
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

    eventPublisher = { publishAll: jest.fn() };

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
        {
          provide: DomainEventPublisher,
          useValue: eventPublisher,
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
      expect.assertions(5);

      const createDto = {
        name: 'Integration Delete User',
        firebaseUid: 'uid-int-delete-user',
      };

      const createdUser = await userCommandService.createUser(createDto);
      eventPublisher.publishAll.mockClear();

      await deleteUserService.execute(createdUser.publicId);

      expect(firebaseAuthService.deleteUser).toHaveBeenCalledTimes(1);
      expect(firebaseAuthService.deleteUser).toHaveBeenCalledWith(createDto.firebaseUid);
      expect(eventPublisher.publishAll).toHaveBeenCalledTimes(1);
      await expect(userQueryService.findUniqueOrThrowUserById({ publicId: createdUser.publicId })).rejects.toThrow(
        'No record was found for a query',
      );
      await expect(userQueryService.findUniqueUserByFirebaseUid(createDto.firebaseUid)).resolves.toBeNull();
    });

    it('propagates not-found errors without calling firebase or publishing events', async () => {
      expect.assertions(3);

      const missingPublicId = '00000000-0000-0000-0000-000000000000';

      await expect(deleteUserService.execute(missingPublicId)).rejects.toThrow('No record was found for a query');
      expect(firebaseAuthService.deleteUser).not.toHaveBeenCalled();
      expect(eventPublisher.publishAll).not.toHaveBeenCalled();
    });
  });
});
