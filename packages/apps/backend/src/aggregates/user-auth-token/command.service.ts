import { Injectable } from '@nestjs/common';

import { Prisma, UserAuthToken } from '@/generated/prisma';
import { RepositoryService } from '@/repository/service';

@Injectable()
export class UserAuthTokenCommandService {
  public constructor(private readonly repository: RepositoryService) {}

  public async cleanupExpiredTokens(): Promise<{ count: number }> {
    await this.deleteManyExpiredTokens();
    return { count: 0 };
  }

  // Repository methods
  public async createUserAuthToken(params: Prisma.UserAuthTokenCreateInput): Promise<UserAuthToken> {
    return this.repository.userAuthToken.create({
      data: params,
    });
  }

  public async createAuthToken(params: Prisma.UserAuthTokenCreateInput): Promise<UserAuthToken> {
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
}
