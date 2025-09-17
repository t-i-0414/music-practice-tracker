import { type TestingModule } from '@nestjs/testing';

import { AppApiUsersController } from '@/apis/app/users/users.controller';
import { ApiError } from '@/apis/utils/api.error';
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
  let firebaseAuthService: jest.Mocked<FirebaseAuthService>;
  let deleteUserService: { execute: jest.Mock };
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
    firebaseAuthService = module.get<jest.Mocked<FirebaseAuthService>>(FirebaseAuthService);
    deleteUserService = module.get(DeleteUserService);
  });

  afterEach(() => {
    resetAllMocks(queryService, commandService, firebaseAuthService, deleteUserService);
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

      firebaseAuthService.verifyIdToken.mockResolvedValue({
        uid: 'uid-from-token',
        email_verified: true,
        firebase,
      } as any);
      queryService.findUniqueUserByFirebaseUid.mockResolvedValue(null as any);

      const result = await controller.createUser('token', createDto as any);

      expect(commandService.createUser).toHaveBeenCalledWith({ firebaseUid: 'uid-from-token', name: createDto.name });
      expect(result).toStrictEqual(mockResponseDto);
    });

    it('should throw an ApiError when authentication token is missing', async () => {
      expect.assertions(1);

      await expect(controller.createUser(undefined, { name: 'No Token' } as any)).rejects.toBeInstanceOf(ApiError);
    });

    it('should throw when the email is not verified and provider is not allowlisted', async () => {
      expect.assertions(2);

      firebaseAuthService.verifyIdToken.mockResolvedValue({
        uid: 'uid-from-token',
        email_verified: false,
        firebase: { sign_in_provider: 'github.com' },
      } as any);

      await expect(controller.createUser('token', { name: 'User' } as any)).rejects.toThrow(
        'Email verification required',
      );
      expect(commandService.createUser).not.toHaveBeenCalled();
    });

    it('should return an existing user without creating a new one', async () => {
      expect.assertions(2);

      const existingUser = toUserResponseDto(userFactory.build());
      firebaseAuthService.verifyIdToken.mockResolvedValue({
        uid: existingUser.firebaseUid,
        email_verified: true,
        firebase: { sign_in_provider: 'password' },
      } as any);
      queryService.findUniqueUserByFirebaseUid.mockResolvedValue(existingUser as any);

      const result = await controller.createUser('token', { name: 'Ignored' } as any);

      expect(result).toBe(existingUser);
      expect(commandService.createUser).not.toHaveBeenCalled();
    });

    it('should validate the payload and throw when invalid data is provided', async () => {
      expect.assertions(2);

      firebaseAuthService.verifyIdToken.mockResolvedValue({
        uid: 'new-uid',
        email_verified: true,
        firebase: { sign_in_provider: 'password' },
      } as any);
      queryService.findUniqueUserByFirebaseUid.mockResolvedValue(null as any);

      await expect(controller.createUser('token', { name: '' } as any)).rejects.toMatchObject({
        errorCode: 'AP0422',
      });
      expect(commandService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('get /users/me', () => {
    it('should return the current user', async () => {
      expect.assertions(2);

      const currentUser = { publicId: 'public-id' } as const;
      const response = toUserResponseDto(userFactory.build({ publicId: currentUser.publicId }));
      queryService.findUniqueOrThrowUserById.mockResolvedValue(response);

      const result = await controller.fetchCurrentUser(currentUser as any);

      expect(queryService.findUniqueOrThrowUserById).toHaveBeenCalledWith({ publicId: currentUser.publicId });
      expect(result).toBe(response);
    });
  });

  describe('put /users/me', () => {
    it('should update the current user profile', async () => {
      expect.assertions(2);

      const currentUser = { publicId: 'public-id' } as const;
      const payload = { name: 'Updated Name' } as const;
      const response = toUserResponseDto(userFactory.build({ publicId: currentUser.publicId, name: payload.name }));
      commandService.updateUserById.mockResolvedValue(response);

      const result = await controller.updateCurrentUserProfile(currentUser as any, payload as any);

      expect(commandService.updateUserById).toHaveBeenCalledWith({ publicId: currentUser.publicId, data: payload });
      expect(result).toBe(response);
    });
  });

  describe('delete /users/me', () => {
    it('should delete the current user via the service', async () => {
      expect.assertions(1);

      const currentUser = { publicId: 'public-id' } as const;

      await controller.deleteCurrentUser(currentUser as any);

      expect(deleteUserService.execute).toHaveBeenCalledWith(currentUser.publicId);
    });
  });
});
