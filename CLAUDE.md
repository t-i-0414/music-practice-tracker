# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Music Practice Tracker** is a comprehensive platform for musicians to track and manage their music practice sessions. The project helps users:

- Track practice sessions with detailed metrics (duration, tempo, notes)
- Manage multiple instruments and skill levels
- Set and monitor practice goals
- Track progress on specific pieces/exercises
- Generate insights and statistics about practice habits
- Create and follow practice routines

### Application Architecture

The project consists of three applications:

1. **Backend API** (NestJS)
   - **App API** (port 3000): For musicians to manage their practice data
   - **Admin API** (port 3001): For system administrators with extended permissions

2. **Admin Dashboard** (Next.js)
   - Web interface for system administration
   - User management and analytics

3. **Mobile App** (React Native/Expo)
   - Cross-platform app for iOS, Android, and Web
   - Primary interface for musicians to log practice sessions

### Current Status

- ✅ Infrastructure and architecture complete
- ✅ User management system implemented
- ⏳ Music practice features to be implemented (sessions, instruments, goals, progress tracking)

## Codebase Overview

### Monorepo Structure

```text
music-practice-tracker/
├── packages/
│   ├── apps/                    # Application packages
│   │   ├── backend/             # NestJS API server
│   │   ├── admin/               # Next.js admin dashboard
│   │   └── mobile/              # React Native mobile app
│   └── libs/                    # Shared libraries
│       ├── eslint-configs/      # Shared ESLint configurations
│       ├── eslint-plugins/      # Custom architectural rules
│       └── tsconfig-base/       # Base TypeScript config
├── scripts/                     # Build and utility scripts
├── docker-compose.yml           # PostgreSQL database setup
└── Makefile                     # Root-level automation
```

### Backend Architecture (NestJS)

The backend implements **Domain-Driven Design** with strict layered architecture:

```text
src/
├── admin-api.main.ts           # Admin API entry (port 3001)
├── app-api.main.ts             # App API entry (port 3000)
└── modules/
    ├── aggregate/              # Domain layer
    │   └── user/               # User aggregate
    │       ├── user.module.ts
    │       ├── user.repository.service.ts    # Data access
    │       ├── user.query.service.ts         # Read operations
    │       ├── user.command.service.ts       # Write operations
    │       ├── user.admin.facade.service.ts  # Admin orchestration
    │       ├── user.app.facade.service.ts    # App orchestration
    │       ├── user.input.dto.ts             # Input validation
    │       ├── user.response.dto.ts          # Response types
    │       └── user.constants.ts             # Domain constants
    ├── api/                    # Presentation layer
    │   ├── admin/              # Admin endpoints
    │   └── app/                # App endpoints
    └── repository/             # Infrastructure layer
        └── repository.service.ts              # Prisma client
```

**Key Patterns**:

- **Service Separation**: Query (read) vs Command (write) services
- **Facade Pattern**: Different facades for Admin vs App APIs
- **Repository Pattern**: All database access through repositories
- **DTO Pattern**: Separate input/response DTOs with validation
- **Soft Delete**: All entities support soft deletion by default

### Frontend Applications

#### Admin Dashboard (Next.js 15)

- **Framework**: Next.js with App Router
- **Styling**: CSS Modules
- **Testing**: Playwright (E2E), Cypress (integration), Vitest (unit)
- **API Mocking**: MSW for development
- **Build**: Turbopack for fast development

#### Mobile App (React Native/Expo)

- **Framework**: Expo 53 with Expo Router
- **Navigation**: Tab-based navigation
- **Components**: Custom UI components with theme support
- **Platforms**: iOS, Android, Web
- **Testing**: Jest with React Native Testing Library

### Database Layer (Prisma)

```text
prisma/
├── schema.prisma               # Main configuration
├── aggregate/                  # Domain models
│   └── user.prisma            # User model definition
└── migrations/                 # Database migrations
```

**Schema Requirements** (enforced by validation script):

- UUID primary keys using `gen_random_uuid()`
- Required timestamps: `createdAt`, `updatedAt`, `deletedAt`
- Indexes on `createdAt` and `deletedAt`

### Testing Strategy

**Backend Testing**:

- **Unit Tests**: Service isolation with mocks
- **Integration Tests**: Real database with transactions
- **E2E Tests**: Full API testing with Supertest
- **Coverage**: Minimum 80% required

**Frontend Testing**:

- **Component Tests**: Storybook + Vitest
- **Integration Tests**: Cypress for user flows
- **E2E Tests**: Playwright for critical paths

### Quality Enforcement

**Custom ESLint Rules** (in `eslint-plugins`):

- `prisma-repository-only-access`: Enforces repository pattern
- `prisma-naming-convention`: Method naming standards
- `no-internal-id`: Prevents internal ID exposure
- `repository-model-access-restriction`: Domain boundaries

**Pre-commit Hooks** (via Lefthook):

- Spell checking (CSpell)
- Code formatting (Prettier)
- Linting (ESLint)
- Secret detection (Secretlint)
- Commit message validation (Commitlint)

### Development Workflow

1. **Feature Development**:
   - Create domain aggregate if needed
   - Implement repository, query, command services
   - Add facade services for API orchestration
   - Create controllers with proper DTOs
   - Write comprehensive tests

2. **API Design**:
   - RESTful endpoints with OpenAPI documentation
   - Separate Admin/App APIs with different permissions
   - Global validation and error handling
   - Consistent response formatting

3. **Database Changes**:
   - Create Prisma migration
   - Update DTOs and services
   - Run integration tests
   - Update API documentation

## Technology Stack

### Core Technologies

- **Runtime**: Bun (package management) + Node.js 22.x
- **Language**: TypeScript 5.8.3 (strict mode)
- **Monorepo**: Bun workspaces

### Backend Technologies

**Framework & Core**:

- NestJS 11.0.1 (Express adapter)
- Prisma ORM 6.13.0
- PostgreSQL 15 (Alpine)
- @nestjs/swagger (OpenAPI documentation)

**Validation & Transformation**:

- class-validator
- class-transformer
- @nestjs/mapped-types

