import { randomBytes } from 'crypto';

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserCommandService } from '@/aggregates/user/command.service';
import { UserStatusRecord } from '@/aggregates/user/constants';
import { UserQueryService } from '@/aggregates/user/query.service';
import { UserAuthTokenCommandService } from '@/aggregates/user-auth-token/command.service';
import { USER_AUTH_TOKEN_CONSTANTS, UserAuthTokenRecord } from '@/aggregates/user-auth-token/constants';
import { UserAuthTokenQueryService } from '@/aggregates/user-auth-token/query.service';

@Injectable()
export class AppAuthUseCaseService {
  public constructor(
    private readonly userCommand: UserCommandService,
    private readonly userQuery: UserQueryService,
    private readonly authCommand: UserAuthTokenCommandService,
    private readonly authQuery: UserAuthTokenQueryService,
    private readonly jwtService: JwtService,
  ) {}

  public async signUp(params: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const { email, password, name } = params;

    const emailTaken = await this.isEmailTaken(email);
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
    const user = await this.findUserByEmailOrFail(email);

    const isValidPassword = await this.validateUserPassword(user, password);
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
    let user = await this.findUserByOAuthProvider(provider, providerId);

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

    await this.authCommand.deleteAuthToken(authToken.publicId);

    return this.generateTokens(authToken.user.publicId);
  }

  public async signOut(refreshToken: string): Promise<void> {
    try {
      const authToken = await this.authQuery.findRefreshTokenByTokenOrFail(refreshToken);
      await this.authCommand.deleteManyUserTokens(authToken.userPublicId, { equals: UserAuthTokenRecord.REFRESH });
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

    const isValidPassword = await this.validateUserPassword(user, currentPassword);
    if (!isValidPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.userCommand.updateUserPassword(userPublicId, passwordHash);
    await this.authCommand.deleteManyUserTokens(userPublicId, { equals: UserAuthTokenRecord.REFRESH });

    return this.generateTokens(user.publicId);
  }

  private async generateTokens(
    userPublicId: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload = { sub: userPublicId };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + USER_AUTH_TOKEN_CONSTANTS.JWT.REFRESH_TOKEN_EXPIRY_DAYS);

    await this.authCommand.createAuthToken({
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
      expiresIn: 900,
    };
  }

  private async findUserByEmailOrFail(email: string) {
    const user = await this.userQuery.findUniqueUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private async findUserByOAuthProvider(provider: 'google' | 'apple', providerId: string) {
    return this.userQuery.findFirstUserByOAuthProvider(provider, providerId);
  }

  private async validateUserPassword(user: { passwordHash: string | null }, password: string): Promise<boolean> {
    if (user.passwordHash === null || user.passwordHash === '') {
      return false;
    }

    const bcrypt = await import('bcrypt');
    return bcrypt.compare(password, user.passwordHash);
  }

  private async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.userQuery.findUniqueUserByEmail(email);
    return !!user;
  }
}
