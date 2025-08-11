# Module: [ModuleName]

## Overview

[Brief description of the module's purpose and responsibilities]

## Domain Model

```prisma
model [EntityName] {
  id        Int      @id @default(autoincrement())
  publicId  String   @unique @default(uuid()) @db.Uuid
  // fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@index([createdAt])
  @@index([deletedAt])
}
```

## Service Architecture

### Repository Service

- `find[Entity]`: Database queries
- `create[Entity]`: Creation operations
- `update[Entity]`: Update operations
- `delete[Entity]`: Soft delete operations

### Query Service

- Read operations with OrFail pattern
- No side effects
- Returns domain entities

### Command Service

- Write operations (Create, Update, Delete)
- Business logic enforcement
- Uses Query Service for validation

### Facade Services

- **Admin Facade**: Full access including deleted records
- **App Facade**: User-scoped operations, active records only

## API Endpoints

### App API

| Method | Endpoint              | Description |
| ------ | --------------------- | ----------- |
| GET    | `/api/[resource]/:id` | Get by ID   |
| POST   | `/api/[resource]`     | Create new  |
| PUT    | `/api/[resource]/:id` | Update      |
| DELETE | `/api/[resource]/:id` | Soft delete |

### Admin API

| Method | Endpoint                            | Description                  |
| ------ | ----------------------------------- | ---------------------------- |
| GET    | `/api/admin/[resource]`             | List all (including deleted) |
| GET    | `/api/admin/[resource]/:id`         | Get any by ID                |
| POST   | `/api/admin/[resource]/restore/:id` | Restore deleted              |
| DELETE | `/api/admin/[resource]/:id/hard`    | Permanent delete             |

## DTOs

### Input DTOs

```typescript
interface Create[Entity]InputDto {
  // fields with validation decorators
}

interface Update[Entity]InputDto {
  // fields with validation decorators
}
```

### Response DTOs

```typescript
interface [Entity]ResponseDto {
  publicId: string;
  // public fields
  createdAt: Date;
  updatedAt: Date;
}
```

## Business Rules

1. [Rule 1]
2. [Rule 2]
3. [Rule 3]

## Testing Strategy

- **Unit Tests**: Service isolation with mocks
- **Integration Tests**: Real database with transactions
- **E2E Tests**: Full API testing

## Error Handling

- `NotFoundException`: Entity not found
- `ConflictException`: Business rule violation
- `BadRequestException`: Invalid input

## Performance Considerations

- Indexes on frequently queried fields
- Pagination for list operations
- Eager loading strategy

## Security Considerations

- Never expose internal IDs
- Input validation at DTO level
- Permission checks in facades

## Dependencies

- Internal: [List of internal dependencies]
- External: Prisma, NestJS

## Migration Notes

[Any migration considerations for existing data]
