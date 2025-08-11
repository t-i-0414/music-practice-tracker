# Backend Performance Guidelines

## Overview

This document outlines performance standards, optimization strategies, and monitoring practices for the NestJS backend.

## Performance Targets

### SLOs (Service Level Objectives)

| Metric              | Target       | Critical    |
| ------------------- | ------------ | ----------- |
| Response Time (p50) | < 50ms       | < 100ms     |
| Response Time (p95) | < 200ms      | < 500ms     |
| Response Time (p99) | < 500ms      | < 1000ms    |
| Throughput          | > 1000 req/s | > 500 req/s |
| Error Rate          | < 0.1%       | < 1%        |
| CPU Usage           | < 70%        | < 90%       |
| Memory Usage        | < 512MB      | < 1GB       |

## Database Optimization

### Query Optimization

```typescript
// ❌ Bad: N+1 query problem
const users = await this.prisma.user.findMany();
for (const user of users) {
  const sessions = await this.prisma.practiceSession.findMany({
    where: { userId: user.id },
  });
}

// ✅ Good: Single query with includes
const users = await this.prisma.user.findMany({
  include: {
    practiceSessions: true,
  },
});
```

### Pagination

```typescript
@Injectable()
export class PaginationService {
  async paginate<T>(
    model: any,
    args: {
      where?: any;
      orderBy?: any;
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResult<T>> {
    const page = args.page || 1;
    const limit = args.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      model.findMany({
        ...args,
        skip,
        take: limit,
      }),
      model.count({ where: args.where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

### Index Strategy

```sql
-- Critical indexes for performance
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_sessions_user_date ON practice_sessions(user_id, start_time DESC);
CREATE INDEX CONCURRENTLY idx_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;
```

### Connection Pooling

```typescript
// prisma.schema
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pool settings
  connectionLimit = 200
}

// Repository configuration
export class RepositoryService extends PrismaClient {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
}
```

## Caching Strategy

### Response Caching

```typescript
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('users')
@UseInterceptors(CacheInterceptor)
export class UsersController {
  @Get()
  @CacheTTL(60) // Cache for 60 seconds
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @CacheTTL(300) // Cache for 5 minutes
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
}
```

### Query Result Caching

```typescript
@Injectable()
export class CachedUserService {
  constructor(
    private cache: Cache,
    private userService: UserService,
  ) {}

  async findUserById(id: string): Promise<User> {
    const cacheKey = `user:${id}`;

    // Try cache first
    const cached = await this.cache.get<User>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const user = await this.userService.findById(id);

    // Cache the result
    await this.cache.set(cacheKey, user, 300); // 5 minutes

    return user;
  }

  async invalidateUser(id: string): Promise<void> {
    await this.cache.del(`user:${id}`);
  }
}
```

### Cache Warming

```typescript
@Injectable()
export class CacheWarmupService {
  constructor(
    private cache: Cache,
    private userService: UserService,
  ) {}

  @Cron('0 */5 * * * *') // Every 5 minutes
  async warmupCache() {
    const activeUsers = await this.userService.findActiveUsers();

    await Promise.all(activeUsers.map((user) => this.cache.set(`user:${user.publicId}`, user, 300)));
  }
}
```

## API Optimization

### Compression

```typescript
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    compression({
      threshold: 1024, // Only compress responses > 1KB
      level: 6, // Compression level (0-9)
    }),
  );
}
```

### Response Transformation

```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        timestamp: new Date().toISOString(),
        status: 'success',
      })),
    );
  }
}
```

### Field Selection

```typescript
// Allow clients to specify fields
@Get()
async findAll(@Query('fields') fields?: string) {
  const select = fields?.split(',').reduce((acc, field) => {
    acc[field] = true;
    return acc;
  }, {});

  return this.prisma.user.findMany({
    select: select || undefined,
  });
}
```

## Async Processing

### Queue Implementation

```typescript
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('email')
export class EmailProcessor {
  @Process({ concurrency: 5 })
  async sendEmail(job: Job<EmailData>) {
    // Process email asynchronously
    await this.emailService.send(job.data);
  }
}

// Usage
@Injectable()
export class UserService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async createUser(dto: CreateUserDto) {
    const user = await this.repository.create(dto);

