import type { AdminUserPublicId, CognitoSub, FirebaseUid, UserPublicId } from './branded';

import { DomainError } from '@/domain/utils/domain.error';

const UUID_REGEX = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu;
const EMPTY_LENGTH = 0;

export function toUserPublicId(value: string): UserPublicId {
  if (!UUID_REGEX.test(value)) {
    throw new DomainError('DO0001', `Invalid User publicId format: ${value}`);
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion -- branded type narrowing after validation
  return value as UserPublicId;
}

export function toAdminUserPublicId(value: string): AdminUserPublicId {
  if (!UUID_REGEX.test(value)) {
    throw new DomainError('DO0001', `Invalid AdminUser publicId format: ${value}`);
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion -- branded type narrowing after validation
  return value as AdminUserPublicId;
}

export function toFirebaseUid(value: string): FirebaseUid {
  if (value.length === EMPTY_LENGTH) {
    throw new DomainError('DO0001', 'FirebaseUid must not be empty.');
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion -- branded type narrowing after validation
  return value as FirebaseUid;
}

export function toCognitoSub(value: string): CognitoSub {
  if (value.length === EMPTY_LENGTH) {
    throw new DomainError('DO0001', 'CognitoSub must not be empty.');
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion -- branded type narrowing after validation
  return value as CognitoSub;
}
