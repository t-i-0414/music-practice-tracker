# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Before starting any task,
**you must review the following sections in `CLAUDE.md`:**

- `important-instruction-reminders`
- `Implementation Flow`

## important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
Minimize in-code comments. When adding them, include a comment type such as NOTE:.
For npm packages that are used across multiple apps,
**make sure to install them in the root project (workspace root)** rather than inside individual app directories.
After making changes to the code, always run the following commands from the root project and make sure all of them pass:

```shell
bun run cspell
bun run format:fix
bun run lint:es:check
bun run lint:markdown:check
bun run lint:secret:check
bun run type:check
bun run test
```

This ensures code quality, style consistency, and avoids introducing regressions or sensitive data.
Additionally, make sure to run `bun run test:cov` and verify that all projects meet the required coverage thresholds.

## Implementation Flow

Please follow the steps below when implementing a feature:

### 1. Explore

- Understand the relevant codebase, related files, and any existing implementations that may serve as references.

### 2. Plan

- Think deeply about the implementation plan and design.
- Always **ultrathink** — go beyond surface-level thinking.
- **You must obtain approval before proceeding to the next phase.**

### 3. Code

- Implement based on the approved plan.
- Write code **as if you were Takuto Wada**, the renowned TDD expert in Japan.
- Emphasize **clean, test-driven development**.

### 4. Commit

- Make commits in appropriately small chunks.
- Follow the **[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)** specification.
- **Do not commit without prior approval.**

## Project Overview

Music Practice Tracker is a monorepo application designed to help users track and manage their music practice sessions. The project consists of three main applications:

- **Backend**: NestJS API server with PostgreSQL database
  - App API (port 3000): For regular users to manage their profiles and practice data
  - Admin API (port 3001): For administrators with extended permissions
- **Admin Dashboard**: Next.js 15 web interface for system administration
- **Mobile App**: React Native with Expo for cross-platform mobile access

### Current Implementation Status

The project is in early development with foundational infrastructure complete:

- ✅ User management system with full CRUD operations
- ✅ Authentication and authorization structure
- ✅ Comprehensive testing setup
- ✅ Development tooling and CI/CD pipeline
- ⏳ Music practice tracking features (to be implemented)

### Domain Model

Currently implemented:

- **User**: Basic user entity with email, name, and soft-delete capability
  - Admin users have access to bulk operations and deleted records
  - Regular users have standard CRUD access to active records only

Planned domains (based on project purpose):

- Practice sessions tracking
- Instruments and repertoire management
- Practice goals and progress monitoring
- Statistics and insights generation

## Codebase Overview

### Repository Structure

```text
music-practice-tracker/
├── packages/
│   ├── apps/
│   │   ├── backend/        # NestJS API server
│   │   ├── admin/          # Next.js admin dashboard
│   │   └── mobile/         # React Native mobile app
│   └── libs/
│       ├── eslint-configs/ # Shared ESLint configurations
│       └── eslint-plugins/   # Custom architectural enforcement rules
├── scripts/                # Build and utility scripts
├── docker-compose.yml      # PostgreSQL database setup
└── Makefile               # Common development commands
```

### Backend Architecture (packages/apps/backend)

The backend follows Domain-Driven Design with strict layered architecture:

```text
src/
├── modules/
│   ├── api/
│   │   ├── admin/         # Admin-specific endpoints
│   │   └── app/           # User-facing endpoints
│   ├── aggregate/         # Domain aggregates
│   │   └── user/          # User aggregate with:
│   │       ├── user.query.service.ts      # Read operations
│   │       ├── user.command.service.ts    # Write operations
│   │       ├── user.repository.service.ts # Data access
│   │       ├── user.admin.facade.service.ts
│   │       └── user.app.facade.service.ts
│   └── repository/        # Database connection module
├── decorators/            # Custom decorators
└── utils/                 # Shared utilities
```

### Frontend Applications

**Admin Dashboard (packages/apps/admin)**:

- Next.js 15 with App Router
- TypeScript + Turbopack for fast development
- Comprehensive test setup (Playwright, Cypress, Vitest)
- MSW for API mocking

**Mobile App (packages/apps/mobile)**:

- React Native with Expo 53
- Expo Router for navigation
- Tab-based navigation (Home, Explore)
- Cross-platform support (iOS, Android, Web)

### Development Workflow