    // Queue email instead of blocking
    await this.emailQueue.add('welcome', {
      to: user.email,
      template: 'welcome',
    });

    return user;
  }
}
```

### Batch Processing

```typescript
@Injectable()
export class BatchService {
  async processBatch<T>(items: T[], processor: (item: T) => Promise<void>, batchSize = 10): Promise<void> {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await Promise.all(batch.map(processor));
    }
  }
}
```

## Memory Management

### Stream Processing

```typescript
import { Readable } from 'stream';

@Controller('export')
export class ExportController {
  @Get('users')
  @Header('Content-Type', 'application/json')
  async streamUsers(@Res() res: Response) {
    const stream = new Readable({
      read() {},
    });

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="users.json"',
    });

    stream.pipe(res);
    stream.push('[');

    let first = true;
    const cursor = this.prisma.user.findMany({
      take: 100,
      cursor: undefined,
    });

    for await (const users of cursor) {
      for (const user of users) {
        if (!first) stream.push(',');
        stream.push(JSON.stringify(user));
        first = false;
      }
    }

    stream.push(']');
    stream.push(null);
  }
}
```

### Memory Leak Prevention

```typescript
@Injectable()
export class CleanupService implements OnModuleDestroy {
  private intervals: NodeJS.Timer[] = [];
  private subscriptions: Subscription[] = [];

  addInterval(interval: NodeJS.Timer) {
    this.intervals.push(interval);
  }

  addSubscription(subscription: Subscription) {
    this.subscriptions.push(subscription);
  }

  onModuleDestroy() {
    // Clean up intervals
    this.intervals.forEach((interval) => clearInterval(interval));

    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());

    // Clear arrays
    this.intervals = [];
    this.subscriptions = [];
  }
}
```

## Monitoring & Profiling

### Performance Interceptor

```typescript
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        // Log slow requests
        if (duration > 1000) {
          this.logger.warn({
            message: 'Slow request detected',
            method: request.method,
            url: request.url,
            duration,
          });
        }

        // Record metrics
        this.metrics.recordHistogram('http_request_duration', duration, {
          method: request.method,
          route: request.route?.path,
        });
      }),
    );
  }
}
```

### Health Checks

```typescript
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024), // 300MB
    ]);
  }
}
```

## Load Testing

### Artillery Configuration

```yaml
# load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: 'Warm up'
    - duration: 120
      arrivalRate: 50
      name: 'Ramp up'
    - duration: 300
      arrivalRate: 100
      name: 'Sustained load'
  processor: './load-test-processor.js'

scenarios:
  - name: 'User Flow'
    flow:
      - post:
          url: '/auth/login'
          json:
            email: '{{ email }}'
            password: '{{ password }}'
          capture:
            - json: '$.token'
              as: 'token'
      - get:
          url: '/users/profile'
          headers:
            Authorization: 'Bearer {{ token }}'
```

### Performance Testing

```typescript
describe('Performance Tests', () => {
  it('should handle 1000 concurrent requests', async () => {
    const promises = Array(1000)
      .fill(null)
      .map(() => request(app.getHttpServer()).get('/health').expect(200));

    const start = Date.now();
    await Promise.all(promises);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(5000); // Should complete in 5 seconds
  });
});
```

## Best Practices

### Do's

- ✅ Use pagination for large datasets
- ✅ Implement caching strategically
- ✅ Use database indexes effectively
- ✅ Monitor performance metrics
- ✅ Use async processing for heavy operations
- ✅ Implement circuit breakers
- ✅ Use connection pooling
- ✅ Stream large responses

### Don'ts

- ❌ N+1 queries
- ❌ Synchronous heavy processing
- ❌ Unbounded queries
- ❌ Memory leaks from unclosed resources
- ❌ Blocking event loop
- ❌ Over-fetching data
- ❌ Missing database indexes

## Optimization Checklist

- [ ] Database queries optimized
- [ ] Appropriate indexes added
- [ ] Caching implemented
- [ ] Pagination added
- [ ] Response compression enabled
- [ ] Connection pooling configured
- [ ] Memory leaks checked
- [ ] Load testing performed
- [ ] Monitoring in place
- [ ] Performance budget defined

## Related Documentation

- [State Management](./state-management.md)
- [Error Handling](./error-handling.md)
- [Testing Strategy](./testing-strategy.md)
