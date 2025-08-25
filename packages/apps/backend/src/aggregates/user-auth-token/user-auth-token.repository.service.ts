import { Injectable } from '@nestjs/common';

import { Prisma, UserAuthToken, User } from '@/generated/prisma';
import { RepositoryService } from '@/repository/repository.service';
export type { UserAuthToken, TokenType as UserAuthTokenEnumType } from '@/generated/prisma';

@Injectable()
export class UserAuthTokenRepositoryService {
  public constructor(private readonly repository: RepositoryService) {}

  public async findUniqueAuthToken(params: Prisma.UserAuthTokenWhereUniqueInput): Promise<UserAuthToken | null> {
    return this.repository.userAuthToken.findUnique({
      where: {
        ...params,
      },
    });
  }

  public async createUserAuthToken(params: Prisma.UserAuthTokenCreateInput): Promise<UserAuthToken> {
    return this.repository.userAuthToken.create({
      data: params,
    });
  }

  public async updateUserAuthToken(params: {
    where: Prisma.UserAuthTokenWhereUniqueInput;
    data: Prisma.UserAuthTokenUpdateInput;
  }): Promise<UserAuthToken> {
    const { where, data } = params;
    return this.repository.userAuthToken.update({
      data: {
        ...data,
      },
      where: {
        ...where,
      },
    });
  }

  public async deleteUserAuthToken(params: Prisma.UserAuthTokenWhereUniqueInput): Promise<void> {
    await this.repository.userAuthToken.delete({
      where: params,
    });
  }

  public async deleteAuthToken(publicId: string): Promise<void> {
    await this.repository.userAuthToken.delete({
      where: { publicId },
    });
  }

  public async deleteManyUserTokens(userPublicId: string, type?: Prisma.EnumTokenTypeFilter): Promise<void> {
    await this.repository.userAuthToken.deleteMany({
      where: {
        userPublicId,
        type,
      },
    });
  }

  public async deleteManyExpiredTokens(): Promise<void> {
    await this.repository.userAuthToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
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

  public async createAuthToken(params: Prisma.UserAuthTokenCreateInput): Promise<UserAuthToken> {
    return this.repository.userAuthToken.create({
      data: params,
    });
  }
}