1. **Monorepo Management**: Bun workspaces for dependency management
2. **Type Safety**: TypeScript throughout with strict configurations
3. **Code Quality**:
   - Custom ESLint rules enforce architectural patterns
   - Prettier for consistent formatting
   - CSpell for spell checking
   - Secretlint for security
4. **Testing Strategy**:
   - Unit tests with Jest
   - Integration tests with real database
   - E2E tests with Playwright/Cypress
5. **Git Workflow**:
   - Conventional commits enforced
   - Pre-commit hooks via Lefthook
   - Automated validations

### Key Architectural Decisions

1. **Soft Delete Pattern**: All entities support soft deletion by default
2. **UUID Primary Keys**: Using PostgreSQL's gen_random_uuid()
3. **Service Layer Separation**: Strict separation between read/write operations
4. **Repository Pattern**: Database access only through repository services
5. **Dual API Design**: Separate Admin and App APIs with different permissions
6. **Path Aliases**: `@/*` for cleaner imports in backend

## Main Entry Points

### Backend (NestJS) - Dual API Architecture

The backend runs **two separate NestJS applications**:

#### Admin API (`packages/apps/backend/src/admin-api.main.ts`)

- **Port**: 3001 (default, configurable via PORT env)
- **Module**: `AdminApiModule`
- **Features**:
  - Full CRUD operations including soft-deleted records
  - Bulk operations support
  - Swagger documentation at `/api` (development only)
- **Start**: `npm run start:dev:admin-api`

#### App API (`packages/apps/backend/src/app-api.main.ts`)

- **Port**: 3000 (default, configurable via PORT env)
- **Module**: `AppApiModule`
- **Features**:
  - Limited user operations (active records only)
  - Regular user endpoints
  - Swagger documentation at `/api` (development only)
- **Start**: `npm run start:dev:app-api`

**Common initialization for both APIs**:

```typescript
// Global validation pipe
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }),
);

// Class serializer for response transformation
app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
```

**Development commands**:

- Both APIs: `npm run start:dev`
- Debug mode: `npm run start:debug`
- Production: `npm run start:prod:admin-api` / `npm run start:prod:app-api`

### Admin Dashboard (Next.js)

**Entry Structure**: Next.js 15 App Router

- **Root Layout**: `packages/apps/admin/src/app/layout.tsx`
  - Configures Geist fonts
  - Sets metadata
- **Home Page**: `packages/apps/admin/src/app/page.tsx`
- **Port**: 8000
- **Config**: `next.config.ts` with custom TypeScript build config

**Start commands**:

- Development: `npm run dev` (Turbopack enabled)
- Production: `npm run build && npm run start`

### Mobile App (React Native/Expo)

**Entry Point**: Expo Router (`"main": "expo-router/entry"` in package.json)

- **Root Layout**: `packages/apps/mobile/src/app/_layout.tsx`
  - Configures navigation theme
  - Loads SpaceMono font
  - Sets up tab navigation
- **Config**: `app.json` with Expo settings
- **Platforms**: iOS, Android, Web

**Start commands**:

- All platforms: `npm run dev`
- iOS only: `npm run dev:ios`
- Android only: `npm run dev:android`
- Web only: `npm run dev:web`

### Startup Requirements

1. **Database**: PostgreSQL must be running via Docker Compose

   ```bash
   docker compose up -d
   ```

2. **Environment**: Root `.env` file (symlinked to backend)

3. **Initial Setup**: Run `make setup` for first-time setup

## Folder Structure

### Root Directory Organization

```text
music-practice-tracker/
├── packages/                # Monorepo packages
│   ├── apps/               # Application packages
│   │   ├── backend/        # NestJS API server
│   │   ├── admin/          # Next.js admin dashboard
│   │   └── mobile/         # React Native app
│   └── libs/               # Shared libraries
│       ├── eslint-configs/ # Shared ESLint rules
│       └── eslint-plugins/   # Custom architecture rules
├── scripts/                # Build and utility scripts
├── docker-compose.yml      # Database setup
├── Makefile               # Build automation
├── lefthook.yml           # Git hooks
├── commitlint.config.js   # Commit standards
├── cspell.config.js       # Spell checking
└── package.json           # Workspace configuration
```

### Backend Structure (Domain-Driven Design)

**Path**: `packages/apps/backend/`

