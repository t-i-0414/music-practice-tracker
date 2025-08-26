import type { UserStatus } from '@/generated/prisma';

export type { User, UserStatus as UserStatusEnumType } from '@/generated/prisma';

export const MAX_NAME_LENGTH = 50;
export const MAX_EMAIL_LENGTH = 255;

type UserStatusRecord = {
  [key in UserStatus]: key;
};
export const UserStatusRecord: UserStatusRecord = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
  BANNED: 'BANNED',
};
export type UserStatusType = keyof typeof UserStatusRecord;