**Testing**:

- Jest 30.0.0
- Supertest
- jest-mock-extended

### Frontend Technologies

#### Admin Dashboard (Next.js)

**Core**:

- Next.js 15.3.3 (App Router)
- React 19.0.0
- TypeScript 5.8.3
- Turbopack (development bundler)

**Testing**:

- Playwright 1.54.1 (E2E)
- Cypress 14.5.3 (integration)
- Vitest 3.2.4 (unit tests)
- Storybook 9.0.18 (component development)
- MSW 2.10.4 (API mocking)

#### Mobile App (React Native)

**Core**:

- React Native 0.79.4
- Expo 53.0.15
- Expo Router 5.1.2
- React Navigation 7.x

**UI & Animation**:

- React Native Reanimated 3.17.4
- React Native Gesture Handler 2.24.0
- @expo/vector-icons 14.1.0
- react-native-web 0.20.0 (web support)

**Testing**:

- Jest with React Native Testing Library
- React Test Renderer

### Development Tools

**Code Quality**:

- ESLint 9.32.0 (with custom plugins)
- Prettier 3.6.2
- CSpell 9.2.0 (spell checking)
- Secretlint 10.2.1 (secret detection)
- markdownlint-cli 0.45.0

**Build Tools**:

- SWC (fast TypeScript/JavaScript compilation)
- ts-node 10.9.2
- ts-loader 9.5.2
- Babel (for React Native)
- Vite 7.0.6 (for Vitest)

**Git & CI/CD**:

- Lefthook 1.12.2 (git hooks)
- Commitlint (conventional commits)
- GitHub Actions (CI/CD)
- Changesets (versioning)

### Database & ORM

- PostgreSQL 15-alpine (ports: 15432 dev, 15433 test)
- Prisma 6.13.0
- Database migrations
- Connection pooling (max 200)

### Key NPM Packages

**Utilities**:

- dotenv 17.2.1
- cross-env 10.0.0
- npm-run-all2 8.0.4

**Type Definitions**:

- @types/node 24.1.0
- @types/react 19.1.9
- @types/jest 30.0.0

### Custom Packages

**Shared Libraries**:

- `@music-practice-tracker/eslint-configs`: Shared ESLint rules
- `@music-practice-tracker/eslint-plugins`: Custom architecture enforcement
- `@music-practice-tracker/tsconfig-base`: Base TypeScript configuration

### API & Documentation

- RESTful APIs
- OpenAPI/Swagger documentation
- Dual API architecture (Admin/App)
- Global validation pipes
- DTO pattern with class-validator

### Infrastructure

- Docker Compose (PostgreSQL)
- Environment configuration (.env files)
- Path aliases (@/\* for cleaner imports)
- Monorepo with Bun workspaces

## Main Entry Points

### Backend Entry Points (NestJS)

The backend has **two separate NestJS applications** with different entry points:

#### 1. App API (`packages/apps/backend/src/app-api.main.ts`)

```typescript
// Main entry for regular users
// Port: 3000 (configurable via PORT env)
// Module: AppApiModule
// Features: User-specific operations, active records only
```

**Start commands**:

```bash
cd packages/apps/backend
npm run start:dev:app-api    # Development
npm run start:prod:app-api   # Production
npm run start:dev            # Starts both APIs
```

#### 2. Admin API (`packages/apps/backend/src/admin-api.main.ts`)

```typescript
// Main entry for administrators
// Port: 3001 (configurable via PORT env)
// Module: AdminApiModule
// Features: Full CRUD, bulk operations, deleted records access
```

**Start commands**:

```bash
cd packages/apps/backend
npm run start:dev:admin-api   # Development
npm run start:prod:admin-api  # Production
```

**Common initialization** (both APIs):

```typescript
// Global pipes for validation
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }),
);

// Response transformation
app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

// Swagger documentation (dev only)
if (!isProduction) {
  SwaggerModule.setup('api', app, document);
}
```

### Frontend Entry Points

#### Admin Dashboard (Next.js)

- **Entry**: Standard Next.js App Router structure
- **Root Layout**: `packages/apps/admin/src/app/layout.tsx`
- **Home Page**: `packages/apps/admin/src/app/page.tsx`
- **Config**: `packages/apps/admin/next.config.ts`
- **Port**: 8000

**Start commands**:

```bash
cd packages/apps/admin
npm run dev    # Development with Turbopack
npm run build  # Production build
npm run start  # Production server
```

#### Mobile App (React Native/Expo)

- **Entry**: `packages/apps/mobile/index.tsx` (registers Expo Router)
- **Root Layout**: `packages/apps/mobile/src/app/_layout.tsx`
- **Tab Layout**: `packages/apps/mobile/src/app/(tabs)/_layout.tsx`
- **Config**: `packages/apps/mobile/app.config.ts`

**Start commands**:

```bash
cd packages/apps/mobile
npm run dev          # All platforms
npm run dev:ios      # iOS simulator
npm run dev:android  # Android emulator
npm run dev:web      # Web browser
```

### Database Entry Point

- **Docker Compose**: Root `docker-compose.yml`
- **PostgreSQL**: Port 15432 (dev), 15433 (test)
- **Start**: `docker compose up -d`

### Development Entry Point

**Quick start** (from root):

```bash
# First time setup
make setup

# Start everything
docker compose up -d              # Database
cd packages/apps/backend && npm run start:dev  # Both APIs
cd packages/apps/admin && npm run dev           # Admin dashboard
cd packages/apps/mobile && npm run dev          # Mobile app
```

### Build Entry Points

**Monorepo build** (from root):

```bash
# Build shared libraries first
make -C packages/libs/eslint-configs build
make -C packages/libs/eslint-plugins build

# Then build applications
cd packages/apps/backend && npm run build
cd packages/apps/admin && npm run build
cd packages/apps/mobile && expo export
```

### Test Entry Points

**Run all tests** (from root):

```bash
npm run test  # Runs tests in all packages
```

**Package-specific tests**:

