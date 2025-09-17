import { Body, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { BearerToken } from '../utils/decorators/bearer-token.decorator';

import { CurrentUser, type CurrentUserData } from '@/apis/app/utils/decorators/current-user.decorator';
import { ApiStandardResponses } from '@/apis/utils/api-default-response';
import { ApiError } from '@/apis/utils/api.error';
import { ApiController } from '@/apis/utils/controllers/api.controller';
import { Public } from '@/apis/utils/decorators/public.decorator';
import { FirebaseAuthService } from '@/domain/aggregates/firebase-auth/firebase-auth.service';
import { isProviderAllowed } from '@/domain/aggregates/firebase-auth/utils/constants';
import { UserCommandService } from '@/domain/aggregates/user/user.command.service';
import { UserQueryService } from '@/domain/aggregates/user/user.query.service';
import { CreateUserInputDto, UpdateUserDataDto, UserResponseDto } from '@/domain/aggregates/user/utils/dto';
import { DeleteUserService } from '@/domain/usecases/user/delete-user.service';
import {
  NON_ERROR_LENGTH,
  transformValidationErrorIntoDetail,
} from '@/utils/errors/transform-validation-error-into-detail';

@ApiTags('users')
@ApiController('users')
export class AppApiUsersController {
  public constructor(
    private readonly firebaseAuthService: FirebaseAuthService,
    private readonly userQueryService: UserQueryService,
    private readonly userCommandService: UserCommandService,

    private readonly deleteUserService: DeleteUserService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user based on the firebase ID token' })
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateUserInputDto })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: UserResponseDto })
  @ApiStandardResponses()
  @Public()
  public async createUser(
    @BearerToken() token: string | undefined,
    @Body() dto: CreateUserInputDto,
  ): Promise<UserResponseDto> {
    if (typeof token !== 'string') {
      throw new ApiError('AP0401', 'Authentication token is required');
    }

    const {
      uid,
      email_verified: emailVerified,
      firebase: { sign_in_provider: signInProvider },
    } = await this.firebaseAuthService.verifyIdToken(token);

    if (!(emailVerified === true || isProviderAllowed(signInProvider))) {
      throw new ApiError('AP0403', 'Email verification required');
    }

    const existingUser = await this.userQueryService.findUniqueUserByFirebaseUid(uid);
    if (existingUser !== null) {
      return existingUser;
    }

    const createUserInputDto = plainToInstance(CreateUserInputDto, { firebaseUid: uid, name: dto.name });
    const errors = validateSync(createUserInputDto, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length > NON_ERROR_LENGTH) {
      throw new ApiError('AP0422', transformValidationErrorIntoDetail(errors) || 'Invalid user data');
    }

    const createdUser = await this.userCommandService.createUser(createUserInputDto);
    return createdUser;
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user information', type: UserResponseDto })
  @ApiStandardResponses()
  public fetchCurrentUser(@CurrentUser() user: CurrentUserData): Promise<UserResponseDto> {
    return this.userQueryService.findUniqueOrThrowUserById({ publicId: user.publicId });
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateUserDataDto })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiStandardResponses()
  public async updateCurrentUserProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() data: UpdateUserDataDto,
  ): Promise<UserResponseDto> {
    return this.userCommandService.updateUserById({ publicId: user.publicId, data });
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user (Firebase + DB)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiStandardResponses()
  public async deleteCurrentUser(@CurrentUser() user: CurrentUserData): Promise<void> {
    await this.deleteUserService.execute(user.publicId);
  }

  @Get(':publicId')
  @ApiOperation({ summary: 'Get a user by public ID' })
  @ApiParam({ name: 'publicId', description: 'User public ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiStandardResponses()
  public async fetchUserById(@Param('publicId', new ParseUUIDPipe()) publicId: string): Promise<UserResponseDto> {
    return this.userQueryService.findUniqueOrThrowUserById({ publicId });
  }
}
