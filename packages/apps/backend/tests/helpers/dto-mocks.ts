export const mockResponseDtoTransformers = {
  toActiveUserDto: jest.fn(),
  toDeletedUserDto: jest.fn(),
  toAnyUserDto: jest.fn(),
  toActiveUsersDto: jest.fn(),
  toDeletedUsersDto: jest.fn(),
  toAnyUsersDto: jest.fn(),
};

export function setupResponseDtoMocks(): typeof mockResponseDtoTransformers {
  jest.mock('@/modules/aggregate/user/user.response.dto', () => {
    const actual = jest.requireActual('@/modules/aggregate/user/user.response.dto');
    return {
      ...actual,
      ...mockResponseDtoTransformers,
    };
  });

  return mockResponseDtoTransformers;
}

export function resetResponseDtoMocks(): void {
  Object.values(mockResponseDtoTransformers).forEach((mock) => {
    mock.mockReset();
  });
}
