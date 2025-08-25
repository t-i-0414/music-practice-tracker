import { Body, Post, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { UserAuthTokenCommandService } from '@/aggregates/user-auth-token/user-auth-token.command.service';
import {
  SignUpInputDto,
  SignInInputDto,
  RefreshTokenInputDto,
  ChangePasswordInputDto,
  OAuthSignInInputDto,
} from '@/aggregates/user-auth-token/user-auth-token.input.dto';
import { AuthTokenResponseDto } from '@/aggregates/user-auth-token/user-auth-token.response.dto';
import { ApiController } from '@/decorators/api-controller.decorator';
import { CurrentUser, CurrentUserData } from '@/decorators/current-user.decorator';
import { Public } from '@/decorators/public.decorator';
import { AppAuthGuard } from '@/guards/app-auth-guard/guard';

@ApiTags('auth')
@ApiController('auth')
@UseGuards(AppAuthGuard)
export class AppAuthController {
  public constructor(private readonly authCommand: UserAuthTokenCommandService) {}

  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sign up with email and password' })
  @ApiBody({ type: SignUpInputDto })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: AuthTokenResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  public async signUp(@Body() body: SignUpInputDto): Promise<AuthTokenResponseDto> {
    const tokens = await this.authCommand.signUp({
      email: body.email,
      password: body.password,
      name: body.name,
    });
    return new AuthTokenResponseDto(tokens);
  }

  @Post('signin')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: SignInInputDto })
  @ApiResponse({ status: 200, description: 'Successfully signed in', type: AuthTokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  public async signIn(@Body() body: SignInInputDto): Promise<AuthTokenResponseDto> {
    const tokens = await this.authCommand.signIn({
      email: body.email,
      password: body.password,
    });
    return new AuthTokenResponseDto(tokens);
  }

  @Post('oauth/signin')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with OAuth provider' })
  @ApiBody({ type: OAuthSignInInputDto })
  @ApiResponse({ status: 200, description: 'Successfully signed in', type: AuthTokenResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  public async signInWithOAuth(@Body() body: OAuthSignInInputDto): Promise<AuthTokenResponseDto> {
    const tokens = await this.authCommand.signInWithOAuth({
      provider: body.provider,
      providerId: body.providerId,
      email: body.email,
      name: body.name,
    });
    return new AuthTokenResponseDto(tokens);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenInputDto })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: AuthTokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  public async refreshToken(@Body() body: RefreshTokenInputDto): Promise<AuthTokenResponseDto> {
    const tokens = await this.authCommand.refreshTokens(body.refreshToken);
    return new AuthTokenResponseDto(tokens);
  }

  @Post('signout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out and invalidate tokens' })
  @ApiBody({ schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } })
  @ApiResponse({ status: 204, description: 'Successfully signed out' })
  public async signOut(@Body('refreshToken') refreshToken: string): Promise<void> {
    await this.authCommand.signOut(refreshToken);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordInputDto })
  @ApiResponse({ status: 200, description: 'Password changed successfully', type: AuthTokenResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async changePassword(
    @CurrentUser() user: CurrentUserData,
    @Body() body: ChangePasswordInputDto,
  ): Promise<AuthTokenResponseDto> {
    const tokens = await this.authCommand.changePassword(user.publicId, body.currentPassword, body.newPassword);
    return new AuthTokenResponseDto(tokens);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'Current user info' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public getCurrentUser(@CurrentUser() user: CurrentUserData): CurrentUserData {
    return user;
  }
}