```bash
# Backend
cd packages/apps/backend
npm run test      # Unit tests
npm run test:e2e  # E2E tests
npm run test:cov  # Coverage

# Admin
cd packages/apps/admin
npm run test:unit  # Vitest
npm run test:e2e   # Playwright

# Mobile
cd packages/apps/mobile
npm run test       # Jest
```

## Folder Structure

### Root Directory

```text
music-practice-tracker/
├── packages/                    # Monorepo packages (Bun workspaces)
├── scripts/                     # Build and utility scripts
├── bin/                         # Binary executables (dotenv-linter)
├── docker-compose.yml           # PostgreSQL database configuration
├── Makefile                     # Project automation commands
├── lefthook.yml                 # Git hooks configuration
├── commitlint.config.js         # Commit message standards
├── cspell.config.js             # Spell checking configuration
├── .env.example                 # Environment variable template
└── package.json                 # Root workspace configuration
```

### Packages Directory Structure

```text
packages/
├── apps/                        # Application packages
│   ├── backend/                 # NestJS API server
│   ├── admin/                   # Next.js admin dashboard
│   └── mobile/                  # React Native mobile app
└── libs/                        # Shared libraries
    ├── eslint-configs/          # Shared ESLint configurations
    ├── eslint-plugins/          # Custom ESLint rules
    └── tsconfig-base/           # Base TypeScript configuration
```

### Backend Structure (`packages/apps/backend/`)

```text
backend/
├── src/                         # Source code
│   ├── admin-api.main.ts        # Admin API entry point (port 3001)
│   ├── app-api.main.ts          # App API entry point (port 3000)
│   ├── modules/                 # Business logic modules
│   │   ├── aggregate/           # Domain aggregates
│   │   │   └── user/            # User aggregate
│   │   │       ├── user.module.ts
│   │   │       ├── user.repository.service.ts     # Data access
│   │   │       ├── user.query.service.ts          # Read operations
│   │   │       ├── user.command.service.ts        # Write operations
│   │   │       ├── user.admin.facade.service.ts   # Admin orchestration
│   │   │       ├── user.app.facade.service.ts     # App orchestration
│   │   │       ├── user.input.dto.ts              # Request validation
│   │   │       ├── user.response.dto.ts           # Response types
│   │   │       └── user.constants.ts              # Domain constants
│   │   ├── api/                 # REST API layer
│   │   │   ├── admin/           # Admin-specific endpoints
│   │   │   │   ├── admin.module.ts
│   │   │   │   └── users/
│   │   │   │       ├── users.controller.ts
│   │   │   │       └── users.module.ts
│   │   │   └── app/             # App-specific endpoints
│   │   │       ├── app.module.ts
│   │   │       └── users/
│   │   │           ├── users.controller.ts
│   │   │           └── users.module.ts
│   │   └── repository/          # Database connection
│   │       ├── repository.module.ts
│   │       └── repository.service.ts
│   ├── decorators/              # Custom decorators
│   │   └── api-controller.decorator.ts
│   └── utils/                   # Utility functions
│       ├── ensure-public-ids-to-array.ts
│       ├── environment.ts
│       ├── publicize.ts
│       └── strict-omit.ts
├── prisma/                      # Database schema
│   ├── schema.prisma            # Main Prisma configuration
│   ├── aggregate/               # Domain model definitions
│   │   └── user.prisma          # User model
│   └── migrations/              # Database migrations
│       └── [timestamp]_[name]/
│           └── migration.sql
├── tests/                       # Test files
│   ├── unit/                    # Unit tests (mirrors src structure)
│   ├── integration/             # Integration tests
│   │   └── helpers/
│   │       └── integration-test-utils.ts
│   ├── e2e/                     # End-to-end tests
│   │   └── api/
│   │       ├── admin/           # Admin API tests
│   │       └── app/             # App API tests
│   ├── factory/                 # Test data factories
│   │   └── user.factory.ts
│   └── helpers/                 # Test utilities
│       ├── database-test-utils.ts
│       └── index.ts
├── generated/                   # Generated code
│   └── prisma/                  # Prisma client
├── dist/                        # Compiled output
├── coverage/                    # Test coverage reports
├── scripts/                     # Backend-specific scripts
│   └── open-swagger-ui.ts
├── nest-cli.json                # NestJS CLI configuration
├── tsconfig.json                # TypeScript configuration
├── tsconfig.build.json          # Build-specific TS config
└── package.json                 # Dependencies and scripts
```

### Admin Dashboard Structure (`packages/apps/admin/`)

