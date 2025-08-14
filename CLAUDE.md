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

### Service Layer Pattern (Backend)

```typescript
// Each aggregate has 4 layers:
UserRepositoryService; // Database access only
UserQueryService; // Read operations (OrFail pattern)
UserCommandService; // Write operations (CUD)
UserFacadeService; // API orchestration
```

### Key Patterns

- **Dual APIs**: App (user-scoped) vs Admin (full access)
- **UUID Keys**: Never expose internal IDs (use publicId)
- **Repository Pattern**: Database access only through repositories
- **DTO Pattern**: Input validation and response transformation

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

### Backend Module Structure

```
modules/
├── aggregate/[entity]/
│   ├── *.repository.service.ts
│   ├── *.query.service.ts
│   ├── *.command.service.ts
│   ├── *.facade.service.ts
│   ├── *.input.dto.ts
│   └── *.response.dto.ts
├── api/
│   ├── admin/
│   └── app/
└── repository/
```

## 🏗️ Implementation Workflow

### Feature Implementation

1. Create domain aggregate
2. Implement repository service
3. Add query/command services
4. Create facade services
5. Add controllers with DTOs
6. Write tests (95% coverage minimum)

### Database Changes

```bash
bunx prisma migrate dev --name [name]
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

- `prisma-repository-only-access` - Enforces repository pattern
- `no-internal-id` - Prevents ID exposure

### Testing

- Minimum 95% coverage
- Unit tests with mocks
- Integration tests with real DB
- E2E for critical paths

---

_For detailed documentation, check `/packages/apps/_/README.md`\*