```text
src/
├── admin-api.main.ts      # Admin API entry (port 3001)
├── app-api.main.ts        # App API entry (port 3000)
├── modules/
│   ├── aggregate/         # Domain aggregates
│   │   └── user/          # User aggregate example
│   │       ├── user.module.ts
│   │       ├── user.query.service.ts      # Read operations
│   │       ├── user.command.service.ts    # Write operations
│   │       ├── user.repository.service.ts # Data access
│   │       ├── user.admin.facade.service.ts
│   │       ├── user.app.facade.service.ts
│   │       ├── user.input.dto.ts
│   │       ├── user.response.dto.ts
│   │       └── user.constants.ts
│   ├── api/               # API layer
│   │   ├── admin/         # Admin endpoints
│   │   │   └── users/
│   │   │       ├── users.controller.ts
│   │   │       └── users.module.ts
│   │   └── app/           # App endpoints
│   │       └── users/
│   │           ├── users.controller.ts
│   │           └── users.module.ts
│   └── repository/        # Database connection
│       ├── repository.module.ts
│       └── repository.service.ts
├── decorators/            # Custom decorators
└── utils/                 # Shared utilities
```

**Database**: `prisma/`

```text
prisma/
├── schema.prisma          # Main schema
├── aggregate/             # Model definitions
│   └── user.prisma
└── migrations/            # Database migrations
```

**Tests**: `tests/`

```text
tests/
├── unit/                  # Service unit tests
├── integration/           # Database integration tests
└── e2e/                   # API endpoint tests
    ├── api/admin/         # Admin API tests
    └── api/app/           # App API tests
```

### Admin Dashboard Structure

**Path**: `packages/apps/admin/`

```text
src/
├── app/                   # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
└── components/            # Reusable components

tests/
├── unit/                  # Vitest unit tests
├── integration/           # Cypress tests
├── e2e/                   # Playwright tests
├── storybook/             # Component stories
└── msw/                   # API mocking
```

### Mobile App Structure

**Path**: `packages/apps/mobile/`

```text
src/
├── app/                   # Expo Router
│   ├── (tabs)/            # Tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx      # Home tab
│   │   └── explore.tsx    # Explore tab
│   ├── _layout.tsx        # Root layout
│   └── +not-found.tsx     # 404 page
├── components/            # Shared components
│   └── ui/                # UI components
├── constants/             # App constants
└── hooks/                 # Custom hooks
```

### Shared Libraries

**ESLint Configs**: `packages/libs/eslint-configs/`

- Base, backend, React, and React Native configurations
- Shared across all packages

**ESLint Rules**: `packages/libs/eslint-plugins/`

- Custom rules enforcing architecture patterns
- Repository access restrictions
- Naming convention enforcement

### Key Files and Their Purpose

**Configuration Files**:

- `tsconfig.json` - TypeScript configuration per package
- `nest-cli.json` - NestJS CLI settings (backend)
- `next.config.ts` - Next.js configuration (admin)
- `app.json` - Expo configuration (mobile)

**Generated Files**:

- `generated/prisma/` - Prisma client (backend)
- `generated/types/api.d.ts` - API types (frontend)
- `.next/` - Next.js build output
- `dist/` - Backend compiled output

### Naming Conventions

**Backend**:

- Services: `*.service.ts` (e.g., `user.query.service.ts`)
- Controllers: `*.controller.ts`
- Modules: `*.module.ts`
- DTOs: `*.dto.ts`
- Repository: `*.repository.service.ts`

**Frontend**:

- Components: PascalCase (e.g., `ThemedView.tsx`)
- Pages/Routes: camelCase (e.g., `explore.tsx`)
- Hooks: `use*.ts`
- Constants: PascalCase files

This structure supports:

- Clear separation of concerns
- Domain-driven design principles
- Scalable monorepo architecture
- Comprehensive testing strategies
- Shared code and configurations

## Database Schema

### Current Schema Overview

The project uses **PostgreSQL 15** with **Prisma ORM**. Currently, only the User model is implemented, but the architecture is prepared for expansion.

### Database Configuration

- **Main Database**: `postgresql://postgres:postgres@localhost:15432/music_practice_tracker`
- **Test Database**: Port 15433 (separate instance)
- **Docker Setup**: PostgreSQL 15-alpine with health checks
- **Connection Pool**: Max 200 connections

### Prisma Schema Organization

```text
prisma/
├── schema.prisma         # Generator and datasource config
├── aggregate/            # Model definitions
│   └── user.prisma      # User model
└── migrations/          # Migration history
```

