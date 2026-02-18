import { Test, TestingModule } from '@nestjs/testing';

import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { BulkDeleteUsersService } from '@/domain/usecases/user/bulk-delete-users.service';
import { DomainEventPublisher } from '@/domain/utils/domain-event-publisher.service';
import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('integration BulkDeleteUsersService', () => {
  let testingModule: TestingModule;
  let bulkDeleteUsersService: BulkDeleteUsersService;
  let userCommandService: UserCommandService;
  let userQueryService: UserQueryService;
  let eventPublisher: { publishAll: jest.Mock };
  let databaseHelper: DatabaseHelper;

  beforeAll(async () => {
    databaseHelper = new DatabaseHelper();
    await databaseHelper.connect();
  });

  beforeEach(async () => {
    await databaseHelper.cleanDatabase();

    eventPublisher = { publishAll: jest.fn() };

    testingModule = await Test.createTestingModule({
      providers: [
        BulkDeleteUsersService,
        UserCommandService,
        UserQueryService,
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
    it('deletes all specified users and publishes UserDeletedEvent for each', async () => {
      expect.assertions(4);

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

      expect(eventPublisher.publishAll).toHaveBeenCalledTimes(2);

      const [[firstAggregate]] = eventPublisher.publishAll.mock.calls;
      const events = firstAggregate.pullDomainEvents();

      expect(events[0].eventName).toBe('user.deleted');

      await expect(userQueryService.findUniqueOrThrowUserById({ publicId: users.users[0].publicId })).rejects.toThrow(
        'No record was found for a query',
      );

      const remaining = await userQueryService.findUniqueOrThrowUserById({
        publicId: users.users[2].publicId,
      });

      expect(remaining.name).toBe('Keep Me');
    });

    it('does not publish events when no users match the given publicIds', async () => {
      expect.assertions(1);

      eventPublisher.publishAll.mockClear();

      await bulkDeleteUsersService.execute([
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
      ]);

      expect(eventPublisher.publishAll).not.toHaveBeenCalled();
    });
  });
});
