import { Test, TestingModule } from '@nestjs/testing';

import type { UserNameChangedEvent } from '@/domain/aggregates/user/events/user-name-changed.event';
import type { UserStatusChangedEvent } from '@/domain/aggregates/user/events/user-status-changed.event';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { UpdateUserService } from '@/domain/usecases/user/update-user.service';
import { DomainEventPublisher } from '@/domain/utils/domain-event-publisher.service';
import { RepositoryService } from '@/repository/repository.service';
import { DatabaseHelper } from '@/tests/helpers/database.helper';

describe('integration UpdateUserService', () => {
  let testingModule: TestingModule;
  let updateUserService: UpdateUserService;
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
        UpdateUserService,
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

    updateUserService = testingModule.get(UpdateUserService);
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
    it('should update name and publish UserNameChangedEvent', async () => {
      expect.assertions(5);

      const created = await userCommandService.createUser({
        name: 'OriginalName',
        firebaseUid: 'uid-update-name',
      });
      eventPublisher.publishAll.mockClear();

      const result = await updateUserService.execute(created.publicId, { name: 'UpdatedName' });

      expect(result.name).toBe('UpdatedName');
      expect(eventPublisher.publishAll).toHaveBeenCalledTimes(1);

      const [[aggregate]] = eventPublisher.publishAll.mock.calls;
      const events = aggregate.pullDomainEvents();
      const [event] = events as [UserNameChangedEvent];

      expect(events).toHaveLength(1);
      expect(event.eventName).toBe('user.name_changed');
      expect(event.oldName).toBe('OriginalName');
    });

    it('should update status and publish UserStatusChangedEvent', async () => {
      expect.assertions(5);

      const created = await userCommandService.createUser({
        name: 'StatusUser',
        firebaseUid: 'uid-update-status',
      });
      eventPublisher.publishAll.mockClear();

      const result = await updateUserService.execute(created.publicId, { status: 'SUSPENDED' });

      expect(result.status).toBe('SUSPENDED');
      expect(eventPublisher.publishAll).toHaveBeenCalledTimes(1);

      const [[aggregate]] = eventPublisher.publishAll.mock.calls;
      const events = aggregate.pullDomainEvents();
      const [event] = events as [UserStatusChangedEvent];

      expect(events).toHaveLength(1);
      expect(event.eventName).toBe('user.status_changed');
      expect(event.oldStatus).toBe('ACTIVE');
    });

    it('should update both name and status and publish both events', async () => {
      expect.assertions(4);

      const created = await userCommandService.createUser({
        name: 'BothUser',
        firebaseUid: 'uid-update-both',
      });
      eventPublisher.publishAll.mockClear();

      const result = await updateUserService.execute(created.publicId, {
        name: 'NewBothName',
        status: 'SUSPENDED',
      });

      expect(result.name).toBe('NewBothName');
      expect(result.status).toBe('SUSPENDED');
      expect(eventPublisher.publishAll).toHaveBeenCalledTimes(1);

      const [[aggregate]] = eventPublisher.publishAll.mock.calls;
      const events = aggregate.pullDomainEvents();

      expect(events).toHaveLength(2);
    });

    it('should throw DomainError for BANNED to ACTIVE transition and not persist changes', async () => {
      expect.assertions(3);

      const created = await userCommandService.createUser({
        name: 'BannedUser',
        firebaseUid: 'uid-banned-transition',
      });
      await userCommandService.updateUserById({
        publicId: created.publicId,
        data: { status: 'BANNED' },
      });
      eventPublisher.publishAll.mockClear();

      await expect(updateUserService.execute(created.publicId, { status: 'ACTIVE' })).rejects.toThrow(
        'BANNED is a terminal state',
      );
      expect(eventPublisher.publishAll).not.toHaveBeenCalled();

      const unchanged = await userQueryService.findUniqueOrThrowUserById({ publicId: created.publicId });

      expect(unchanged.status).toBe('BANNED');
    });

    it('should throw not-found error for non-existent user', async () => {
      expect.assertions(2);

      const missingPublicId = '00000000-0000-0000-0000-000000000000';

      await expect(updateUserService.execute(missingPublicId, { name: 'Ghost' })).rejects.toThrow(
        'No record was found for a query',
      );
      expect(eventPublisher.publishAll).not.toHaveBeenCalled();
    });
  });
});
