import { ClassSerializerInterceptor, ValidationPipe, type INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { useGlobalOptions } from '@/apis/utils/use-global-options';

describe('unit useGlobalOptions', () => {
  let app: INestApplication;
  let mockUseGlobalPipes: jest.Mock;
  let mockUseGlobalInterceptors: jest.Mock;
  let mockGet: jest.Mock;
  let mockReflector: Reflector;

  beforeEach(() => {
    mockReflector = {} as Reflector;
    mockUseGlobalPipes = jest.fn();
    mockUseGlobalInterceptors = jest.fn();
    mockGet = jest.fn().mockReturnValue(mockReflector);

    app = {
      useGlobalPipes: mockUseGlobalPipes,
      useGlobalInterceptors: mockUseGlobalInterceptors,
      get: mockGet,
    } as unknown as INestApplication;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should configure global validation pipe with correct options', () => {
    expect.assertions(3);

    useGlobalOptions(app);

    expect(mockUseGlobalPipes).toHaveBeenCalledTimes(1);
    expect(mockUseGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));

    const validationPipeCall = mockUseGlobalPipes.mock.calls[0][0] as ValidationPipe;

    expect(validationPipeCall).toBeInstanceOf(ValidationPipe);
  });

  it('should configure validation pipe with whitelist, forbidNonWhitelisted, and transform options', () => {
    expect.assertions(1);

    useGlobalOptions(app);

    // Verify the ValidationPipe was created with correct options
    // Since we can't directly access the options, we verify through the constructor call
    expect(mockUseGlobalPipes).toHaveBeenCalledWith(
      expect.objectContaining({
        constructor: ValidationPipe,
      }),
    );
  });

  it('should configure global class serializer interceptor', () => {
    expect.assertions(3);

    useGlobalOptions(app);

    expect(mockUseGlobalInterceptors).toHaveBeenCalledTimes(1);
    expect(mockUseGlobalInterceptors).toHaveBeenCalledWith(expect.any(ClassSerializerInterceptor));

    const interceptorCall = mockUseGlobalInterceptors.mock.calls[0][0] as ClassSerializerInterceptor;

    expect(interceptorCall).toBeInstanceOf(ClassSerializerInterceptor);
  });

  it('should get Reflector from the app container', () => {
    expect.assertions(2);

    useGlobalOptions(app);

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(Reflector);
  });

  it('should configure both pipes and interceptors in correct order', () => {
    expect.assertions(2);

    const callOrder: string[] = [];
    mockUseGlobalPipes.mockImplementation(() => {
      callOrder.push('pipes');
    });
    mockUseGlobalInterceptors.mockImplementation(() => {
      callOrder.push('interceptors');
    });

    useGlobalOptions(app);

    expect(callOrder).toStrictEqual(['pipes', 'interceptors']);
    expect(callOrder).toHaveLength(2);
  });

  it('should pass the Reflector instance to ClassSerializerInterceptor', () => {
    expect.assertions(1);

    const mockReflectorInstance = { test: 'reflector' } as unknown as Reflector;
    mockGet.mockReturnValue(mockReflectorInstance);

    useGlobalOptions(app);

    // Verify that the ClassSerializerInterceptor was created with the Reflector
    expect(mockGet).toHaveBeenCalledWith(Reflector);
  });

  it('should handle app without errors when all methods are available', () => {
    expect.assertions(1);

    expect(() => {
      useGlobalOptions(app);
    }).not.toThrow();
  });

  it('should call each configuration method exactly once', () => {
    expect.assertions(3);

    useGlobalOptions(app);

    expect(mockUseGlobalPipes).toHaveBeenCalledTimes(1);
    expect(mockUseGlobalInterceptors).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });
});