```text
admin/
├── src/                         # Source code
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── page.module.css      # Page styles
│   │   ├── globals.css          # Global styles
│   │   └── favicon.ico
│   └── components/              # Reusable components
├── public/                      # Static assets
│   ├── mockServiceWorker.js     # MSW for API mocking
│   └── [various SVG icons]
├── tests/                       # Test suites
│   ├── unit/                    # Vitest unit tests
│   │   ├── sample.test.ts
│   │   ├── setup.ts
│   │   └── vitest.config.ts
│   ├── integration/             # Cypress tests
│   │   ├── cypress.config.ts
│   │   ├── pages/               # Page tests
│   │   └── support/             # Test helpers
│   ├── e2e/                     # Playwright tests
│   │   ├── playwright.config.ts
│   │   └── users.spec.ts
│   ├── storybook/               # Component stories
│   │   └── stories/
│   └── msw/                     # Mock Service Worker
│       ├── handlers.ts
│       ├── server.ts
│       └── worker.ts
├── generated/                   # Generated types
│   └── types/
│       └── api.d.ts             # Backend API types
├── scripts/                     # Admin-specific scripts
│   ├── gen.api-types.ts         # Generate API types
│   ├── start.dev.ts
│   └── start.prod.ts
├── next.config.ts               # Next.js configuration
├── next-env.d.ts                # Next.js types
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

### Mobile App Structure (`packages/apps/mobile/`)

```text
mobile/
├── src/                         # Source code
│   ├── app/                     # Expo Router pages
│   │   ├── (tabs)/              # Tab navigation
│   │   │   ├── _layout.tsx      # Tab layout
│   │   │   ├── index.tsx        # Home tab
│   │   │   └── explore.tsx      # Explore tab
│   │   ├── _layout.tsx          # Root layout
│   │   └── +not-found.tsx       # 404 page
│   ├── components/              # Reusable components
│   │   ├── ui/                  # UI components
│   │   │   ├── IconSymbol.tsx   # Icon system
│   │   │   ├── IconSymbol.ios.tsx
│   │   │   └── TabBarBackground.ios.tsx
│   │   ├── Button.tsx
│   │   ├── Collapsible.tsx
│   │   ├── ExternalLink.tsx
│   │   ├── HapticTab.tsx
│   │   ├── HelloWave.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ParallaxScrollView.tsx
│   │   ├── ThemedText.tsx
│   │   └── ThemedView.tsx
│   ├── constants/               # App constants
│   │   ├── Colors.ts
│   │   └── Size.ts
│   ├── hooks/                   # Custom React hooks
│   │   ├── useColorScheme.ts
│   │   ├── useColorScheme.web.ts
│   │   └── useThemeColor.ts
│   └── assets/                  # Static assets
│       ├── fonts/
│       │   └── SpaceMono-Regular.ttf
│       └── images/
│           ├── icon.png
│           ├── splash-icon.png
│           └── [various image assets]
├── tests/                       # Test files
│   ├── unit/                    # Jest unit tests
│   │   └── components/
│   ├── e2e/                     # Maestro E2E tests
│   │   └── main-e2e.yaml
│   └── storybook/               # Component stories
│       └── components/
├── generated/                   # Generated types
│   └── types/
│       └── api.d.ts             # Backend API types
├── scripts/                     # Mobile-specific scripts
│   ├── gen.api-types.ts         # Generate API types
│   ├── reset-project.js         # Reset Expo project
│   └── start.dev.ts
├── app.config.ts                # Expo configuration
├── babel.config.js              # Babel configuration
├── metro.config.js              # Metro bundler config
├── index.tsx                    # App entry point
├── expo-env.d.ts                # Expo types
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

### Shared Libraries Structure

#### ESLint Configs (`packages/libs/eslint-configs/`)

```text
eslint-configs/
├── src/
│   ├── index.ts                 # Main export
│   ├── eslint-config-base.ts   # Base configuration
│   ├── eslint-config-base-script.ts
│   ├── eslint-config-typescript.ts
│   ├── eslint-config-react.ts
│   ├── eslint-config-react-native.ts
│   ├── eslint-config-jest.ts
│   ├── eslint-config-cypress.ts
│   ├── eslint-config-playwright.ts
│   ├── eslint-config-storybook.ts
│   ├── eslint-config-vitest.ts
│   ├── shared-ignores.ts
│   └── shared-test-file-patterns.ts
├── dist/                        # Compiled output
└── package.json
```

#### ESLint Plugins (`packages/libs/eslint-plugins/`)

```text
eslint-plugins/
├── src/
│   ├── index.ts
│   └── plugin-backend/          # Backend-specific rules
│       ├── index.ts
│       ├── no-internal-id.ts
│       ├── prisma-naming-convention.ts
│       ├── prisma-repository-only-access.ts
│       ├── repository-model-access-restriction.ts
│       └── utils/
│           └── prisma-helpers.ts
├── tests/                       # Rule tests
│   └── plugin-backend/
├── dist/                        # Compiled output
└── package.json
```

### Key Folder Conventions

1. **Source Code**: Always in `src/` directory
2. **Tests**: Mirror source structure in `tests/`
3. **Generated Code**: In `generated/` directory
4. **Build Output**: In `dist/` directory
5. **Configuration**: Root level of each package
6. **Scripts**: Package-specific in `scripts/`
7. **Static Assets**:
   - Frontend: `public/`
   - Mobile: `src/assets/`

### File Naming Conventions

**Backend**:

- Services: `*.service.ts`
- Controllers: `*.controller.ts`
- Modules: `*.module.ts`
- DTOs: `*.dto.ts`
- Constants: `*.constants.ts`
- Tests: `*.spec.ts`

**Frontend**:

- Components: PascalCase (e.g., `Button.tsx`)
- Pages: lowercase (e.g., `page.tsx`)
- Styles: `*.module.css` or `*.css`
- Tests: `*.test.ts` or `*.spec.ts`

**Shared**:

- TypeScript configs: `tsconfig.*.json`
- Environment: `.env.*`
- Ignore files: `.*ignore`

## Database Schema

### Overview

The project uses **PostgreSQL 15** with **Prisma ORM** for database management. The schema follows Domain-Driven Design principles with each aggregate having its own model file.

### Database Configuration

```yaml
# Development
Host: localhost
Port: 15432
Database: music_practice_tracker
User: postgres
Password: postgres

# Test
Host: localhost
Port: 15433
Database: music_practice_tracker_test

# Connection String
DATABASE_URL="postgresql://postgres:postgres@localhost:15432/music_practice_tracker"
```

### Current Schema

#### User Model

```prisma
enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING
  BANNED
}

model User {
  id        Int        @id @default(autoincrement())
  publicId  String     @unique @default(uuid()) @db.Uuid
  email     String     @unique
  name      String
  status    UserStatus @default(PENDING)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@index([email])
  @@index([name])
  @@index([status])
  @@index([createdAt])
  @@map("users")
}
```

**Key Design Decisions**:

1. **Dual ID System**:
   - `id`: Internal auto-increment integer (never exposed)
   - `publicId`: External UUID for API operations

2. **Status Enum**:
   - Explicit user states for access control
   - Default to PENDING for new users

3. **Indexes**:
   - Email (unique): Fast authentication lookups
   - Name: Search functionality
   - Status: Filtering active/inactive users
   - CreatedAt: Time-based queries

4. **Naming Conventions**:
   - Snake_case in database (`public_id`, `created_at`)
   - CamelCase in Prisma models (`publicId`, `createdAt`)
   - Table names are pluralized (`users`)

### Schema Patterns

#### Required Fields (All Models)

```prisma
// Every model MUST have these fields
id        Int      @id @default(autoincrement())
publicId  String   @unique @default(uuid()) @db.Uuid
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Required indexes
@@index([createdAt])
```

