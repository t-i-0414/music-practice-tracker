import { type AdminRole as AdminRoleEnumType, type AdminStatus as AdminStatusEnumType } from '@/generated/prisma';

export type { AdminUser, AdminRole as AdminRoleEnumType, AdminStatus as AdminStatusEnumType } from '@/generated/prisma';

export const MAX_NAME_LENGTH = 50;
export const MAX_EMAIL_LENGTH = 255;

type AdminRoleRecord = {
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
export type AdminRoleType = keyof typeof AdminRoleRecord;

type AdminStatusRecord = {
  [key in AdminStatusEnumType]: key;
};
export const AdminStatusRecord: AdminStatusRecord = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
};
export type AdminStatusType = keyof typeof AdminStatusRecord;
