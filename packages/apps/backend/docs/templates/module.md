# Module: [EntityName]

> Template for NestJS backend modules following DDD pattern.

## Module Structure

```
modules/aggregate/[entity]/
├── [entity].module.ts
├── [entity].repository.service.ts
├── [entity].query.service.ts
├── [entity].command.service.ts
├── [entity].admin.facade.service.ts
├── [entity].app.facade.service.ts
├── [entity].input.dto.ts
├── [entity].response.dto.ts
└── [entity].constants.ts
```

## 1. Repository Service

```typescript
// [entity].repository.service.ts
import { Injectable } from '@nestjs/common';
import { RepositoryService } from '@/modules/repository/repository.service';

@Injectable()
export class [Entity]RepositoryService {
  constructor(private readonly repository: RepositoryService) {}

  async findUnique[Entity](where: { publicId: string }) {
    return this.repository.[entity].findUnique({ where });
  }

  async findMany[Entity]s(where?: Prisma.[Entity]WhereInput) {
    return this.repository.[entity].findMany({ where });
  }

  async create[Entity](data: Prisma.[Entity]CreateInput) {
    return this.repository.[entity].create({ data });
  }

  async update[Entity](
    where: { publicId: string },
    data: Prisma.[Entity]UpdateInput,
  ) {
    return this.repository.[entity].update({ where, data });
  }

  async delete[Entity](where: { publicId: string }) {
    return this.repository.[entity].update({
      where,
      data: { deletedAt: new Date() },
    });
  }
}
```

## 2. Query Service

```typescript
// [entity].query.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { [Entity]RepositoryService } from './[entity].repository.service';

@Injectable()
export class [Entity]QueryService {
  constructor(private readonly repository: [Entity]RepositoryService) {}

  async find[Entity]ByIdOrFail(publicId: string) {
    const [entity] = await this.repository.findUnique[Entity]({ publicId });
    if (![entity]) {
      throw new NotFoundException('[Entity] not found');
    }
    return [entity];
  }

  async findMany[Entity]s(dto: FindMany[Entity]sInputDto) {
    return this.repository.findMany[Entity]s(dto);
  }
}
```

## 3. Command Service

```typescript
// [entity].command.service.ts
import { Injectable } from '@nestjs/common';
import { [Entity]RepositoryService } from './[entity].repository.service';
import { [Entity]QueryService } from './[entity].query.service';

@Injectable()
export class [Entity]CommandService {
  constructor(
    private readonly repository: [Entity]RepositoryService,
    private readonly queryService: [Entity]QueryService,
  ) {}

  async create[Entity](dto: Create[Entity]InputDto) {
    return this.repository.create[Entity](dto);
  }

  async update[Entity]ById(publicId: string, dto: Update[Entity]InputDto) {
    await this.queryService.find[Entity]ByIdOrFail(publicId);
    return this.repository.update[Entity]({ publicId }, dto);
  }

  async delete[Entity]ById(publicId: string) {
    await this.queryService.find[Entity]ByIdOrFail(publicId);
    return this.repository.delete[Entity]({ publicId });
  }
}
```

## 4. Facade Services

```typescript
// [entity].admin.facade.service.ts
@Injectable()
export class [Entity]AdminFacadeService {
  constructor(
    private readonly queryService: [Entity]QueryService,
    private readonly commandService: [Entity]CommandService,
  ) {}

  // Admin-specific orchestration
  async bulkUpdate[Entity]s(dto: BulkUpdate[Entity]sInputDto) {
    // Implementation
  }
}

// [entity].app.facade.service.ts
@Injectable()
export class [Entity]AppFacadeService {
  constructor(
    private readonly queryService: [Entity]QueryService,
    private readonly commandService: [Entity]CommandService,
  ) {}

  // App-specific orchestration (user-scoped)
  async getUserScoped[Entity](userId: string, publicId: string) {
    // Implementation with user context
  }
}
```

## 5. DTOs

```typescript
// [entity].input.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class Create[Entity]InputDto {
  @IsString()
  name: string;
}

export class Update[Entity]InputDto {
  @IsOptional()
  @IsString()
  name?: string;
}

// [entity].response.dto.ts
import { Exclude, Expose } from 'class-transformer';

export class [Entity]ResponseDto {
  @Exclude() id: number;
  @Expose() publicId: string;
  @Expose() name: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
```

## 6. Module

```typescript
// [entity].module.ts
import { Module } from '@nestjs/common';
import { RepositoryModule } from '@/modules/repository/repository.module';

@Module({
  imports: [RepositoryModule],
  providers: [
    [Entity]RepositoryService,
    [Entity]QueryService,
    [Entity]CommandService,
    [Entity]AdminFacadeService,
    [Entity]AppFacadeService,
  ],
  exports: [
    [Entity]AdminFacadeService,
    [Entity]AppFacadeService,
  ],
})
export class [Entity]Module {}
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

## Checklist

- [ ] Repository service with consistent naming
- [ ] Query service with OrFail pattern
- [ ] Command service using query for validation
- [ ] Separate Admin/App facade services
- [ ] Input DTOs with validation
- [ ] Response DTOs hiding internal IDs
- [ ] Module with proper imports/exports
- [ ] Prisma schema with required fields
- [ ] Unit tests for all services