#### Soft Delete Pattern

While the current User model doesn't implement soft delete, future models will include:

```prisma
deletedAt DateTime? @map("deleted_at")
@@index([deletedAt])
```

This enables three-tier data access:

- Active: `WHERE deletedAt IS NULL`
- Deleted: `WHERE deletedAt IS NOT NULL`
- Any: No filter

### Database Migrations

Migrations are managed through Prisma:

```bash
# Create new migration
cd packages/apps/backend
bunx prisma migrate dev --name description_of_change

# Apply migrations (production)
bunx prisma migrate deploy

# Reset database (development only)
bunx prisma migrate reset
```

Current migrations:

- `20250727223832_create_users_table`: Initial user table with status enum

### Planned Schema Extensions

Based on the Music Practice Tracker domain, future models include:

#### PracticeSession

```prisma
model PracticeSession {
  id           Int      @id @default(autoincrement())
  publicId     String   @unique @default(uuid()) @db.Uuid
  userId       Int
  instrumentId Int
  startTime    DateTime
  endTime      DateTime?
  duration     Int?     // minutes
  notes        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  deletedAt    DateTime?

  user       User       @relation(fields: [userId], references: [id])
  instrument Instrument @relation(fields: [instrumentId], references: [id])
  exercises  PracticeSessionExercise[]

  @@index([userId])
  @@index([instrumentId])
  @@index([startTime])
  @@index([createdAt])
  @@index([deletedAt])
}
```

#### Instrument

```prisma
model Instrument {
  id        Int      @id @default(autoincrement())
  publicId  String   @unique @default(uuid()) @db.Uuid
  name      String
  type      String   // guitar, piano, violin, etc.
  brand     String?
  model     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  userInstruments UserInstrument[]
  sessions        PracticeSession[]

  @@index([type])
  @@index([createdAt])
  @@index([deletedAt])
}
```

#### Exercise/Piece

```prisma
model Exercise {
  id         Int      @id @default(autoincrement())
  publicId   String   @unique @default(uuid()) @db.Uuid
  title      String
  composer   String?
  category   String   // scales, etudes, pieces, etc.
  difficulty Int?     // 1-10
  targetTempo Int?    // BPM
  notes      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  deletedAt  DateTime?

  sessions PracticeSessionExercise[]
  progress ExerciseProgress[]

  @@index([category])
  @@index([difficulty])
  @@index([createdAt])
  @@index([deletedAt])
}
```

#### Goal

```prisma
model Goal {
  id          Int      @id @default(autoincrement())
  publicId    String   @unique @default(uuid()) @db.Uuid
  userId      Int
  title       String
  description String?
  targetDate  DateTime?
  completed   Boolean  @default(false)
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  user     User              @relation(fields: [userId], references: [id])
  progress GoalProgress[]

  @@index([userId])
  @@index([targetDate])
  @@index([completed])
  @@index([createdAt])
  @@index([deletedAt])
}
```

### Relationships

```mermaid
erDiagram
    User ||--o{ UserInstrument : owns
    User ||--o{ PracticeSession : performs
    User ||--o{ Goal : sets
    Instrument ||--o{ UserInstrument : "owned by"
    Instrument ||--o{ PracticeSession : "used in"
    PracticeSession ||--o{ PracticeSessionExercise : includes
    Exercise ||--o{ PracticeSessionExercise : "practiced in"
    Exercise ||--o{ ExerciseProgress : tracks
    Goal ||--o{ GoalProgress : measures
```

### Database Access Patterns

#### Repository Methods

Each model's repository follows consistent naming:

```typescript
// User repository example
findUniqueActiveUser(where: { publicId })
findUniqueDeletedUser(where: { publicId })
findUniqueAnyUser(where: { publicId })
findManyActiveUsers(where: { status: 'ACTIVE' })
createUser(data: { email, name })
updateUser(where: { publicId }, data: { name })
deleteUser(where: { publicId }) // Soft delete
hardDeleteUser(where: { publicId }) // Permanent
restoreUser(where: { publicId }) // Undo soft delete
```

#### Query Optimization

1. **Use publicId for external queries**: Never expose internal IDs
2. **Index frequently queried fields**: Status, dates, foreign keys
3. **Composite indexes for complex queries**: Consider multi-column indexes
4. **Limit eager loading**: Use `include` judiciously

### Security Considerations

1. **UUID Generation**: Database-level with `gen_random_uuid()`
2. **Email Validation**: Unique constraint + application validation
3. **Status Control**: Enum prevents invalid states
4. **Timestamp Integrity**: Database-managed, not client-controlled

### Prisma Configuration

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Key Settings**:

- Client output to `generated/prisma/`
- Environment-based connection string
- PostgreSQL-specific features enabled

## Key Data Models

### Overview

The Music Practice Tracker uses a layered data model approach with clear separation between database entities, domain models, and API representations. Each layer serves a specific purpose in maintaining data integrity and business logic.

### Data Model Layers

1. **Database Entities** (Prisma Models): Raw database representation
2. **Domain Models** (Services): Business logic and validation
3. **DTOs** (Data Transfer Objects): API request/response shapes
4. **View Models** (Frontend): UI-specific representations

### Current Data Models

#### User Model

The User is the core entity representing musicians using the platform.

**Database Entity**:

```prisma
model User {
  id        Int        @id @default(autoincrement())
  publicId  String     @unique @default(uuid())
  email     String     @unique
  name      String
  status    UserStatus @default(PENDING)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

**Domain Concepts**:

- **Identity**: Dual ID system (internal numeric, external UUID)
- **Authentication**: Email-based (unique constraint)
- **Authorization**: Status-based access control
- **User States**:
  - `PENDING`: Newly registered, awaiting activation
  - `ACTIVE`: Full access to features
  - `INACTIVE`: Voluntary deactivation
  - `SUSPENDED`: Temporary restriction
  - `BANNED`: Permanent restriction

**Input DTOs**:

```typescript
// Create User
class CreateUserInputDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;
}

// Update User
class UpdateUserInputDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