### Current Models

#### User Model

```prisma
model User {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email     String    @unique
  name      String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([createdAt])
  @@index([deletedAt])
}
```

### Schema Conventions (Enforced)

Every model MUST include:

```prisma
// Required fields
id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
createdAt DateTime  @default(now())
updatedAt DateTime  @updatedAt
deletedAt DateTime? // For soft deletes

// Required indexes
@@index([createdAt])
@@index([deletedAt])
```

**Validation**: The `validate-prisma-schema.sh` script automatically enforces these conventions.

### Soft Delete Pattern

All models implement soft deletion:

- **Active Records**: `WHERE deletedAt IS NULL`
- **Deleted Records**: `WHERE deletedAt IS NOT NULL`
- **Repository Methods**:
  - `findActiveUser()` - Only active records
  - `findDeletedUser()` - Only deleted records
  - `findAnyUser()` - All records

### Migration Strategy

```bash
# Development
cd packages/apps/backend
bunx prisma migrate dev --name [migration_name]

# Production
bunx prisma migrate deploy

# Reset database (development only)
bunx prisma migrate reset
```

### Future Schema Plans

Based on the "Music Practice Tracker" purpose, expected models include:

- **PracticeSession**: Track individual practice sessions
- **Instrument**: User's instruments
- **Goal**: Practice goals and targets
- **Progress**: Analytics and progress tracking
- **Routine**: Practice routines and schedules

Each will follow the same UUID primary key and soft delete patterns.

### Database Access Rules

1. **Prisma access only through repository services**
2. **No direct database queries outside repositories**
3. **All models must support soft delete**
4. **UUID primary keys for all tables**
5. **Consistent timestamp fields**

### Performance Considerations

- Indexes on `createdAt` for time-based queries
- Indexes on `deletedAt` for soft delete filtering
- UUID generation at database level for performance
- Connection pooling configured for scalability

## Key Data Models

### Current Data Model Implementation

The project currently has only the **User** model implemented, serving as the foundation for the music practice tracking system.

### User Model

**Database Entity** (Prisma):

```prisma
model User {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email     String    @unique
  name      String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?
}
```

**Validation Constants**:

- `MAX_NAME_LENGTH = 50`
- `MAX_EMAIL_LENGTH = 255`

### Data Transfer Objects (DTOs)

The project uses separate DTOs for input validation and response serialization:

#### Input DTOs (`user.input.dto.ts`)

**Query Operations**:

- `FindUserByIdInputDto` - Single user lookup by UUID
- `FindManyUsersByIdInputDto` - Batch user lookup

**Write Operations**:

- `CreateUserInputDto` - Create single user (email, name)
- `CreateManyUsersInputDto` - Batch user creation
- `UpdateUserInputDto` - Update user data (partial)
- `DeleteUserByIdInputDto` - Soft delete
- `HardDeleteUserByIdInputDto` - Permanent delete
- `RestoreUserByIdInputDto` - Restore soft-deleted user

#### Response DTOs (`user.response.dto.ts`)

**User Response Types**:

- `ActiveUserResponseDto` - Users where `deletedAt IS NULL`
- `DeletedUserResponseDto` - Users where `deletedAt IS NOT NULL`
- `AnyUserResponseDto` - All users regardless of deletion
- `FullUserResponseDto` - Complete user with all fields

**Key Features**:

- Uses `@Exclude()/@Expose()` for serialization control
- Type transformation with `@Type(() => Date)`
- Dedicated transformation functions (e.g., `toActiveUserDto()`)

### Model Access Patterns

**Three-Tier Access**:

1. **Active Records**: Default queries filter `deletedAt IS NULL`
2. **Deleted Records**: Explicitly query soft-deleted records
3. **Any Records**: Query all records regardless of deletion status

**Repository Methods Follow Naming Convention**:

```typescript
findUniqueActiveUser(); // Active only
findUniqueDeletedUser(); // Deleted only
findUniqueAnyUser(); // All records
```

### Planned Domain Models

Based on the "Music Practice Tracker" purpose, future models will include:

#### Core Practice Models

**PracticeSession**:

- User relationship (many-to-one)
- Start/end timestamps
- Duration tracking
- Notes/comments
- Instrument reference

**Instrument**:

- User ownership (many-to-many)
- Instrument type/category
- Skill level
- Practice goals

