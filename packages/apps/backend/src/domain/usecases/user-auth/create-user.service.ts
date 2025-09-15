import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { VerifyFirebaseIdTokenService } from './verify-firebase-id-token.service';

import { ApiError } from '@/apis/utils/api.error';
import { isProviderAllowed } from '@/domain/aggregates/firebase-auth/utils/constants';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { CreateUserInputDto, UserResponseDto } from '@/domain/aggregates/user/utils/dto';
import { NON_ERROR_LENGTH, transformValidationErrorIntoDetail } from '@/utils/transform-validation-error-into-detail';

@Injectable()
export class CreateUserService {
  public constructor(
    private readonly verifyFirebaseIdTokenService: VerifyFirebaseIdTokenService,
    private readonly usersQueryService: UserQueryService,
    private readonly usersCommandService: UserCommandService,
  ) {}

  public async execute({ idToken, name }: { idToken: string; name: string }): Promise<UserResponseDto> {
    const {
      uid,
      email_verified: emailVerified,
      firebase: { sign_in_provider: signInProvider },
    } = await this.verifyFirebaseIdTokenService.execute(idToken);

    if (!(emailVerified === true || isProviderAllowed(signInProvider))) {
      throw new ApiError('AP0403', 'Email verification required');
    }

    const existingUser = await this.usersQueryService.findUniqueUserByFirebaseUid(uid);
    if (existingUser !== null) {
      return existingUser;
    }

    const createUserInputDto = plainToInstance(CreateUserInputDto, { firebaseUid: uid, name });
    const errors = validateSync(createUserInputDto, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length > NON_ERROR_LENGTH) {
      throw new ApiError('AP0422', transformValidationErrorIntoDetail(errors) || 'Invalid user data');
    }

    const createdUser = await this.usersCommandService.createUser(createUserInputDto);
    return createdUser;
  }
}