// Query User
class FindUserByIdInputDto {
  @IsUUID()
  publicId: string;
}
```

**Response DTOs**:

```typescript
// Active User Response
class ActiveUserResponseDto {
  @Expose() publicId: string;
  @Expose() email: string;
  @Expose() name: string;
  @Expose() status: UserStatus;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
  // Note: internal ID is never exposed
}

// Admin User Response (includes additional fields)
class FullUserResponseDto extends ActiveUserResponseDto {
  @Expose() deletedAt?: Date;
  // Admin can see soft-deleted users
}
```

**Business Rules**:

1. Email must be unique across all users
2. Name is required and limited to 50 characters
3. New users start in PENDING status
4. Only admins can change user status
5. Soft delete preserves user data for audit

### Planned Data Models

#### PracticeSession Model

Represents a single practice session with an instrument.

**Domain Concepts**:

- **Duration Tracking**: Start/end times or manual duration
- **Instrument Association**: Which instrument was practiced
- **Exercise Tracking**: What was practiced during the session
- **Progress Notes**: Reflections and observations

**Key Relationships**:

- Belongs to one User
- Uses one Instrument
- Includes many Exercises

**Business Rules**:

1. Sessions must have either end time or duration
2. Cannot overlap with other sessions for same user
3. Duration must be positive (minimum 1 minute)
4. Can be edited within 24 hours of creation

#### Instrument Model

Represents a musical instrument owned or used by users.

**Domain Concepts**:

- **Instrument Type**: Guitar, Piano, Violin, etc.
- **User Association**: Many-to-many via UserInstrument
- **Skill Level**: Per user-instrument combination
- **Practice History**: Sessions with this instrument

**Business Rules**:

1. Users can have multiple instruments
2. Same instrument type can be added multiple times (different guitars)
3. Skill level tracked per user-instrument pair
4. Cannot delete instrument with practice history

#### Exercise/Piece Model

Represents a musical exercise, scale, or piece to practice.

**Domain Concepts**:

- **Categories**: Scales, Arpeggios, Etudes, Pieces, etc.
- **Difficulty**: 1-10 scale
- **Target Tempo**: BPM for tempo-based exercises
- **Progress Tracking**: Current vs target performance

**Key Attributes**:

- Title (required)
- Composer (optional)
- Category (required)
- Difficulty (1-10)
- Target tempo (BPM)
- Notes/instructions

**Business Rules**:

1. Title and category are required
2. Difficulty must be 1-10
3. Target tempo must be positive
4. Can track multiple progress entries over time

#### Goal Model

Represents practice goals and objectives.

**Domain Concepts**:

- **Goal Types**:
  - Time-based (practice X minutes daily)
  - Skill-based (master piece at tempo)
  - Repertoire-based (learn X new pieces)
- **Progress Tracking**: Percentage or milestone-based
- **Deadlines**: Optional target dates

**Business Rules**:

1. Goals must have measurable criteria
2. Can be marked complete/incomplete
3. Progress updates create history
4. Expired goals auto-archive after 30 days

### Data Model Relationships

```typescript
// User relationships
User -> PracticeSession (one-to-many)
User -> UserInstrument (one-to-many)
User -> Goal (one-to-many)

// Instrument relationships
Instrument -> UserInstrument (one-to-many)
Instrument -> PracticeSession (one-to-many)

// Session relationships
PracticeSession -> PracticeSessionExercise (one-to-many)
PracticeSession -> User (many-to-one)
PracticeSession -> Instrument (many-to-one)

// Exercise relationships
Exercise -> PracticeSessionExercise (one-to-many)
Exercise -> ExerciseProgress (one-to-many)

// Goal relationships
Goal -> GoalProgress (one-to-many)
Goal -> User (many-to-one)
```

### Data Access Patterns

#### Repository Layer

Each model has a repository service with consistent methods:

```typescript
// Standard repository methods
findUnique[Model](where: WhereInput)
findMany[Model]s(where: WhereInput, options?: QueryOptions)
create[Model](data: CreateInput)
update[Model](where: WhereInput, data: UpdateInput)
delete[Model](where: WhereInput) // Soft delete
hardDelete[Model](where: WhereInput) // Permanent
restore[Model](where: WhereInput) // Undo soft delete

// With soft delete support
findUniqueActive[Model](where: WhereInput)
findUniqueDeleted[Model](where: WhereInput)
findUniqueAny[Model](where: WhereInput)
```

#### Service Layer

Services implement business logic:

```typescript
// Query Service (read operations)
class UserQueryService {
  findUserByIdOrFail(dto: FindUserByIdInputDto): Promise<User>;
  findManyUsers(dto: FindManyUsersInputDto): Promise<User[]>;
  checkUserExists(dto: CheckUserExistsInputDto): Promise<boolean>;
}

// Command Service (write operations)
class UserCommandService {
  createUser(dto: CreateUserInputDto): Promise<User>;
  updateUser(dto: UpdateUserInputDto): Promise<User>;
  deleteUser(dto: DeleteUserInputDto): Promise<void>;
}

// Facade Services (orchestration)
class UserAdminFacadeService {
  // Combines multiple services for admin operations
  bulkUpdateUserStatus(dto: BulkUpdateDto): Promise<User[]>;
}
```

### Data Validation Rules

#### Common Validations

```typescript
// String fields
@IsString()
@MinLength(1)
@MaxLength(255)

// Email fields
@IsEmail()
@Transform(({ value }) => value.toLowerCase())

// UUID fields
@IsUUID('4')

// Date fields
@IsDateString()
@IsOptional()

// Enum fields
@IsEnum(UserStatus)

// Numeric fields
@IsInt()
@Min(1)
@Max(10)
```

#### Custom Validations

```typescript
// Validate practice session duration
@ValidateIf(o => !o.endTime)
@IsInt()
@Min(1)
@Max(480) // Max 8 hours
duration?: number;

// Validate tempo
@IsInt()
@Min(20)  // Slowest meaningful tempo
@Max(300) // Fastest reasonable tempo
targetTempo: number;
```

### Data Transformation

#### Input Transformation

```typescript
// Normalize email
@Transform(({ value }) => value?.toLowerCase().trim())
email: string;

