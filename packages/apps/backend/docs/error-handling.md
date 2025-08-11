# Backend Error Handling

## Overview

This document outlines the error handling strategy for the NestJS backend, including exception types, error responses, logging, and recovery mechanisms.

## Error Types

### Built-in NestJS Exceptions

```typescript
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnprocessableEntityException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';

// Usage examples
throw new NotFoundException('User not found');
throw new BadRequestException('Invalid input data');
throw new UnauthorizedException('Invalid credentials');
throw new ForbiddenException('Access denied');
throw new ConflictException('Email already exists');
```

### Custom Exceptions

```typescript
// Custom business exception
export class BusinessRuleException extends HttpException {
  constructor(message: string, code: string) {
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message,
        code,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

// Domain-specific exceptions
export class InsufficientPermissionsException extends ForbiddenException {
  constructor(resource: string, action: string) {
    super(`Insufficient permissions to ${action} ${resource}`);
  }
}

export class ResourceLockedException extends ConflictException {
  constructor(resource: string) {
    super(`Resource ${resource} is currently locked`);
  }
}
```

## Global Exception Filter

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = exceptionResponse['message'] || message;
        code = exceptionResponse['code'] || code;
        details = exceptionResponse['details'];
      } else {
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    }

    const errorResponse = {
      statusCode: status,
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId: request.headers['x-correlation-id'],
    };

    // Log error details
    this.logger.error(`Error ${status}: ${message}`, {
      ...errorResponse,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json(errorResponse);
  }
}
```

## Validation Errors

### DTO Validation

```typescript
import { ValidationPipe, BadRequestException } from '@nestjs/common';

// Global validation pipe configuration
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    exceptionFactory: (errors) => {
      const messages = errors.map((error) => ({
        field: error.property,
        constraints: error.constraints,
        children: error.children,
      }));

      return new BadRequestException({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: messages,
      });
    },
  }),
);
```

### Custom Validators

```typescript
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isValidEmail', async: true })
@Injectable()
export class EmailValidator implements ValidatorConstraintInterface {
  constructor(private userService: UserService) {}

  async validate(email: string): Promise<boolean> {
    const user = await this.userService.findByEmail(email);
    return !user; // Email should not exist
  }

  defaultMessage(): string {
    return 'Email already exists';
  }
}
```

## Database Errors

### Prisma Error Handling

```typescript
import { Prisma } from '@prisma/client';

export class PrismaErrorHandler {
  static handle(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new ConflictException(
            `Unique constraint violation on ${error.meta?.target}`,
          );
        case 'P2025':
          throw new NotFoundException('Record not found');
        case 'P2003':
          throw new BadRequestException(
            `Foreign key constraint violation: ${error.meta?.field_name}`,
          );
        case 'P2014':
          throw new ConflictException(
            `The change would violate a relation: ${error.meta?.relation_name}`,
          );
        default:
          throw new InternalServerErrorException(
            `Database error: ${error.code}`,
          );
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new BadRequestException('Invalid database query');
    }

    throw error;
  }
}

// Usage in repository
async createUser(data: CreateUserDto): Promise<User> {
  try {
    return await this.prisma.user.create({ data });
  } catch (error) {
    PrismaErrorHandler.handle(error);
  }
}
```

## Service Layer Error Handling

### Query Service Pattern

```typescript
@Injectable()
export class UserQueryService {
  constructor(private readonly repository: UserRepositoryService) {}

