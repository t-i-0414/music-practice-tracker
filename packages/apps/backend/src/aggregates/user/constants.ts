import { type UserStatus as UserStatusEnumType } from '@/generated/prisma';

export const MAX_NAME_LENGTH = 50;
export const MAX_EMAIL_LENGTH = 255;

type UserStatusRecord = {
  [key in UserStatusEnumType]: key;
};
export const UserStatusRecord: UserStatusRecord = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
  BANNED: 'BANNED',
};
export type UserStatusType = keyof typeof UserStatusRecord;
