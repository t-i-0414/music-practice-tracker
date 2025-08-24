import { Injectable } from '@nestjs/common';

import { UserAuthTokenCommandService } from './user-auth-token.command.service';
import {
  SignUpInputDto,
  SignInInputDto,
  RefreshTokenInputDto,
  ChangePasswordInputDto,
  OAuthSignInInputDto,
} from './user-auth-token.input.dto';
import { UserAuthTokenQueryService } from './user-auth-token.query.service';
import { AuthTokenResponseDto } from './user-auth-token.response.dto';

@Injectable()
export class UserAuthTokenAppFacadeService {
  public constructor(
    private readonly authCommand: UserAuthTokenCommandService,
    private readonly authQuery: UserAuthTokenQueryService,
  ) {}

  public async signUp(input: SignUpInputDto): Promise<AuthTokenResponseDto> {
    const tokens = await this.authCommand.signUp({
      email: input.email,
      password: input.password,
      name: input.name,
    });

    return new AuthTokenResponseDto(tokens);
  }

  public async signIn(input: SignInInputDto): Promise<AuthTokenResponseDto> {
    const tokens = await this.authCommand.signIn({
      email: input.email,
      password: input.password,
    });

    return new AuthTokenResponseDto(tokens);
  }

  public async signInWithOAuth(input: OAuthSignInInputDto): Promise<AuthTokenResponseDto> {
    const tokens = await this.authCommand.signInWithOAuth({
      provider: input.provider,
      providerId: input.providerId,
      email: input.email,
      name: input.name,
    });

    return new AuthTokenResponseDto(tokens);
  }

  public async refreshToken(input: RefreshTokenInputDto): Promise<AuthTokenResponseDto> {
    const tokens = await this.authCommand.refreshTokens(input.refreshToken);

    return new AuthTokenResponseDto(tokens);
  }

  public async signOut(refreshToken: string): Promise<void> {
    await this.authCommand.signOut(refreshToken);
  }

  public async changePassword(userPublicId: string, input: ChangePasswordInputDto): Promise<AuthTokenResponseDto> {
    const tokens = await this.authCommand.changePassword(userPublicId, input.currentPassword, input.newPassword);

    return new AuthTokenResponseDto(tokens);
  }
}
