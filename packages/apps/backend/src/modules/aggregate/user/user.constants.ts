import { type UserStatusEnumType } from './user.repository.service';

export const MAX_NAME_LENGTH = 50;
export const MAX_EMAIL_LENGTH = 255;

export type UserStatusRecord = {
  [key in UserStatusEnumType]: key;
};
export const UserStatusRecord: UserStatusRecord = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
  BANNED: 'BANNED',
};
export type UserStatusType = (typeof UserStatusRecord)[keyof typeof UserStatusRecord];
