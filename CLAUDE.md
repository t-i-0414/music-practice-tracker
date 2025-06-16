# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Music practice tracker application built as a monorepo with workspaces, consisting of three main applications:

- **Backend**: NestJS API server with PostgreSQL database
- **Admin**: Next.js admin dashboard
- **Mobile**: React Native app with Expo

## Development Setup

### Initial Setup

```bash
make setup
```

This executes:

- `bun install` to install dependencies
- Copies `.env.example` to `.env` (if not exists)
- Symlinks root `.env` to backend directory
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
# Type check all packages
npm run type:check

# Type sync and install
npm run type:sync

# Format check and fix
npm run format:check
npm run format:fix

# Spell check
npm run cspell
```

### Backend (packages/apps/backend)

```bash
# Development
npm run start:dev
npm run start:debug

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

# Linting
npm run lint:check
npm run lint:fix

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
npm run lint:check
npm run lint:fix

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
npm run lint:check
npm run lint:fix

# Type checking
npm run type:check

# Reset project
npm run reset-project
```

Note: Test setup not yet configured for Mobile package.

## Architecture

### Backend Structure

- **NestJS** framework with modular architecture
- **Prisma ORM** for database operations
- **PostgreSQL** database
- **API modules** located in `src/api/` (e.g., users module)
- **Repository pattern** implemented in `src/repository/`
- **Service layer** in `src/services/` handles business logic
- **Common utilities** in `src/common/` (decorators, etc.)
- **Path aliases**: `@/*` maps to `./src/*`, `@/generated/*` maps to `./generated/*`

### Module Organization

- **AppModule**: Root module importing ApiModule
- **ApiModule**: Groups all API-related modules
- **UserModule**: Handles user-related functionality
- **RepositoryModule**: Provides database access services

### Repository Pattern

- `RepositoryService` extends PrismaClient and manages database connection
- Individual repositories (e.g., `UserRepository`) encapsulate data access logic
- Services use repositories to separate business logic from data access

### Database Schema

- All models use UUID as primary key (PostgreSQL's gen_random_uuid() function)
- Required fields for each model: `id` (UUID), `createdAt`, `updatedAt`
- Prisma schema validation ensures consistency

### Prisma Schema Validation Rules

`scripts/validate-prisma-schema.sh` enforces:

1. **ID Fields**

   - Field name must be `id`
   - `String` type with `@id` attribute
   - `@db.Uuid` for UUID storage
   - `@default(uuid())` or `@default(dbgenerated("gen_random_uuid()"))`

2. **Timestamps**

   - `createdAt`: `DateTime` type with `@default(now())`
   - `updatedAt`: `DateTime` type with `@updatedAt`

3. **Constraints**
   - No composite primary keys (`@@id`)
   - All models must have the above fields

### Test Configuration (Backend)

- **Unit tests**: Jest configuration in `package.json`
  - Pattern: `*.spec.ts`
  - Root: `src` directory
  - Coverage from all `.ts` and `.js` files
- **E2E tests**: Configuration in `test/jest-e2e.json`
  - Pattern: `*.e2e-spec.ts`
  - Root: `test` directory

### Frontend Applications

- **Admin**: Next.js 15 with TypeScript
- **Mobile**: Expo 53 with React Native and Expo Router for navigation

### Shared Libraries

- Currently no shared libraries in `packages/libs/`
- Shared dependencies managed at root level

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

## Git Hook Configuration

Lefthook automation:

- Commit message validation (commitlint)
- Automatic package.json sorting
- Automatic Prisma schema validation (validate-prisma-schema)
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