// Parse comma-separated IDs
@Transform(({ value }) =>
  typeof value === 'string' ? value.split(',') : value
)
publicIds: string[];
```

#### Output Transformation

```typescript
// Hide internal IDs
@Exclude()
id: number;

// Expose computed fields
@Expose()
get fullName() {
  return `${this.firstName} ${this.lastName}`;
}

// Transform dates
@Type(() => Date)
createdAt: Date;
```

### Performance Considerations

1. **Eager Loading**: Use Prisma `include` sparingly
2. **Pagination**: Always paginate list queries
3. **Indexes**: Add indexes for frequently queried fields
4. **Caching**: Consider Redis for user sessions
5. **Batch Operations**: Use `createMany` for bulk inserts

### Security Considerations

1. **Never expose internal IDs**: Always use publicId
2. **Validate all inputs**: Use class-validator decorators
3. **Sanitize strings**: Prevent XSS and SQL injection
4. **Rate limiting**: Protect against abuse
5. **Audit trails**: Track all data modifications

## Architecture Patterns

### Domain-Driven Design

The backend implements Domain-Driven Design with clear aggregate boundaries:

**Aggregate Pattern**:

- Each domain entity (e.g., User) is an aggregate with its own module
- Aggregates encapsulate business logic and enforce invariants
- All operations go through the aggregate root
- Future aggregates: PracticeSession, Instrument, Goal, Progress

**Bounded Contexts**:

- **Admin Context**: Full system access, manages all users and data
- **App Context**: User-specific operations, limited to own data
- **Shared Kernel**: Common types, utilities, and base configurations

### Service Layer Pattern

**4-Layer Architecture** per aggregate:

```typescript
// 1. Repository Layer (Data Access)
class UserRepositoryService {
  // Only place with Prisma access
  // Implements soft delete pattern
  findUniqueActiveUser();
  findUniqueDeletedUser();
  findUniqueAnyUser();
}

// 2. Query Service (Read Operations)
class UserQueryService {
  // All read operations
  // Implements OrFail pattern
  findUserByIdOrFail(); // Throws NotFoundException
  findManyUsers();
}

// 3. Command Service (Write Operations)
class UserCommandService {
  // Create, Update, Delete operations
  // Uses QueryService for validation
  createUser();
  updateUserById();
  deleteUserById(); // Soft delete
}

// 4. Facade Services (API Orchestration)
class UserAdminFacadeService {
  // Orchestrates services for admin operations
  // Can access deleted records
}
class UserAppFacadeService {
  // Orchestrates services for app operations
  // Only active records
}
```

### Repository Pattern

**Strict implementation with enforced rules**:

- Database access ONLY through `*.repository.service.ts` files
- Consistent method naming enforced by ESLint
- Three-tier data access (Active/Deleted/Any)
- No business logic in repositories

**Soft Delete Pattern**:

```typescript
// Every repository implements three variants
findUniqueActiveUser(); // WHERE deletedAt IS NULL
findUniqueDeletedUser(); // WHERE deletedAt IS NOT NULL
findUniqueAnyUser(); // No deletedAt filter
```

### DTO Pattern

**Separation of Concerns**:

```typescript
// Input DTOs - Request validation
class CreateUserInputDto {
  @IsEmail() email: string;
  @IsString() @MaxLength(50) name: string;
}

// Response DTOs - API responses
class ActiveUserResponseDto {
  @Exclude() id: number; // Internal ID hidden
  @Expose() publicId: string;
  @Expose() email: string;
  @Expose() name: string;
}

// Transformation functions
toActiveUserDto(user); // Converts entity to response
```

### Dependency Injection

**NestJS IoC Container**:

- Constructor-based injection
- Explicit provider configuration
- Careful service ordering to prevent circular dependencies
- Repository provided at module level

### Error Handling Patterns

**OrFail Pattern**:

```typescript
async findUserByIdOrFail(dto: FindUserByIdInputDto) {
  const user = await this.repository.findUniqueUser(dto);
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return user;
}
```

**Global Exception Handling**:

- NestJS built-in exceptions
- Consistent error responses
- Validation errors automatically formatted

### API Design Patterns

**RESTful Architecture**:

- Resource-based URLs
- Standard HTTP methods
- Consistent response formats
- Hypermedia as the Engine of Application State (planned)

**Dual API Pattern**:

- **Admin API** (port 3001): Extended permissions
- **App API** (port 3000): User-scoped operations
- Shared business logic, different facades
- Same database, different access levels

### Testing Patterns

**Test Pyramid**:

1. **Unit Tests** (Most):
   - Service isolation with mocks
   - Fast feedback loop
   - High coverage requirement (80%+)

2. **Integration Tests** (Some):
   - Service interaction testing
   - Real database with transactions
   - Test data isolation

3. **E2E Tests** (Few):
   - Critical user flows
   - Full API testing
   - Production-like environment

**Test Utilities**:

```typescript
// Mock factory pattern
const mockRepo = createMockUserRepositoryService();

