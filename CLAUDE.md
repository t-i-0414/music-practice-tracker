# CLAUDE.md

> Essential instructions for AI agents working with this codebase.

## 🎯 Core Principles

1. **Do exactly what's asked** - No extra features, files, or documentation unless explicitly requested
2. **Follow existing patterns** - Study neighboring code before writing
3. **Quality gates are mandatory** - Run Turborepo checks + root checks before ANY commit
4. **Use existing libraries** - Check package.json before assuming availability

## 🏗️ Architecture

### Apps

- **Backend** (NestJS): App API (port 3000), Admin API (port 3001)
- **Admin** (Next.js): Dashboard (port 8000)
- **Mobile** (React Native/Expo): App (port 8081)

### DDD Structure

```
domain/aggregates/[entity]/
├── [entity].query.service.ts    # Read operations (OrFail pattern)
├── [entity].command.service.ts  # Write operations (CUD)
└── utils/dto.ts                 # Domain DTOs

apis/[admin|app]/[entity]/
├── [entity].controller.ts       # HTTP endpoints
└── [entity].module.ts

repository/
└── repository.service.ts        # Single Prisma access point
```

### Key Patterns

- **Dual APIs**: App (user-scoped) vs Admin (full access)
- **UUID Only**: Use publicId, never expose internal IDs
- **Query/Command Separation**: Read and write operations are separated
- **Centralized Repository**: All DB access through repository.service.ts
- **Error Handling**: Custom errors (ApiError, DomainError, FirebaseError, RepositoryError)
- **Global Exception Filter**: apis/utils/filters/global-exception.filter.ts

### Database (Prisma)

Every model must have: `id`, `publicId`, `createdAt`, `updatedAt`

## ⚡ Commands

```bash
# Setup (once)
make setup

# Start Services
make docker-compose-up              # PostgreSQL
make start-firebase-dev-emulators   # Firebase

# Development
cd packages/apps/backend && bun run start:dev    # Both APIs
cd packages/apps/admin && bun run start:dev      # Admin UI
cd packages/apps/mobile && bun run start:dev     # Mobile
bun turbo start:dev                              # All apps (parallel)

# Quality (REQUIRED before commit)
bun turbo lint:es:check type:check  # Package checks (parallel)
bun run lint:es:check:root          # Root ESLint
bun run type:check:root             # Root TypeScript
bun turbo test                      # All tests

# Database
bunx prisma migrate dev --name [name]  # New migration
bun run prisma:studio                   # GUI
```

## 📁 Project Structure

```
packages/
├── apps/
│   ├── backend/     # NestJS APIs (both App and Admin)
│   ├── admin/       # Next.js dashboard
│   └── mobile/      # React Native app
└── libs/            # Shared libraries
```

## 📚 Agent Skills (`.agents/skills/`)

Best practice guides are available as agent skills. Reference the relevant skill BEFORE writing or reviewing code.

| Context | Skills to reference |
|---------|-------------------|
| **Monorepo / Turborepo** | `turborepo` |
| **Backend** (NestJS) | `nestjs-best-practices` |
| **Admin** (Next.js) | `next-best-practices`, `next-cache-components`, `next-upgrade` |
| **Mobile** (React Native/Expo) | `vercel-react-native-skills` |
| **React shared** (Admin + Mobile) | `vercel-react-best-practices`, `vercel-composition-patterns` |
| **UI review / accessibility** | `web-design-guidelines` |
| **Frontend design** | `frontend-design` |

Each skill directory contains a `SKILL.md` (overview) and detailed rule files under `rules/` or `references/`.

## 🏗️ Implementation Workflow

1. **Domain**: Create aggregate with query/command services and DTOs
2. **API**: Add controllers for admin/app endpoints
3. **Repository**: Use repository.service.ts for all DB access
4. **Error**: Use OrFail pattern and custom error types
5. **Test**: 95% coverage minimum

### Seeds

```bash
bun run seed:all          # Firebase + DB users
bun run seed:user         # DB users only
```

## ⚠️ Rules

**DON'T**: Use npm • Expose internal IDs • Skip quality checks • Add unnecessary comments
**DO**: Use bun • Use publicId only • Run Turborepo checks • Separate Query/Command • Use OrFail pattern

## 📋 Pre-Commit

```bash
# Package checks (Turborepo)
bun turbo lint:es:check type:check

# Root checks (required by CI)
bun run lint:es:check:root && bun run type:check:root
```

Check for: No console.log • No any types • No hardcoded values • No exposed IDs

## 🔗 Environment

- **Database**: Dev (15432 + offset), Test (15433 + offset)
- **Git Worktree**: Supported - each worktree gets unique ports (see README.md)
- **Custom ESLint**: repository-model-access-restriction, aggregate-import-restriction, no-internal-id
- **Testing**: 95% coverage minimum

---

⚠️ **REMINDER**: Do exactly what's asked. Don't create files/docs unless explicitly requested.
