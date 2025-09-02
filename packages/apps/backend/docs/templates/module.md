# Module: [EntityName]

> Template for NestJS backend modules following Domain-Driven Design (DDD) pattern.

## DDD Module Structure

```
src/
├── domain/aggregates/[entity]/
│   ├── [entity].module.ts
│   ├── [entity].query.service.ts
│   ├── [entity].command.service.ts
│   └── utils/
│       ├── dto.ts
│       └── constants.ts
└── apis/
    ├── admin/[entity]/
    │   ├── [entity].controller.ts
    │   └── [entity].module.ts
    └── app/[entity]/
        ├── [entity].controller.ts
        └── [entity].module.ts
```

## 1. Domain Query Service

```typescript
// domain/aggregates/[entity]/[entity].query.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { RepositoryService } from '@/repository/repository.service';

@Injectable()
export class [Entity]QueryService {
  constructor(private readonly repository: RepositoryService) {}

  async find[Entity]ByIdOrFail(publicId: string) {
    const [entity] = await this.repository.[entity].findUnique({
      where: { publicId },
    });
    if (![entity]) {
      throw new NotFoundException('[Entity] not found');
    }
    return [entity];
  }

  async findMany[Entity]s(params: Find[Entity]sParams = {}) {
    return this.repository.[entity].findMany(params);
  }

  async count[Entity]s(where?: Prisma.[Entity]WhereInput) {
    return this.repository.[entity].count({ where });
  }
}
```

## 2. Domain Command Service

```typescript
// domain/aggregates/[entity]/[entity].command.service.ts
import { Injectable } from '@nestjs/common';
import { RepositoryService } from '@/repository/repository.service';
import { [Entity]QueryService } from './[entity].query.service';
import { Create[Entity]Dto, Update[Entity]Dto } from './utils/dto';

@Injectable()
export class [Entity]CommandService {
  constructor(
    private readonly repository: RepositoryService,
    private readonly queryService: [Entity]QueryService,
  ) {}

  async create[Entity](dto: Create[Entity]Dto) {
    return this.repository.[entity].create({
      data: dto,
    });
  }

  async update[Entity]ById(publicId: string, dto: Update[Entity]Dto) {
    await this.queryService.find[Entity]ByIdOrFail(publicId);
    return this.repository.[entity].update({
      where: { publicId },
      data: dto,
    });
  }

  async delete[Entity]ById(publicId: string) {
    await this.queryService.find[Entity]ByIdOrFail(publicId);
    return this.repository.[entity].update({
      where: { publicId },
      data: { deletedAt: new Date() },
    });
  }
}
```

## 3. API Controllers

```typescript
// apis/admin/[entity]/[entity].controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { [Entity]QueryService } from '@/domain/aggregates/[entity]/[entity].query.service';
import { [Entity]CommandService } from '@/domain/aggregates/[entity]/[entity].command.service';

@Controller('admin/[entity]s')
export class Admin[Entity]Controller {
  constructor(
    private readonly queryService: [Entity]QueryService,
    private readonly commandService: [Entity]CommandService,
  ) {}

  @Get()
  async findMany[Entity]s() {
    return this.queryService.findMany[Entity]s();
  }

  @Get(':publicId')
  async find[Entity]ById(@Param('publicId') publicId: string) {
    return this.queryService.find[Entity]ByIdOrFail(publicId);
  }

  @Post()
  async create[Entity](@Body() dto: Create[Entity]Dto) {
    return this.commandService.create[Entity](dto);
  }

  @Put(':publicId')
  async update[Entity](@Param('publicId') publicId: string, @Body() dto: Update[Entity]Dto) {
    return this.commandService.update[Entity]ById(publicId, dto);
  }

  @Delete(':publicId')
  async delete[Entity](@Param('publicId') publicId: string) {
    return this.commandService.delete[Entity]ById(publicId);
  }
}

// apis/app/[entity]/[entity].controller.ts
@Controller('[entity]s')
export class App[Entity]Controller {
  constructor(
    private readonly queryService: [Entity]QueryService,
    private readonly commandService: [Entity]CommandService,
  ) {}

  // User-scoped endpoints with authentication
}
```

## 4. Domain DTOs

```typescript
// domain/aggregates/[entity]/utils/dto.ts
import { IsString, IsOptional } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

export class Create[Entity]Dto {
  @IsString()
  name: string;
}

export class Update[Entity]Dto {
  @IsOptional()
  @IsString()
  name?: string;
}

export class [Entity]ResponseDto {
  @Exclude() id: number;
  @Expose() publicId: string;
  @Expose() name: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
  @Exclude() deletedAt: Date | null;
}

export class Find[Entity]sParams {
  @IsOptional()
  skip?: number;

  @IsOptional()
  take?: number;

  @IsOptional()
  where?: Prisma.[Entity]WhereInput;
}
```

## 5. Domain Module

```typescript
// domain/aggregates/[entity]/[entity].module.ts
import { Module } from '@nestjs/common';
import { RepositoryModule } from '@/repository/repository.module';
import { [Entity]QueryService } from './[entity].query.service';
import { [Entity]CommandService } from './[entity].command.service';

@Module({
  imports: [RepositoryModule],
  providers: [
    [Entity]QueryService,
    [Entity]CommandService,
  ],
  exports: [
    [Entity]QueryService,
    [Entity]CommandService,
  ],
})
export class [Entity]Module {}
```

## 6. API Modules

```typescript
// apis/admin/[entity]/[entity].module.ts
import { Module } from '@nestjs/common';
import { [Entity]Module as Domain[Entity]Module } from '@/domain/aggregates/[entity]/[entity].module';
import { Admin[Entity]Controller } from './[entity].controller';

@Module({
  imports: [Domain[Entity]Module],
  controllers: [Admin[Entity]Controller],
})
export class Admin[Entity]Module {}

// apis/app/[entity]/[entity].module.ts
import { Module } from '@nestjs/common';
import { [Entity]Module as Domain[Entity]Module } from '@/domain/aggregates/[entity]/[entity].module';
import { App[Entity]Controller } from './[entity].controller';

@Module({
  imports: [Domain[Entity]Module],
  controllers: [App[Entity]Controller],
})
export class App[Entity]Module {}
```

## Prisma Schema

```prisma
model [Entity] {
  id        Int      @id @default(autoincrement())
  publicId  String   @unique @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@index([createdAt])
  @@index([deletedAt])
  @@map("[entity]s")
}
```

## DDD Implementation Checklist

### Domain Layer

- [ ] Query service with OrFail pattern
- [ ] Command service using query for validation
- [ ] Domain DTOs with proper validation
- [ ] Constants file for entity-specific values
- [ ] Domain module with proper exports

### API Layer

- [ ] Admin controller with full CRUD endpoints
- [ ] App controller with user-scoped endpoints
- [ ] Separate API modules importing domain services
- [ ] Proper HTTP status codes and error handling

### Repository Integration

- [ ] Use centralized RepositoryService (no direct Prisma access)
- [ ] Consistent publicId-based queries
- [ ] Soft delete using deletedAt field

### Testing & Quality

- [ ] Unit tests for query/command services
- [ ] Integration tests for controllers
- [ ] OrFail pattern test coverage
- [ ] ESLint rules compliance (no direct Prisma, no internal ID exposure)

### Database Schema

- [ ] Prisma schema with required fields (id, publicId, createdAt, updatedAt, deletedAt)
- [ ] Proper indexes for performance
- [ ] Consistent naming conventions
