import { faker } from '@faker-js/faker';

import { type UserResponseDto } from '@/modules/aggregate/user/user.response.dto';

export function buildUserResponseDto(overrides?: Partial<UserResponseDto>): UserResponseDto {
  const date = new Date();

  return {
    publicId: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    status: 'ACTIVE',
    createdAt: date,
    updatedAt: date,
    ...overrides,
  };
}
