import { type AdminRoleEnumType, type AdminStatusEnumType } from './admin-user.repository.service';

export const MAX_NAME_LENGTH = 50;
export const MAX_EMAIL_LENGTH = 255;

export type AdminRoleRecord = {
  [key in AdminRoleEnumType]: key;
};
export const AdminRoleRecord: AdminRoleRecord = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  MODERATOR: 'MODERATOR',
  ANALYST: 'ANALYST',
  VIEWER: 'VIEWER',
};
export type AdminRoleType = (typeof AdminRoleRecord)[keyof typeof AdminRoleRecord];

export type AdminStatusRecord = {
  [key in AdminStatusEnumType]: key;
};
export const AdminStatusRecord: AdminStatusRecord = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
};
export type AdminStatusType = (typeof AdminStatusRecord)[keyof typeof AdminStatusRecord];