**Exercise/Piece**:

- Title and composer
- Difficulty level
- Categories/tags
- Target tempo
- Performance notes

#### Progress Tracking Models

**Goal**:

- User relationship
- Target metrics
- Deadline
- Progress tracking
- Achievement status

**Progress**:

- Exercise/piece reference
- Performance metrics
- Tempo accuracy
- Recording references
- Improvement trends

**Routine**:

- Scheduled practice times
- Exercise sequences
- Duration targets
- Recurring patterns

### Model Relationships (Future)

```typescript
// Expected relationships
User -> PracticeSession (one-to-many)
User -> Instrument (many-to-many)
User -> Goal (one-to-many)
PracticeSession -> Instrument (many-to-one)
PracticeSession -> Exercise (many-to-many)
Exercise -> Progress (one-to-many)
Goal -> Progress (one-to-many)
```

### Data Model Principles

1. **UUID Primary Keys**: All models use database-generated UUIDs
2. **Soft Delete Pattern**: Every model includes `deletedAt` field
3. **Timestamp Tracking**: Automatic `createdAt` and `updatedAt`
4. **Validation at Input**: DTOs validate before database operations
5. **Transformation at Output**: Response DTOs control API serialization
6. **Repository Pattern**: Database access only through repositories
7. **Service Layer Separation**: Query vs Command services

### Type Safety

- **StrictOmit Utility**: Prevents accidentally setting system fields
- **Generated Prisma Types**: Type-safe database operations
- **DTO Validation**: Runtime validation with class-validator
- **Response Transformation**: Controlled serialization with class-transformer

## Technology Stack

### Core Technologies

- **Runtime**: Bun (package management), Node.js 22.x
- **Language**: TypeScript 5.8.3 across all packages
- **Monorepo**: Bun workspaces

### Backend Stack (NestJS)

- **Framework**: NestJS 11.0.1 with Express
- **Database**: PostgreSQL 15 (Alpine) on port 15432
- **ORM**: Prisma 6.11.1 with generated client
- **API Documentation**: @nestjs/swagger (OpenAPI)
- **Validation**: class-validator, class-transformer
- **Testing**: Jest 30.0.0, Supertest, jest-mock-extended

### Admin Dashboard Stack (Next.js)

- **Framework**: Next.js 15.3.3 with App Router
- **UI Library**: React 19.0.0
- **Bundler**: Turbopack (development)
- **Testing**:
  - E2E: Playwright 1.53.2
  - Integration: Cypress 14.5.1
  - Unit: Vitest 3.2.4
  - Component: Storybook 9.0.16
- **API Mocking**: MSW 2.10.3

### Mobile App Stack (React Native)

- **Framework**: React Native 0.79.4
- **Platform**: Expo 53.0.15
- **Navigation**: Expo Router 5.1.2, React Navigation 7.x
- **UI Components**:
  - React Native Reanimated 3.17.4
  - Gesture Handler 2.24.0
  - @expo/vector-icons 14.1.0
- **Web Support**: react-native-web 0.20.0

### Development Tools

- **Linting**: ESLint 9.29.0 with custom rules
- **Formatting**: Prettier 3.5.3
- **Git Hooks**: Lefthook 1.11.13
- **Commit Standards**: Commitlint with conventional commits
- **Spell Check**: CSpell 9.0.2
- **Secret Detection**: Secretlint 10.2.0
- **Markdown Linting**: markdownlint-cli 0.45.0

### Build Tools

- **TypeScript**: ts-node, ts-loader
- **Fast Compilation**: SWC (Rust-based compiler)
- **Path Mapping**: tsconfig-paths, vite-tsconfig-paths

### Testing Infrastructure

- **Unit/Integration**: Jest with ts-jest
- **E2E**: Playwright, Cypress
- **Component**: Storybook with Vitest
- **Coverage**: Vitest coverage-v8
- **API Mocking**: Mock Service Worker (MSW)

### Key Version Numbers

- PostgreSQL: 15-alpine
- TypeScript: 5.8.3
- Node.js types: 22.15.31
- React: 19.0.0
- React Native: 0.79.4
- Expo: 53.0.15

## Development Setup

### Initial Setup

```bash
make setup
```

This executes:

- `bun install` to install dependencies
- Copies `.env.example` to `.env` (if not exists)
- Symlinks root `.env` to backend directory
- Builds shared libraries (eslint-configs, eslint-plugins)
- Runs Prisma migrations

