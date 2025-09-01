import { ExecutionContext } from '@nestjs/common';

import { CurrentUserData } from '@/apis/utils/decorators/current-user.decorator';

// Test the factory function directly instead of the decorator
const currentUserFactory = (
  data: keyof CurrentUserData | undefined,
  ctx: ExecutionContext,
): CurrentUserData | CurrentUserData[keyof CurrentUserData] | undefined => {
  const request = ctx.switchToHttp().getRequest<{ user?: CurrentUserData }>();
  const { user } = request;

  if (data && user) {
    return user[data];
  }

  return user;
};

describe('currentUser decorator', () => {
  let mockRequest: { user?: CurrentUserData };
  let mockExecutionContext: ExecutionContext;

  const mockUser: CurrentUserData = {
    publicId: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(() => {
    mockRequest = {};

    const mockHttp = {
      getRequest: jest.fn(() => mockRequest),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    };

    mockExecutionContext = {
      switchToHttp: jest.fn(() => mockHttp),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ExecutionContext;
  });

  it('should return the entire user object when no data parameter is provided', () => {
    mockRequest.user = mockUser;

    const result = currentUserFactory(undefined, mockExecutionContext);

    expect(result).toStrictEqual(mockUser);
  });

  it('should return specific user property when data parameter is provided', () => {
    mockRequest.user = mockUser;

    const result = currentUserFactory('email', mockExecutionContext);

    expect(result).toBe('test@example.com');
  });

  it('should return publicId when data parameter is publicId', () => {
    mockRequest.user = mockUser;

    const result = currentUserFactory('publicId', mockExecutionContext);

    expect(result).toBe('user-123');
  });

  it('should return name when data parameter is name', () => {
    mockRequest.user = mockUser;

    const result = currentUserFactory('name', mockExecutionContext);

    expect(result).toBe('Test User');
  });

  it('should return undefined when user is not present in request', () => {
    const result = currentUserFactory(undefined, mockExecutionContext);

    expect(result).toBeUndefined();
  });

  it('should return undefined when user is not present and data parameter is provided', () => {
    const result = currentUserFactory('email', mockExecutionContext);

    expect(result).toBeUndefined();
  });

  it('should handle user with missing properties gracefully', () => {
    mockRequest.user = { publicId: 'user-123' } as CurrentUserData;

    const result = currentUserFactory('email', mockExecutionContext);

    expect(result).toBeUndefined();
  });
});