  async findUserByIdOrFail(dto: FindUserByIdInputDto): Promise<User> {
    const user = await this.repository.findUniqueActiveUser({
      publicId: dto.publicId,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.publicId} not found`);
    }

    return user;
  }

  async findManyUsersOrFail(dto: FindManyUsersInputDto): Promise<User[]> {
    const users = await this.repository.findManyActiveUsers(dto);

    if (users.length === 0) {
      throw new NotFoundException('No users found matching criteria');
    }

    return users;
  }
}
```

### Command Service Pattern

```typescript
@Injectable()
export class UserCommandService {
  constructor(
    private readonly repository: UserRepositoryService,
    private readonly queryService: UserQueryService,
  ) {}

  async updateUserById(dto: UpdateUserInputDto): Promise<User> {
    // Verify user exists (throws NotFoundException if not)
    await this.queryService.findUserByIdOrFail({
      publicId: dto.publicId,
    });

    try {
      const updated = await this.repository.updateUser({
        where: { publicId: dto.publicId },
        data: dto.data,
      });

      if (!updated) {
        throw new InternalServerErrorException('Failed to update user');
      }

      return updated;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('An error occurred while updating the user');
    }
  }
}
```

## Async Error Handling

### Promise Rejection

```typescript
@Injectable()
export class AsyncService {
  async processWithRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          throw new ServiceUnavailableException(`Operation failed after ${maxRetries} attempts: ${error.message}`);
        }

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError;
  }
}
```

### Event Emitter Errors

```typescript
@Injectable()
export class EventService {
  constructor(private eventEmitter: EventEmitter2) {}

  @OnEvent('user.created', { async: true })
  async handleUserCreated(payload: UserCreatedEvent) {
    try {
      await this.sendWelcomeEmail(payload.user);
    } catch (error) {
      // Log error but don't fail the main operation
      this.logger.error(`Failed to send welcome email for user ${payload.user.id}`, error);

      // Emit error event for monitoring
      this.eventEmitter.emit('email.failed', {
        userId: payload.user.id,
        error: error.message,
      });
    }
  }
}
```

## Controller Error Handling

```typescript
@Controller('users')
@UseInterceptors(ErrorInterceptor)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.userService.findById(id);
    } catch (error) {
      // Controller-specific error handling
      if (error instanceof NotFoundException) {
        throw new NotFoundException({
          message: 'User not found',
          code: 'USER_NOT_FOUND',
          userId: id,
        });
      }
      throw error;
    }
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    try {
      return await this.userService.create(dto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException({
          message: 'User already exists',
          code: 'USER_EXISTS',
          email: dto.email,
        });
      }
      throw error;
    }
  }
}
```

## Error Logging

### Structured Logging

```typescript
import { Logger } from '@nestjs/common';
import * as winston from 'winston';

export class AppLogger extends Logger {
  private winstonLogger: winston.Logger;

  constructor(context?: string) {
    super(context);

    this.winstonLogger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    });
  }

  error(message: string, trace?: string, context?: string) {
    this.winstonLogger.error(message, {
      context: context || this.context,
      trace,
      timestamp: new Date().toISOString(),
    });

    super.error(message, trace, context);
  }
}
```

## Circuit Breaker Pattern

```typescript
import * as CircuitBreaker from 'opossum';

@Injectable()
export class ExternalApiService {
  private circuitBreaker: CircuitBreaker;

  constructor() {
    const options = {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
    };

    this.circuitBreaker = new CircuitBreaker(this.callExternalApi.bind(this), options);

    this.circuitBreaker.on('open', () => {
      this.logger.warn('Circuit breaker is open');
    });

    this.circuitBreaker.on('halfOpen', () => {
      this.logger.info('Circuit breaker is half-open');
    });

    this.circuitBreaker.on('close', () => {
      this.logger.info('Circuit breaker is closed');
    });
  }

  async callApi(data: any): Promise<any> {
    try {
      return await this.circuitBreaker.fire(data);
    } catch (error) {
      if (error.code === 'EOPENBREAKER') {
        throw new ServiceUnavailableException('External service is temporarily unavailable');
      }
      throw error;
    }
  }

  private async callExternalApi(data: any): Promise<any> {
    // Actual API call implementation
  }
}
```

## Error Recovery Strategies

### Graceful Degradation

```typescript
@Injectable()
export class ResilientService {
  async getDataWithFallback(id: string): Promise<Data> {
    try {
      // Try primary source
      return await this.primaryDataSource.getData(id);
    } catch (error) {
      this.logger.warn(`Primary source failed: ${error.message}`);

      try {
        // Fallback to cache
        const cached = await this.cacheService.get(id);
        if (cached) {
          return cached;
        }
      } catch (cacheError) {
        this.logger.warn(`Cache fallback failed: ${cacheError.message}`);
      }

      try {
        // Fallback to secondary source
        return await this.secondaryDataSource.getData(id);
      } catch (secondaryError) {
        this.logger.error(`All sources failed for ID: ${id}`);

        // Return default/partial data
        return this.getDefaultData(id);
      }
    }
  }
}
```

## Testing Error Scenarios

```typescript
describe('Error Handling', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepositoryService>;

  beforeEach(() => {
    const module = Test.createTestingModule({
      providers: [UserService, UserRepositoryService],
    });

    service = module.get(UserService);
    repository = module.get(UserRepositoryService);
  });

  describe('findUserById', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      repository.findUniqueActiveUser.mockResolvedValue(null);

      await expect(service.findUserById('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should handle database errors', async () => {
      repository.findUniqueActiveUser.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.findUserById('user-id')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
```

## Best Practices

### Do's

- ✅ Use appropriate HTTP status codes
- ✅ Provide meaningful error messages
- ✅ Include error codes for client handling
- ✅ Log errors with context
- ✅ Implement retry logic for transient failures
- ✅ Use circuit breakers for external services
- ✅ Validate input early
- ✅ Handle errors at appropriate levels

### Don'ts

- ❌ Expose internal implementation details
- ❌ Log sensitive information
- ❌ Swallow errors silently
- ❌ Use generic error messages
- ❌ Retry non-idempotent operations
- ❌ Mix business logic with error handling

## Related Documentation

- [Testing Strategy](./testing-strategy.md)
- [State Management](./state-management.md)
- [Performance Guidelines](./performance.md)