### Database

- PostgreSQL database runs via Docker Compose
- Prisma ORM manages database schema
- Generated Prisma client outputs to `packages/apps/backend/generated/prisma`
- Database URL: `postgresql://postgres:postgres@localhost:15432/music_practice_tracker`
- Port 15432 (not default 5432)

### Docker Commands

```bash
# Start database
docker compose up -d

# Stop database
docker compose down

# From backend directory
make docker-compose-up
make docker-compose-down
```

### Prisma Commands

```bash
# Run in backend directory
cd packages/apps/backend

# Create and run migration
bunx prisma migrate dev --name [migration_name]

# Push schema to database (development only)
bunx prisma db push

# Open Prisma Studio
bunx prisma studio

# Regenerate client
bunx prisma generate
```

## Development Commands

### Root Level Commands

```bash
# CI/CD - Run all quality checks
npm run ci:temp

# Type check all packages
npm run type:check

# Format check and fix
npm run format:check
npm run format:fix

# Spell check
npm run cspell

# Secret detection
npm run lint:secret:check
npm run lint:secret::fix
```

### Backend (packages/apps/backend)

```bash
# Development
npm run start:dev         # Start development server
npm run start:debug       # Start with debugging

# Build
npm run build
npm run start:prod

# Testing
npm run test              # Run all unit tests
npm run test:watch        # Watch mode
npm run test:e2e          # End-to-end tests
npm run test:cov          # Coverage report
npm run test:debug        # Debug mode

# Run single test file
bunx jest path/to/test.spec.ts

# Run tests matching pattern
bunx jest --testNamePattern="should create a user"

# Run specific test suite
bunx jest user.command.service.spec.ts

# Linting
npm run lint:es:check
npm run lint:es:fix

# Type checking
npm run type:check
```

### Admin (packages/apps/admin)

```bash
# Development (uses Turbopack)
npm run dev

# Build
npm run build
npm run start

# Linting
npm run lint:es:check
npm run lint:es:fix

# Type checking
npm run type:check
```

Note: Test setup not yet configured for Admin package.

### Mobile (packages/apps/mobile)

```bash
# Development
npm run dev
npm run dev:ios
npm run dev:android
npm run dev:web

# Linting (runs in parallel)
npm run lint
npm run lint:es:check
npm run lint:es:fix

# Type checking
npm run type:check

# Reset project
npm run reset-project
```

Note: Test setup not yet configured for Mobile package.

## Architecture

### Backend Framework Architecture

- **NestJS** framework with modular architecture
- **Prisma ORM** for database operations
- **PostgreSQL** database
- **Path aliases**: `@/*` maps to `./src/*`, `@/generated/*` maps to `./generated/*`

### Module Organization

- **AppModule**: Root module importing ApiModule
- **ApiModule**: Groups all API-related modules, organized by access type:
  - `src/modules/api/admin/` - Admin API endpoints (extended permissions)
  - `src/modules/api/app/` - Application API endpoints (regular users)
- **Aggregate Modules**: Domain modules in `src/modules/aggregate/` containing:
  - **Command Service**: Write operations (create, update, delete)
  - **Query Service**: Read operations with OrFail pattern
  - **Facade Services**: Orchestration layer for Admin/App APIs
  - **Repository Service**: Data access layer (one per aggregate)
  - **DTOs**: Input/Response types specific to the aggregate
- **RepositoryModule**: Provides centralized database connection

### Service Layer Pattern

Each aggregate follows a strict service separation:

```typescript
// Query Service: Read operations
class UserQueryService {
  findUserByIdOrFail(); // Throws NotFoundException if not found
  findManyUsers();
  findDeletedUserByIdOrFail();
}

// Command Service: Write operations
class UserCommandService {
  createUser();
  updateUserById(); // Validates existence via QueryService
  deleteUserById(); // Soft delete
  hardDeleteUserById(); // Permanent delete
  restoreUserById(); // Undo soft delete
}

// Facade Services: API orchestration
class UserAppFacadeService {} // App API operations
class UserAdminFacadeService {} // Admin API operations with extended permissions
```

**Important**: Services must be injected in the correct order to avoid circular dependencies. Query services should not depend on command services.

### Repository Pattern

