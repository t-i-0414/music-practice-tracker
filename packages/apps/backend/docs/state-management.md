# Backend State Management

## Overview

This document describes how state is managed in the NestJS backend application, including request context, caching strategies, and session management.

## Request Context

### Request Scoping

NestJS provides three injection scopes:

```typescript
// Singleton (default) - single instance for entire application
@Injectable()
export class UserService {}

// Request-scoped - new instance per request
@Injectable({ scope: Scope.REQUEST })
export class RequestScopedService {}

// Transient - new instance for each injection
@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {}
```

### Request Context Storage

Using AsyncLocalStorage for request context:

```typescript
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run<T>(context: RequestContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  get current(): RequestContext | undefined {
    return this.storage.getStore();
  }
}

interface RequestContext {
  requestId: string;
  userId?: string;
  tenantId?: string;
  correlationId?: string;
}
```

## Database Connection Management

### Connection Pooling

```typescript
// Prisma connection configuration
export class RepositoryService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: ['error', 'warn'],
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### Transaction Management

```typescript
@Injectable()
export class TransactionService {
  constructor(private readonly repository: RepositoryService) {}

  async executeInTransaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.repository.$transaction(callback, {
      maxWait: 5000,
      timeout: 10000,
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    });
  }
}
```

## Caching Strategy

### In-Memory Cache

```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }
}
```

### Cache Configuration

```typescript
// cache.config.ts
import { CacheModuleOptions } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

export const cacheConfig: CacheModuleOptions = {
  store: process.env.NODE_ENV === 'production' ? redisStore : 'memory',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  ttl: 60, // seconds
  max: 100, // maximum items in cache
};
```

### Cache Decorators

```typescript
@Injectable()
export class UserQueryService {
  @Cacheable({ ttl: 300 }) // Cache for 5 minutes
  async findUserById(id: string): Promise<User> {
    return this.repository.findUniqueActiveUser({ publicId: id });
  }

  @CacheEvict({ allEntries: true })
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    // Update logic
  }
}
```

## Session Management

### JWT Token State

```typescript
interface JwtPayload {
  sub: string; // User ID
  email: string;
  roles: string[];
  sessionId: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async createToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.publicId,
      email: user.email,
      roles: user.roles,
      sessionId: generateSessionId(),
      iat: Date.now() / 1000,
      exp: Date.now() / 1000 + 3600, // 1 hour
    };

    return this.jwtService.sign(payload);
  }
}
```

### Session Storage

```typescript
@Injectable()
export class SessionService {
  private readonly sessions = new Map<string, SessionData>();

  async createSession(userId: string, data: Partial<SessionData>): Promise<string> {
    const sessionId = generateSessionId();
    const session: SessionData = {
      id: sessionId,
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
      ...data,
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const session = this.sessions.get(sessionId);

    if (!session) return null;

    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  async destroySession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }
}
```

## Queue State Management

### Bull Queue Integration

```typescript
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailQueueService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendEmail(data: EmailData): Promise<void> {
    await this.emailQueue.add('send', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  async getQueueStatus(): Promise<QueueStatus> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }
}
```

## Application State

### Health Check State

```typescript
@Injectable()
export class HealthService {
  private readonly startTime = Date.now();
  private readonly healthChecks = new Map<string, HealthStatus>();

  async checkDatabase(): Promise<HealthCheckResult> {
    try {
      await this.repository.$queryRaw`SELECT 1`;
      this.healthChecks.set('database', { status: 'healthy', timestamp: Date.now() });
      return { status: 'healthy' };
    } catch (error) {
      this.healthChecks.set('database', { status: 'unhealthy', timestamp: Date.now(), error });
      return { status: 'unhealthy', error: error.message };
    }
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }

  getAllHealthChecks(): Map<string, HealthStatus> {
    return this.healthChecks;
  }
}
```

### Feature Flags

```typescript
@Injectable()
export class FeatureFlagService {
  private flags = new Map<string, FeatureFlag>();

  constructor() {
    this.loadFlags();
  }

  private loadFlags(): void {
    const config = JSON.parse(process.env.FEATURE_FLAGS || '{}');
    Object.entries(config).forEach(([key, value]) => {
      this.flags.set(key, value as FeatureFlag);
    });
  }

  isEnabled(flag: string, userId?: string): boolean {
    const feature = this.flags.get(flag);

    if (!feature || !feature.enabled) return false;

    if (feature.userIds && userId) {
      return feature.userIds.includes(userId);
    }

    if (feature.percentage) {
      return Math.random() * 100 < feature.percentage;
    }

    return true;
  }
}

interface FeatureFlag {
  enabled: boolean;
  percentage?: number;
  userIds?: string[];
  startDate?: Date;
  endDate?: Date;
}
```

## Rate Limiting State

```typescript
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class RateLimitService {
  private readonly limits = new Map<string, RateLimitEntry[]>();

  async checkLimit(key: string, limit: number, window: number): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - window * 1000;

    let entries = this.limits.get(key) || [];
    entries = entries.filter((e) => e.timestamp > windowStart);

    if (entries.length >= limit) {
      return false;
    }

    entries.push({ timestamp: now });
    this.limits.set(key, entries);

    return true;
  }

  async resetLimit(key: string): Promise<void> {
    this.limits.delete(key);
  }
}
```

## Metrics and Monitoring

```typescript
@Injectable()
export class MetricsService {
  private readonly counters = new Map<string, number>();
  private readonly gauges = new Map<string, number>();
  private readonly histograms = new Map<string, number[]>();

  incrementCounter(name: string, value = 1): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  setGauge(name: string, value: number): void {
    this.gauges.set(name, value);
  }

  recordHistogram(name: string, value: number): void {
    const values = this.histograms.get(name) || [];
    values.push(value);
    this.histograms.set(name, values);
  }

  getMetrics(): Metrics {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(
        Array.from(this.histograms.entries()).map(([key, values]) => [
          key,
          {
            count: values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
          },
        ]),
      ),
    };
  }
}
```

## Best Practices

### State Management Guidelines

1. **Stateless Services**: Keep services stateless when possible
2. **Request Scoping**: Use sparingly, impacts performance
3. **Cache Invalidation**: Always invalidate cache on updates
4. **Transaction Boundaries**: Keep transactions short
5. **Connection Pooling**: Monitor and tune pool size
6. **Session Expiry**: Implement proper timeout handling
7. **Memory Management**: Clean up expired state regularly

### Anti-Patterns to Avoid

- ❌ Storing state in service instance variables
- ❌ Long-running database transactions
- ❌ Unbounded cache growth
- ❌ Missing cache invalidation
- ❌ Shared mutable state without synchronization

## Testing State Management

```typescript
describe('State Management', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService(mockCacheManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should cache and retrieve data', async () => {
    const key = 'test-key';
    const value = { data: 'test' };

    await cacheService.set(key, value);
    const cached = await cacheService.get(key);

    expect(cached).toEqual(value);
  });

  it('should handle cache expiration', async () => {
    const key = 'test-key';
    const value = { data: 'test' };

    await cacheService.set(key, value, 1); // 1 second TTL
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const cached = await cacheService.get(key);
    expect(cached).toBeUndefined();
  });
});
```

## Related Documentation

- [Performance Guidelines](./performance.md)
- [Error Handling](./error-handling.md)
- [Testing Strategy](./testing-strategy.md)
