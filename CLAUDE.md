# CLAUDE.md

> Essential instructions for AI agents working with this codebase.

## 🎯 Primary Directives

### Do What's Asked - Nothing More, Nothing Less

- Execute the requested task precisely
- Don't add features or files unless explicitly needed
- Prefer editing existing files over creating new ones
- NEVER proactively create documentation files (\*.md)

### Quality Gates Are Mandatory

```bash
bun run ci:temp  # Must pass before ANY commit
```

### Follow Existing Patterns

- Study neighboring code before writing
- Use existing libraries and utilities
- Check package.json before assuming libraries exist

## 🏗️ Architecture Overview

### System Components

1. **Backend API** (NestJS) - Ports 3000 (App), 3001 (Admin)
2. **Admin Dashboard** (Next.js) - Port 8000
3. **Mobile App** (React Native/Expo) - Port 8081

### Domain-Driven Design (DDD) Architecture

```typescript
// Domain Layer - Business logic
domain/aggregates/[entity]/
├── [entity].query.service.ts     // Read operations (OrFail pattern)
├── [entity].command.service.ts   // Write operations (CUD)
└── utils/
    ├── dto.ts                    // Domain DTOs
    └── constants.ts              // Entity constants

// API Layer - Interface adapters
apis/[admin|app]/[entity]/
├── [entity].controller.ts        // HTTP endpoints
└── [entity].module.ts           // API module

// Repository Layer - Data access
repository/
└── repository.service.ts         // Centralized Prisma access
```

### Key Patterns

- **Domain-Driven Design**: Clear separation of domain, API, and repository layers
- **Dual APIs**: App (user-scoped) vs Admin (full access)
- **UUID Keys**: Never expose internal IDs (use publicId)
- **Repository Pattern**: Centralized database access through single repository service
- **Query/Command Separation**: Read and write operations are separated
- **DTO Pattern**: Input validation and response transformation
- **Error Handling**: Custom error classes (ApiError, DomainError, FirebaseError, RepositoryError)
- **Global Exception Filter**: Unified error response with proper HTTP status mapping

### Database Schema (Prisma)

```prisma
// Required for ALL models:
id        Int      @id @default(autoincrement())
publicId  String   @unique @default(uuid())
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([createdAt])
```

## ⚡ Essential Commands

### Quick Start

```bash
# Initial Setup (once)
make setup

# Start Services
make docker-compose-up              # PostgreSQL
make start-firebase-dev-emulators   # Firebase Emulator
```

### Development

```bash
# Backend
cd packages/apps/backend
bun run start:dev          # Start both APIs
bun run test              # Run tests
bun run prisma:studio     # Database GUI

# Frontend
cd packages/apps/admin && bun run start:dev     # Admin dashboard
cd packages/apps/mobile && bun run start:dev    # Mobile app
```

### Quality Checks

```bash
# Run ALL checks (required before commit)
bun run ci:temp

# Individual checks
bun run format:fix        # Format code
bun run cspell            # Spell check
bun run lint:es:check     # Lint
bun run type:check        # TypeScript
```

## 📁 Project Structure

```
/
├── packages/
│   ├── apps/
│   │   ├── backend/     # NestJS APIs
│   │   ├── admin/       # Next.js dashboard
│   │   └── mobile/      # React Native app
│   └── libs/            # Shared libraries
└── docker-compose.yml   # PostgreSQL
```

### Backend DDD Structure

```
src/
├── domain/
│   ├── aggregates/[entity]/
│   │   ├── [entity].query.service.ts
│   │   ├── [entity].command.service.ts
│   │   ├── [entity].module.ts
│   │   └── utils/
│   │       ├── dto.ts
│   │       └── constants.ts
│   ├── usecases/        # Complex business logic
│   └── utils/           # Domain utilities
├── apis/
│   ├── admin/[entity]/
│   │   ├── [entity].controller.ts
│   │   └── [entity].module.ts
│   ├── app/[entity]/
│   │   ├── [entity].controller.ts
│   │   └── [entity].module.ts
│   └── utils/           # API utilities
├── repository/
│   ├── repository.service.ts
│   ├── repository.module.ts
│   ├── seeds/           # Test data seeds
│   └── utils/           # Repository utilities
├── firebase-auth/       # Firebase authentication
└── utils/               # Global utilities
```

## 🏗️ Implementation Workflow

### Feature Implementation

1. **Domain Layer**: Create aggregate with query/command services and DTOs
2. **API Layer**: Add controllers and API modules for admin/app endpoints
3. **Repository Integration**: Use centralized repository.service.ts for data access
4. **Error Handling**: Implement proper error types and OrFail patterns
5. **Testing**: Write comprehensive tests (95% coverage minimum)
6. **Documentation**: Update module templates and examples

### Database Changes

```bash
bunx prisma migrate dev --name [name]
```

### Test Data Seeding

```bash
# Seed test users (Firebase + DB)
bun run seed:all

# Individual seeds
bun run seed:firebase-auth  # Firebase auth users
bun run seed:user          # Database users
```

## ⚠️ Common Pitfalls

### DON'T

- Use `npm` (use `bun`)
- Expose internal IDs
- Skip quality checks
- Add comments unless requested
- Access Prisma outside repositories

### DO

- Run `bun run ci:temp` before committing
- Use publicId for external operations
- Follow TDD approach
- Separate Query from Command services
- Use OrFail pattern for required resources

## 📋 Pre-Commit Checklist

### Automated (Required)

```bash
bun run ci:temp  # Must pass with zero errors
```

### Manual Review

- [ ] No `console.log` statements
- [ ] No `any` types
- [ ] No hardcoded values
- [ ] No secrets in code
- [ ] Tests written and passing
- [ ] No internal IDs exposed

### Commit Format

```bash
type(scope): description
# Types: feat, fix, docs, style, refactor, test, chore
# Scope: backend, admin, mobile
```

## 🔗 Environment

### Database

- Dev: `localhost:15432` (postgres:postgres)
- Test: `localhost:15433`

### Custom ESLint Rules

- `repository-model-access-restriction` - Enforces centralized repository access
- `aggregate-import-restriction` - Prevents cross-aggregate dependencies
- `no-internal-id` - Prevents ID exposure

### Testing

- Minimum 95% coverage
- Unit tests with mocks
- Integration tests with real DB
- E2E for critical paths

---

_For detailed documentation, check `/packages/apps/_/README.md`\*
