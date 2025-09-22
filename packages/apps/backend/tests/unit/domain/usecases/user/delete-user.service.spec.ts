import { FirebaseAuthService } from '@/domain/aggregates/firebase-auth/firebase-auth.service';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { DeleteUserService } from '@/domain/usecases/user/delete-user.service';

describe('unit DeleteUserService', () => {
  let firebaseAuthService: jest.Mocked<Pick<FirebaseAuthService, 'deleteUser'>>;
  let usersQueryService: jest.Mocked<Pick<UserQueryService, 'findUniqueOrThrowUserById'>>;
  let usersCommandService: jest.Mocked<Pick<UserCommandService, 'deleteUserById'>>;
  let service: DeleteUserService;

  beforeEach(() => {
    firebaseAuthService = {
      deleteUser: jest.fn().mockResolvedValue(undefined),
    };
    usersQueryService = {
      findUniqueOrThrowUserById: jest.fn(),
    };
    usersCommandService = {
      deleteUserById: jest.fn().mockResolvedValue(undefined),
    };

    service = new DeleteUserService(
      firebaseAuthService as unknown as FirebaseAuthService,
      usersQueryService as unknown as UserQueryService,
      usersCommandService as unknown as UserCommandService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deletes the firebase user first and then removes the database record', async () => {
    expect.assertions(3);

    const user = {
      publicId: 'public-id-123',
      firebaseUid: 'firebase-uid-456',
    };
    usersQueryService.findUniqueOrThrowUserById.mockResolvedValue(user as never);

    await service.execute(user.publicId);

    expect(usersQueryService.findUniqueOrThrowUserById).toHaveBeenCalledWith({ publicId: user.publicId });
    expect(firebaseAuthService.deleteUser).toHaveBeenCalledWith(user.firebaseUid);
    expect(usersCommandService.deleteUserById).toHaveBeenCalledWith({ publicId: user.publicId });
  });
});