- **Strict Access Control**: Only `*.repository.ts` or `*.repository.service.ts` files can access Prisma (enforced by ESLint)
- **Naming Convention**: Repository methods must follow specific patterns:
  - `findUnique*/findMany*` for queries
  - `create*/createMany*` for creation
  - `update*/updateMany*` for updates
  - `delete*/deleteMany*` for soft deletes
  - `hardDelete*` for permanent deletion
  - `restore*` for undoing soft deletes
- **Soft Delete Pattern**: All repositories implement active/deleted/any variants:
  - `findUniqueActiveUser` (deletedAt: null)
  - `findUniqueDeletedUser` (deletedAt: not null)
  - `findUniqueAnyUser` (both)

### Database Schema Requirements

- All models use UUID as primary key (PostgreSQL's gen_random_uuid() function)
- Required fields for each model: `id` (UUID), `createdAt`, `updatedAt`
- Prisma schema validation ensures consistency

### Prisma Schema Validation Rules

`scripts/validate-prisma-schema.sh` enforces:

1. **ID Fields**

   - Field name must be `id`
   - `String` type with `@id` attribute
   - `@db.Uuid` for UUID storage
   - `@default(dbgenerated("gen_random_uuid()"))`

2. **Timestamps**

   - `createdAt`: `DateTime` type with `@default(now())`
   - `updatedAt`: `DateTime` type with `@updatedAt`
   - `deletedAt`: `DateTime?` for soft delete support

3. **Required Indexes**

   - `@@index([createdAt])`
   - `@@index([deletedAt])`

4. **Constraints**
   - No composite primary keys (`@@id`)
   - All models must have the above fields

### Backend Test Configuration

- **Unit tests**: Jest configuration in `package.json`
  - Pattern: `*.spec.ts`
  - Root: `src` directory
  - Coverage from all `.ts` and `.js` files
- **Integration tests**: Test with real database
  - Use `IntegrationTestUtils` for setup/teardown
  - Test database on port 15433
- **E2E tests**: Configuration in `test/jest-e2e.json`
  - Pattern: `*.e2e-spec.ts`
  - Root: `test` directory
  - Full API testing with test database

### Shared Library Packages

- `packages/libs/eslint-configs/` - Shared ESLint configurations
- `packages/libs/eslint-plugins/` - Custom ESLint rules for enforcing architecture

## Architecture Patterns

### Domain-Driven Design

The backend implements Domain-Driven Design with clear aggregate boundaries:

- **Aggregate Root Pattern**: Each domain entity (e.g., User) is an aggregate with its own module
- **Bounded Contexts**: Separate Admin and App API contexts with different permissions
- **Domain Isolation**: All domain logic contained within aggregate modules

### Service Layer Architecture

Each aggregate implements a **4-layer service pattern**:

```typescript
UserModule/
├── UserRepositoryService     // Data Access Layer
├── UserQueryService          // Read Operations (with OrFail pattern)
├── UserCommandService        // Write Operations (CUD)
├── UserAdminFacadeService    // Admin API Orchestration
└── UserAppFacadeService      // App API Orchestration
```

**Key principles**:

- Query services never depend on command services
- Command services use query services for validation
- Facade services orchestrate multiple service calls
- Repository is the only layer with database access

### Repository Pattern Implementation

**Strict implementation with enforced conventions**:

- Database access only through `*.repository.service.ts` files
- Consistent method naming:
  - `findUnique*/findMany*` for queries
  - `create*/createMany*` for creation
  - `update*/updateMany*` for updates
  - `delete*/deleteMany*` for soft deletes
  - `hardDelete*` for permanent deletion
  - `restore*` for undoing soft deletes

**Soft Delete Pattern**:

```typescript
findUniqueActiveUser(); // WHERE deletedAt IS NULL
findUniqueDeletedUser(); // WHERE deletedAt IS NOT NULL
findUniqueAnyUser(); // No deletedAt filter
```

### API Design Patterns

- **RESTful Resources**: Consistent endpoint structure
- **Dual API Architecture**:
  - App API (port 3000): Limited user operations
  - Admin API (port 3001): Full CRUD with soft-deleted access
- **DTO Pattern**: Separate Input/Response DTOs per aggregate
- **Global Validation**: NestJS ValidationPipe with whitelist strategy
- **OpenAPI Documentation**: Auto-generated Swagger docs

### Error Handling Patterns

- **OrFail Pattern**: Query methods throw `NotFoundException` when no results
- **Consistent Exceptions**: NestJS built-in exceptions throughout
- **Validation Errors**: Automatic 400 responses with detailed messages
- **Error Propagation**: Proper error bubbling through service layers

### Testing Patterns

**Layered testing strategy**:

1. **Unit Tests**: Isolated service testing with mocks
2. **Integration Tests**: Service interaction testing with real database
3. **E2E Tests**: Full API flow testing

**Test Utilities**:

```typescript
// Mock factory pattern
const mockRepo = createMockUserRepositoryService();

// Test module pattern
const module = await createTestModule({
  providers: [UserQueryService, mockRepo],
});
```

### Database Design Patterns

- **UUID Primary Keys**: PostgreSQL `gen_random_uuid()`
- **Required Fields**: id, createdAt, updatedAt, deletedAt
- **Index Strategy**: Automatic indexes on timestamps
- **Schema Validation**: Enforced by `validate-prisma-schema.sh`

### Code Organization Patterns

**Monorepo with Clear Boundaries**:

- Feature-based module organization
- Shared libraries for cross-cutting concerns
- Custom ESLint rules enforcing architecture
- Path aliases for clean imports (`@/*`)

### Security Patterns

- **Input Validation**: class-validator decorators on DTOs
- **UUID Validation**: ParseUUIDPipe for all ID parameters
- **Whitelist Strategy**: Only specified fields accepted
- **Environment Isolation**: Separate development/test databases

### Dependency Injection

- **Constructor Injection**: NestJS IoC container
- **Service Registration**: Explicit provider configuration
- **Circular Dependency Prevention**: Careful service layering

## Key Technologies

- **Runtime**: Bun for package management and development
- **Language**: TypeScript across all packages
- **Database**: PostgreSQL with Prisma
- **Backend**: NestJS
- **Frontend**: Next.js (admin), React Native with Expo (mobile)
- **Testing**: Jest
- **Linting**: ESLint with Prettier
- **Git hooks**: Lefthook for pre-commit checks
- **Commits**: commitlint for Conventional commits

## Custom ESLint Rules

The project enforces architectural patterns through custom ESLint rules:

1. **prisma-repository-only-access**: Prisma can only be accessed from repository files
2. **prisma-create-naming-convention**: Create methods must start with "create"
3. **prisma-find-naming-convention**: Find methods must follow naming patterns
4. **prisma-update-naming-convention**: Update methods must follow naming patterns
5. **prisma-delete-naming-convention**: Delete methods must follow naming patterns
6. **prisma-create-no-deleted-at**: Cannot set deletedAt during creation
7. **repository-model-access-restriction**: Enforces repository boundaries

## Git Hook Configuration

Lefthook automation:

- Commit message validation (commitlint)
- Automatic package.json sorting
- Automatic Prisma schema validation (validate-prisma-schema)
- Secret detection with secretlint
- Parallel processing for performance

## Environment Configuration

- Root `.env` file for database configuration
- Symlinked to backend for database access
- PostgreSQL runs on port 15432 (not default 5432)

## Utility Scripts

Located in root `scripts/` directory:

- `validate-prisma-schema.sh`: Validates Prisma schema conventions
- `postinstall.sh`: Post-installation setup
- `type_check.sh`: Type checks all packages
- `type_sync_and_install.sh`: Type synchronization and installation

## Type Safety Utilities

- **StrictOmit**: Custom type utility providing stricter TypeScript omit behavior
- Used to prevent setting certain fields (e.g., deletedAt) in create/update operations

## API Layer Design

### Controller Organization

- Admin controllers: Full CRUD operations including soft-deleted records
- App controllers: Limited operations, no access to deleted records
- Use `@ApiController` decorator for consistent OpenAPI documentation

### DTO Patterns

- Input DTOs: Use class-validator for validation
- Response DTOs: Transform Prisma entities to API responses
- Separate DTOs for Admin and App APIs when needed

## Testing Best Practices

### Running Tests

```bash
# Backend - Run all tests
cd packages/apps/backend
npm run test

# Run specific test file
bunx jest user.command.service.spec.ts

# Run with coverage
npm run test:cov

# Debug specific test
bunx jest --detectOpenHandles user.repository.service.spec.ts
```

### Testing Organization

- Unit tests: Mock all dependencies
- Integration tests: Use real database with transactions
- E2E tests: Test full API flow with supertest
