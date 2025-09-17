import {
  type AdminUser,
  type AdminRole as AdminRoleEnum,
  type AdminStatus as AdminStatusEnum,
} from '@/generated/prisma';

export type { AdminUser, AdminRoleEnum, AdminStatusEnum };

export const MAX_NAME_LENGTH = 50;
export const MAX_EMAIL_LENGTH = 255;

type AdminRoleRecord = {
  [key in AdminRoleEnum]: key;
};
export const AdminRoleRecord: AdminRoleRecord = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  MODERATOR: 'MODERATOR',
  ANALYST: 'ANALYST',
  VIEWER: 'VIEWER',
};
export type AdminRole = keyof typeof AdminRoleRecord;

type AdminStatusRecord = {
  [key in AdminStatusEnum]: key;
};
export const AdminStatusRecord: AdminStatusRecord = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED',
};
export type AdminStatus = keyof typeof AdminStatusRecord;
