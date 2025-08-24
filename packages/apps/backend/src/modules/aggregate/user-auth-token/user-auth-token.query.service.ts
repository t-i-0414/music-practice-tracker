import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserAuthTokenRepositoryService, type UserAuthToken } from './user-auth-token.repository.service';

import { UserRepositoryService, type User } from '@/modules/aggregate/user/user.repository.service';

@Injectable()
export class UserAuthTokenQueryService {
  public constructor(
    private readonly authRepository: UserAuthTokenRepositoryService,
    private readonly userRepository: UserRepositoryService,
  ) {}

  public async findAuthTokenByTokenOrFail(token: string): Promise<UserAuthToken> {
    const authToken = await this.authRepository.findUniqueAuthTokenByToken(token);

    if (!authToken) {
      throw new UnauthorizedException('Invalid token');
    }

    if (authToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Token expired');
    }

    return authToken;
  }

  public async findRefreshTokenByTokenOrFail(token: string): Promise<UserAuthToken & { user: User }> {
    const authToken = await this.authRepository.findUniqueAuthTokenByTokenWithUser(token);

    if (!authToken) {
      throw new UnauthorizedException('Invalid token');
    }

    if (authToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Token expired');
    }

    if (authToken.type !== 'REFRESH') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return authToken;
  }

  public async findUserByEmailOrFail(email: string): Promise<User> {
    const user = await this.userRepository.findUniqueUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  public async findUserByOAuthProvider(provider: 'google' | 'apple', providerId: string): Promise<User | null> {
    return this.userRepository.findFirstUserByOAuthProvider(provider, providerId);
  }

  public async validateUserPassword(user: { passwordHash: string | null }, password: string): Promise<boolean> {
    if (user.passwordHash === null || user.passwordHash === '') {
      return false;
    }

    const bcrypt = await import('bcrypt');
    return bcrypt.compare(password, user.passwordHash);
  }

  public async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.userRepository.findUniqueUserByEmail(email);
    return !!user;
  }

  public async getUserActiveRefreshTokens(userPublicId: string): Promise<UserAuthToken[]> {
    const tokens = await this.authRepository.findManyAuthTokensByUserId(userPublicId);

    return tokens.filter((token) => token.type === 'REFRESH' && token.expiresAt > new Date());
  }
}
