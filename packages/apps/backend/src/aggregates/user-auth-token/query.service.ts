import { Injectable, UnauthorizedException } from '@nestjs/common';

import { Prisma, UserAuthToken } from '@/generated/prisma';
import { RepositoryService } from '@/repository/service';

@Injectable()
export class UserAuthTokenQueryService {
  public constructor(private readonly repository: RepositoryService) {}

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

  public async findRefreshTokenByTokenOrFail(token: string): Promise<UserAuthToken & { user: { publicId: string } }> {
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

  public async findUniqueAuthTokenByTokenWithUser(
    token: string,
  ): Promise<(UserAuthToken & { user: { publicId: string } }) | null> {
    return this.repository.userAuthToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  public async findManyAuthTokensByUserId(userPublicId: string): Promise<UserAuthToken[]> {
    return this.repository.userAuthToken.findMany({
      where: { userPublicId },
    });
  }
}
