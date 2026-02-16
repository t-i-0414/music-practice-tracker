import type { AdminUserPublicId, Brand, CognitoSub, FirebaseUid, UserPublicId } from './branded';

import { DomainError } from '@/domain/utils/domain.error';

const UUID_REGEX = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu;

function validateUuid<T extends Brand<string, string>>(value: string, label: string): T {
  if (!UUID_REGEX.test(value)) {
    throw new DomainError('DO0004', `Invalid ${label} publicId format: ${value}`);
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion -- branded type assertion is safe because runtime validation precedes it
  return value as T;
}

function validateNonEmpty<T extends Brand<string, string>>(value: string, label: string): T {
  if (value.trim() === '') {
    throw new DomainError('DO0001', `${label} must not be empty.`);
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion -- branded type assertion is safe because runtime validation precedes it
  return value as T;
}

export function toUserPublicId(value: string): UserPublicId {
  return validateUuid<UserPublicId>(value, 'User');
}

export function toAdminUserPublicId(value: string): AdminUserPublicId {
  return validateUuid<AdminUserPublicId>(value, 'AdminUser');
}

export function toFirebaseUid(value: string): FirebaseUid {
  return validateNonEmpty<FirebaseUid>(value, 'FirebaseUid');
}

export function toCognitoSub(value: string): CognitoSub {
  return validateNonEmpty<CognitoSub>(value, 'CognitoSub');
}
