import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

import { CurrentUser, CurrentUserData } from '@/apis/app/utils/decorators/current-user.decorator';

type ParamDecorator = (data?: any, ctx?: any) => ParameterDecorator;

const getParamDecoratorFactory = (decorator: ParamDecorator) => {
  class Test {
    public test(@decorator() user: any) {
      return user;
    }
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  return args[Object.keys(args)[0]].factory;
};

describe('currentUser decorator', () => {
  let mockRequest: { user?: CurrentUserData };
  let mockExecutionContext: ExecutionContext;
  let decoratorFactory: any;

  const mockUser: CurrentUserData = {
    publicId: 'user-123',
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

    decoratorFactory = getParamDecoratorFactory(CurrentUser);
  });

  it('should return the entire user object when no data parameter is provided', () => {
    mockRequest.user = mockUser;

    const result = decoratorFactory(undefined, mockExecutionContext);

    expect(result).toStrictEqual(mockUser);
  });

  it('should return specific user property when data parameter is provided', () => {
    mockRequest.user = mockUser;

    const result = decoratorFactory('name', mockExecutionContext);

    expect(result).toBe('Test User');
  });

  it('should return publicId when data parameter is publicId', () => {
    mockRequest.user = mockUser;

    const result = decoratorFactory('publicId', mockExecutionContext);

    expect(result).toBe('user-123');
  });

  it('should return name when data parameter is name', () => {
    mockRequest.user = mockUser;

    const result = decoratorFactory('name', mockExecutionContext);

    expect(result).toBe('Test User');
  });

  it('should return undefined when user is not present in request', () => {
    const result = decoratorFactory(undefined, mockExecutionContext);

    expect(result).toBeUndefined();
  });

  it('should return undefined when user is not present and data parameter is provided', () => {
    const result = decoratorFactory('name', mockExecutionContext);

    expect(result).toBeUndefined();
  });

  it('should handle user with missing properties gracefully', () => {
    mockRequest.user = { publicId: 'user-123' } as CurrentUserData;

    const result = decoratorFactory('name', mockExecutionContext);

    expect(result).toBeUndefined();
  });
});
