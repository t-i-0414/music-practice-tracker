import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UserQueryService } from '@/aggregates/user/query.service';
import { Prisma, User, UserAuthToken } from '@/generated/prisma';
import { RepositoryService } from '@/repository/service';

@Injectable()
export class UserAuthTokenQueryService {
  public constructor(
    private readonly repository: RepositoryService,
    private readonly userQueryService: UserQueryService,
  ) {}

  // Query service methods
  public async findAuthTokenByTokenOrFail(token: string): Promise<UserAuthToken> {
    const authToken = await this.findUniqueAuthTokenByToken(token);

    if (!authToken) {
      throw new UnauthorizedException('Invalid token');
    }

    if (authToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Token expired');
    }

    return authToken;
  }

  public async findRefreshTokenByTokenOrFail(token: string): Promise<UserAuthToken & { user: User }> {
    const authToken = await this.findUniqueAuthTokenByTokenWithUser(token);

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
    const user = await this.userQueryService.findUniqueUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  public async findUserByOAuthProvider(provider: 'google' | 'apple', providerId: string): Promise<User | null> {
    return this.userQueryService.findFirstUserByOAuthProvider(provider, providerId);
  }

  public async validateUserPassword(user: { passwordHash: string | null }, password: string): Promise<boolean> {
    if (user.passwordHash === null || user.passwordHash === '') {
      return false;
    }

    const bcrypt = await import('bcrypt');
    return bcrypt.compare(password, user.passwordHash);
  }

  public async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.userQueryService.findUniqueUserByEmail(email);
    return !!user;
  }

  public async getUserActiveRefreshTokens(userPublicId: string): Promise<UserAuthToken[]> {
    const tokens = await this.findManyAuthTokensByUserId(userPublicId);

    return tokens.filter((token) => token.type === 'REFRESH' && token.expiresAt > new Date());
  }

  // Repository methods
  public async findUniqueAuthToken(params: Prisma.UserAuthTokenWhereUniqueInput): Promise<UserAuthToken | null> {
    return this.repository.userAuthToken.findUnique({
      where: {
        ...params,
      },
    });
  }

  public async findUniqueAuthTokenByToken(token: string): Promise<UserAuthToken | null> {
    return this.repository.userAuthToken.findUnique({
      where: { token },
    });
  }

  public async findUniqueAuthTokenByTokenWithUser(token: string): Promise<(UserAuthToken & { user: User }) | null> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return this.repository.userAuthToken.findUnique({
      where: { token },
      include: { user: true },
    }) as Promise<(UserAuthToken & { user: User }) | null>;
  }

  public async findManyAuthTokensByUserId(userPublicId: string): Promise<UserAuthToken[]> {
    return this.repository.userAuthToken.findMany({
      where: { userPublicId },
    });
  }
}