// Integration test helper
const helper = new IntegrationTestHelper();
await helper.setup([UserModule]);
await helper.teardown();
```

### Frontend Patterns

**Component Architecture**:

- Atomic design principles
- Reusable UI components
- Theme-aware components
- Platform-specific implementations

**State Management**:

- React Context for global state (planned)
- Local component state for UI
- Server state with React Query (planned)

### Database Design Patterns

**UUID Primary Keys**:

- Database-generated UUIDs
- No sequential IDs exposed
- Prevents enumeration attacks

**Audit Fields Pattern**:

- Every table has: createdAt, updatedAt, deletedAt
- Automatic timestamp management
- Soft delete by default

**Index Strategy**:

- Index on deletedAt for filtering
- Index on createdAt for sorting
- Composite indexes for common queries

### Security Patterns

**Input Validation**:

- DTO-level validation with class-validator
- Whitelist strategy (only accept known fields)
- Type coercion disabled

**ID Obfuscation**:

- Internal numeric IDs never exposed
- Public UUID identifiers only
- Custom ESLint rule enforcement

### Code Organization Patterns

**Monorepo Benefits**:

- Shared configurations
- Atomic commits across apps
- Consistent tooling
- Easy refactoring

**Module Organization**:

- Feature-based modules
- Clear boundaries
- Explicit dependencies
- No circular references

**Path Aliases**:

- `@/*` for src imports
- `@/generated/*` for generated code
- Cleaner, more maintainable imports

## Critical Instructions

Before starting any task, **you must review**:

- `Important Reminders` section
- `Implementation Flow` section

### Important Reminders

- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary - prefer editing existing files
- NEVER proactively create documentation files (\*.md) or README files
- Minimize in-code comments. When adding, include type (e.g., NOTE:)
- Install shared packages at workspace root, not in individual apps

### Implementation Flow

1. **Explore**: Understand codebase, find reference implementations
2. **Plan**: Think deeply (ultrathink), get approval before proceeding
3. **Code**: Write TDD-style clean code as if you were Takuto Wada

## Essential Commands

### Initial Setup

```bash
make setup                    # Complete project setup
docker compose up -d          # Start PostgreSQL (port 15432)
```

### Development Commands

#### Backend (NestJS)

```bash
cd packages/apps/backend

# Start servers
npm run start:dev             # Both APIs
npm run start:dev:app-api     # App API only (port 3000)
npm run start:dev:admin-api   # Admin API only (port 3001)
npm run start:debug           # Debug mode

# Testing
npm run test                  # All unit tests
npm run test:watch            # Watch mode
npm run test:cov              # Coverage report
npm run test:e2e              # E2E tests
bunx jest path/to/test.spec.ts                    # Single test file
bunx jest --testNamePattern="should create"        # Pattern matching
bunx jest user.command.service.spec.ts             # Specific suite

# Database
bunx prisma migrate dev --name [name]              # Create migration
bunx prisma studio                                 # GUI for database
bunx prisma generate                               # Regenerate client
```

#### Admin Dashboard (Next.js)

```bash
cd packages/apps/admin
npm run dev                   # Development with Turbopack (port 8000)
npm run build                 # Production build
npm run start                 # Production server
```

#### Mobile App (React Native/Expo)

```bash
cd packages/apps/mobile
npm run dev                   # All platforms
npm run dev:ios               # iOS only
npm run dev:android           # Android only
npm run dev:web               # Web only
```

### Quality Checks (Run from root)

```bash
# Must pass all before committing
bun run cspell                # Spell check
bun run format:fix            # Format code
bun run lint:es:check         # ESLint check
bun run lint:markdown:check   # Markdown lint
bun run lint:secret:check     # Secret detection
bun run type:check            # TypeScript check
bun run test                  # All tests
bun run test:cov              # Coverage check

# Combined check
npm run ci:temp               # Run all checks
```

## Architecture Overview

### Service Layer Pattern (Backend)

Each aggregate has 4 service layers:

1. **Repository Service**: Database access only
2. **Query Service**: Read operations with OrFail pattern
3. **Command Service**: Write operations (CUD)
4. **Facade Services**: API orchestration (Admin/App)

```typescript
// Example structure for User aggregate
UserRepositoryService; // Database layer
UserQueryService; // Reads (throws NotFoundException)
UserCommandService; // Writes (uses QueryService for validation)
UserAdminFacadeService; // Admin API orchestration
UserAppFacadeService; // App API orchestration
```

### Repository Method Naming

Enforced by custom ESLint rules:

- `findUnique*/findMany*` - queries
- `create*/createMany*` - creation
- `update*/updateMany*` - updates
- `delete*/deleteMany*` - soft deletes
- `hardDelete*` - permanent deletion
- `restore*` - undo soft delete

Soft delete pattern:

- `findUniqueActiveUser` - WHERE deletedAt IS NULL
- `findUniqueDeletedUser` - WHERE deletedAt IS NOT NULL
- `findUniqueAnyUser` - all records

### Database Schema Requirements

Every model must have:

```prisma
id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
createdAt DateTime  @default(now())
updatedAt DateTime  @updatedAt
deletedAt DateTime?

@@index([createdAt])
@@index([deletedAt])
```

Enforced by `validate-prisma-schema.sh` script.

### Testing Patterns

#### Unit Tests

```typescript
const mockRepo = createMockUserRepositoryService();
const module = await createTestModule({
  providers: [UserQueryService, mockRepo],
});
```

#### Integration Tests

```typescript
const helper = new IntegrationTestHelper();
const { app, module } = await helper.setup([UserModule]);
// Test with real database (port 15433)
await helper.teardown();
```

### Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
type(scope): description

# Scopes: backend, mobile, admin, eslint-configs, eslint-plugins, tsconfig-base
# Types: feat, fix, docs, style, refactor, test, chore
```

### Key Architectural Decisions

1. **Dual API Design**: Admin API (3001) vs App API (3000)
2. **Soft Delete Pattern**: All entities support soft deletion
3. **UUID Primary Keys**: PostgreSQL's gen_random_uuid()
4. **Service Separation**: Query vs Command services
5. **Repository Pattern**: Prisma access only through repositories
6. **Domain-Driven Design**: Clear aggregate boundaries
7. **Path Aliases**: `@/*` maps to `src/*` in backend

### Custom ESLint Rules

Enforce architecture:

- `prisma-repository-only-access` - Prisma only in repositories
- `prisma-*-naming-convention` - Method naming patterns
- `prisma-create-no-deleted-at` - Can't set deletedAt on create
- `repository-model-access-restriction` - Repository boundaries

### Environment Setup

- Database: PostgreSQL 15 on port 15432 (not 5432)
- Test Database: Port 15433
- Root `.env` symlinked to backend
- Docker Compose for database management

## Development Tips

- Check Swagger docs at `/api` (dev only) for both APIs
- Use `IntegrationTestHelper` for database tests
- Run `make setup` after cloning
- Custom ESLint rules prevent common mistakes
- Prisma Studio (`bunx prisma studio`) for database inspection
- All packages use TypeScript 5.8.3 with strict mode
