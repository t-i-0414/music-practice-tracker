import { type TestingModule } from '@nestjs/testing';

import { AppApiUsersController } from '@/apis/app/users/users.controller';
import { FirebaseAuthService } from '@/domain/aggregates/firebase-auth/firebase-auth.service';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { toUserResponseDto } from '@/domain/aggregates/user/utils/dto';
import { DeleteUserService } from '@/domain/usecases/user/delete-user.service';
import { UserFactory } from '@/tests/factory';
import {
  createMockFirebaseAuthService,
  createMockUserCommandService,
  createMockUserQueryService,
  createTestModule,
  resetAllMocks,
} from '@/tests/unit/apis/helpers';

describe('appApiUsersController', () => {
  let controller: AppApiUsersController;
  let queryService: jest.Mocked<UserQueryService>;
  let commandService: jest.Mocked<UserCommandService>;
  let userFactory: UserFactory;

  beforeEach(async () => {
    userFactory = new UserFactory();

    const mockQueryService = createMockUserQueryService();
    const mockCommandService = createMockUserCommandService();
    const mockFirebaseAuthService = createMockFirebaseAuthService();

    const module: TestingModule = await createTestModule({
      controller: AppApiUsersController,
      providers: [
        {
          provide: FirebaseAuthService,
          useValue: mockFirebaseAuthService,
        },
        {
          provide: UserQueryService,
          useValue: mockQueryService,
        },
        {
          provide: UserCommandService,
          useValue: mockCommandService,
        },
        {
          provide: DeleteUserService,
          useValue: { execute: jest.fn() },
        },
      ],
    });

    controller = module.get<AppApiUsersController>(AppApiUsersController);
    queryService = module.get<jest.Mocked<UserQueryService>>(UserQueryService);
    commandService = module.get<jest.Mocked<UserCommandService>>(UserCommandService);
  });

  afterEach(() => {
    resetAllMocks(queryService, commandService);
  });

  describe('get /users/:publicId', () => {
    it('should return user by public ID', async () => {
      expect.assertions(2);

      const mockUser = userFactory.build();
      const mockResponseDto = toUserResponseDto(mockUser);
      queryService.findUniqueOrThrowUserById.mockResolvedValue(mockResponseDto);

      const result = await controller.fetchUserById(mockUser.publicId);

      expect(queryService.findUniqueOrThrowUserById).toHaveBeenCalledWith({
        publicId: mockUser.publicId,
      });
      expect(result).toStrictEqual(mockResponseDto);
    });

    it('should throw error when user not found', async () => {
      expect.assertions(2);

      const publicId = 'non-existent-id';
      queryService.findUniqueOrThrowUserById.mockRejectedValue(new Error('User not found'));

      await expect(controller.fetchUserById(publicId)).rejects.toThrow('User not found');
      expect(queryService.findUniqueOrThrowUserById).toHaveBeenCalledWith({ publicId });
    });
  });

  describe('post /users', () => {
    it('should create a new user', async () => {
      expect.assertions(2);

      const createDto = { name: 'New User' } as const;
      const mockUser = userFactory.build({ name: createDto.name, firebaseUid: 'uid-from-token' });
      const mockResponseDto = toUserResponseDto(mockUser);
      commandService.createUser.mockResolvedValue(mockResponseDto);
      // token verification and uniqueness gate
      const firebase = { sign_in_provider: 'password' } as const;

      const firebaseService = (controller as any).firebaseAuthService as jest.Mocked<FirebaseAuthService>;
      firebaseService.verifyIdToken.mockResolvedValue({ uid: 'uid-from-token', email_verified: true, firebase } as any);
      queryService.findUniqueUserByFirebaseUid.mockResolvedValue(null as any);

      const result = await controller.createUser('token', createDto as any);

      expect(commandService.createUser).toHaveBeenCalledWith({ firebaseUid: 'uid-from-token', name: createDto.name });
      expect(result).toStrictEqual(mockResponseDto);
    });
  });
});
