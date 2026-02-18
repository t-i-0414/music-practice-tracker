import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { BulkDeleteUsersService } from '@/domain/usecases/user/bulk-delete-users.service';
import { DomainEventPublisher } from '@/domain/utils/domain-event-publisher.service';
import { FirebaseAuthService } from '@/firebase-auth/firebase-auth.service';
import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('integration BulkDeleteUsersService', () => {
  let testingModule: TestingModule;
  let bulkDeleteUsersService: BulkDeleteUsersService;
  let userCommandService: UserCommandService;
  let userQueryService: UserQueryService;
  let firebaseAuthService: jest.Mocked<Pick<FirebaseAuthService, 'deleteUsers'>>;
  let eventPublisher: { publishAll: jest.Mock };
  let databaseHelper: DatabaseHelper;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();

    firebaseAuthService = {
      deleteUsers: jest.fn().mockResolvedValue(undefined),
    };

    eventPublisher = { publishAll: jest.fn() };

    testingModule = await Test.createTestingModule({
      providers: [
        BulkDeleteUsersService,
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

    bulkDeleteUsersService = testingModule.get(BulkDeleteUsersService);
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
    it('deletes Firebase accounts + DB records and publishes UserDeletedEvent for each', async () => {
      expect.assertions(7);

      const users = await userCommandService.createManyAndReturnUsers({
        users: [
          { name: 'Bulk Del 1', firebaseUid: 'uid-bulk-del-1' },
          { name: 'Bulk Del 2', firebaseUid: 'uid-bulk-del-2' },
          { name: 'Keep Me', firebaseUid: 'uid-bulk-keep' },
        ],
      });
      eventPublisher.publishAll.mockClear();

      const publicIdsToDelete = [users.users[0].publicId, users.users[1].publicId];
      await bulkDeleteUsersService.execute(publicIdsToDelete);

      expect(firebaseAuthService.deleteUsers).toHaveBeenCalledTimes(1);
      expect(firebaseAuthService.deleteUsers).toHaveBeenCalledWith(
        expect.arrayContaining(['uid-bulk-del-1', 'uid-bulk-del-2']),
      );

      expect(eventPublisher.publishAll).toHaveBeenCalledTimes(2);

      const [[firstAggregate]] = eventPublisher.publishAll.mock.calls;
      const events = firstAggregate.pullDomainEvents();

      expect(events[0].eventName).toBe('user.deleted');
      expect(events[0].aggregateId).toBe(users.users[0].publicId);

      await expect(userQueryService.findUniqueOrThrowUserById({ publicId: users.users[0].publicId })).rejects.toThrow(
        'No record was found for a query',
      );

      const remaining = await userQueryService.findUniqueOrThrowUserById({
        publicId: users.users[2].publicId,
      });

      expect(remaining.name).toBe('Keep Me');
    });

    it('does not call Firebase or publish events when no users match the given publicIds', async () => {
      expect.assertions(3);

      eventPublisher.publishAll.mockClear();
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);

      await bulkDeleteUsersService.execute([
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
      ]);

      expect(firebaseAuthService.deleteUsers).not.toHaveBeenCalled();
      expect(eventPublisher.publishAll).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('No users found'));
    });

    it('returns immediately for an empty publicIds array', async () => {
      expect.assertions(2);

      await bulkDeleteUsersService.execute([]);

      expect(firebaseAuthService.deleteUsers).not.toHaveBeenCalled();
      expect(eventPublisher.publishAll).not.toHaveBeenCalled();
    });

    it('warns when some publicIds do not match any user', async () => {
      expect.assertions(2);

      const users = await userCommandService.createManyAndReturnUsers({
        users: [{ name: 'Partial Match', firebaseUid: 'uid-partial-match' }],
      });
      eventPublisher.publishAll.mockClear();

      const loggerSpy = jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);

      await bulkDeleteUsersService.execute([users.users[0].publicId, '00000000-0000-0000-0000-000000000099']);

      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Only 1 of 2'));
      expect(eventPublisher.publishAll).toHaveBeenCalledTimes(1);
    });

    it('propagates Firebase errors without deleting DB records or publishing events', async () => {
      expect.assertions(4);

      const users = await userCommandService.createManyAndReturnUsers({
        users: [
          { name: 'Firebase Fail 1', firebaseUid: 'uid-fb-fail-1' },
          { name: 'Firebase Fail 2', firebaseUid: 'uid-fb-fail-2' },
        ],
      });
      eventPublisher.publishAll.mockClear();

      firebaseAuthService.deleteUsers.mockRejectedValueOnce(new Error('Firebase batch delete failed'));

      await expect(bulkDeleteUsersService.execute(users.users.map((u) => u.publicId))).rejects.toThrow(
        'Firebase batch delete failed',
      );

      expect(eventPublisher.publishAll).not.toHaveBeenCalled();

      const stillExists = await userQueryService.findUniqueOrThrowUserById({
        publicId: users.users[0].publicId,
      });

      expect(stillExists.publicId).toBe(users.users[0].publicId);
      expect(stillExists.name).toBe('Firebase Fail 1');
    });

    it('logs inconsistent state and re-throws when DB deletion fails after Firebase deletion', async () => {
      expect.assertions(4);

      const users = await userCommandService.createManyAndReturnUsers({
        users: [{ name: 'DB Fail User', firebaseUid: 'uid-db-fail-bulk' }],
      });
      eventPublisher.publishAll.mockClear();

      jest.spyOn(userCommandService, 'deleteManyUsersById').mockRejectedValueOnce(new Error('DB connection lost'));
      const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockReturnValue(undefined);

      await expect(bulkDeleteUsersService.execute([users.users[0].publicId])).rejects.toThrow('DB connection lost');

      expect(firebaseAuthService.deleteUsers).toHaveBeenCalledWith(['uid-db-fail-bulk']);
      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('INCONSISTENT STATE'), expect.any(String));
      expect(eventPublisher.publishAll).not.toHaveBeenCalled();
    });

    it('handles non-Error thrown value when DB deletion fails', async () => {
      expect.assertions(3);

      const users = await userCommandService.createManyAndReturnUsers({
        users: [{ name: 'Non-Error Fail', firebaseUid: 'uid-non-error-bulk' }],
      });
      eventPublisher.publishAll.mockClear();

      jest.spyOn(userCommandService, 'deleteManyUsersById').mockRejectedValueOnce('raw db failure');
      const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockReturnValue(undefined);

      await expect(bulkDeleteUsersService.execute([users.users[0].publicId])).rejects.toBe('raw db failure');

      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('INCONSISTENT STATE'), undefined);
      expect(eventPublisher.publishAll).not.toHaveBeenCalled();
    });
  });
});
