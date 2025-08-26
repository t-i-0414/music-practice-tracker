import { randomBytes } from 'crypto';

import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { USER_AUTH_TOKEN_CONSTANTS, UserAuthTokenRecord } from './constants';
import { UserAuthTokenQueryService } from './query.service';

import { UserCommandService } from '@/aggregates/user/command.service';
import { UserStatusRecord } from '@/aggregates/user/constants';
import { UserQueryService } from '@/aggregates/user/query.service';
import { Prisma, UserAuthToken } from '@/generated/prisma';
import { RepositoryService } from '@/repository/service';

@Injectable()
export class UserAuthTokenCommandService {
  public constructor(
    private readonly repository: RepositoryService,
    private readonly authQuery: UserAuthTokenQueryService,
    private readonly userCommand: UserCommandService,
    private readonly userQuery: UserQueryService,
    private readonly jwtService: JwtService,
  ) {}

  public async signUp(params: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const { email, password, name } = params;
    const emailTaken = await this.authQuery.isEmailTaken(email);
    if (emailTaken) {
      throw new BadRequestException('Email already registered');
    }

    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.userCommand.createUserWithOAuth({
      email,
      name,
      passwordHash,
      status: UserStatusRecord.ACTIVE,
    });

    return this.generateTokens(user.publicId);
  }

  public async signIn(params: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const { email, password } = params;
    const user = await this.authQuery.findUserByEmailOrFail(email);

    const isValidPassword = await this.authQuery.validateUserPassword(user, password);
    if (!isValidPassword) {
      throw new BadRequestException('Invalid credentials');
    }

    if (user.status !== UserStatusRecord.ACTIVE) {
      throw new BadRequestException('Account is not active');
    }

    return this.generateTokens(user.publicId);
  }

  public async signInWithOAuth(params: {
    provider: 'google' | 'apple';
    providerId: string;
    email: string;
    name: string;
  }): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const { provider, providerId, email, name } = params;
    let user = await this.authQuery.findUserByOAuthProvider(provider, providerId);

    if (!user) {
      const existingUser = await this.userQuery.findUniqueUserByEmail(email);

      if (existingUser) {
        await this.userCommand.updateOAuthProvider(existingUser.publicId, provider, providerId);
        user = existingUser;
      } else {
        const createData = {
          email,
          name,
          status: UserStatusRecord.ACTIVE,
          googleId: provider === 'google' ? providerId : null,
          appleId: provider === 'apple' ? providerId : null,
        };

        user = await this.userCommand.createUserWithOAuth(createData);
      }
    }

    if (user.status !== UserStatusRecord.ACTIVE) {
      throw new BadRequestException('Account is not active');
    }

    return this.generateTokens(user.publicId);
  }

  public async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const authToken = await this.authQuery.findRefreshTokenByTokenOrFail(refreshToken);

    await this.deleteAuthToken(authToken.publicId);

    return this.generateTokens(authToken.user.publicId);
  }

  public async signOut(refreshToken: string): Promise<void> {
    try {
      const authToken = await this.authQuery.findRefreshTokenByTokenOrFail(refreshToken);
      await this.deleteManyUserTokens(authToken.userPublicId, { equals: UserAuthTokenRecord.REFRESH });
    } catch {
      // Silently fail if token is invalid
    }
  }

  public async changePassword(
    userPublicId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const user = await this.userQuery.findUniqueUser({ publicId: userPublicId });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isValidPassword = await this.authQuery.validateUserPassword(user, currentPassword);
    if (!isValidPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.userCommand.updateUserPassword(userPublicId, passwordHash);
    await this.deleteManyUserTokens(userPublicId, { equals: UserAuthTokenRecord.REFRESH });

    return this.generateTokens(user.publicId);
  }

  public async cleanupExpiredTokens(): Promise<{ count: number }> {
    await this.deleteManyExpiredTokens();
    return { count: 0 }; // Prisma deleteMany doesn't return count in this version
  }

  private async generateTokens(
    userPublicId: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload = { sub: userPublicId };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + USER_AUTH_TOKEN_CONSTANTS.JWT.REFRESH_TOKEN_EXPIRY_DAYS);

    await this.createAuthToken({
      token: refreshToken,
      type: UserAuthTokenRecord.REFRESH,
      expiresAt,
      user: {
        connect: { publicId: userPublicId },
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
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
