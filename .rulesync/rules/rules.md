---
root: true
targets:
  - '*'
globs:
  - '**/*'
---

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

## 📚 RuleSync Resources

This project uses RuleSync to manage agent skills, commands, and subagents. **Always reference the relevant resource BEFORE starting work.**

### Skills (Best Practice Guides)

Read `SKILL.md` in each skill directory for an overview, then consult `rules/` or `references/` for details.

| Use case | Skills |
| --- | --- |
| `turbo.json` editing, cache debugging, CI pipeline | `turborepo` |
| Backend API / DDD / module implementation | `nestjs-best-practices` |
| Admin page / Server Components / data fetching | `next-best-practices`, `next-cache-components` |
| Next.js version upgrade | `next-upgrade` |
| Mobile screen / component implementation | `vercel-react-native-skills` |
| React component shared by Admin + Mobile | `vercel-react-best-practices`, `vercel-composition-patterns` |
| UI accessibility / design review | `web-design-guidelines` |
| New frontend page or component from scratch | `frontend-design` |
| Code review / PR review | `pr-review-toolkit-plugin` |
| Creating or managing git hooks | `hookify` |
| Auditing / improving agent instruction files | `agent-instructions-improver`, `claude-md-management` |
| Summarizing project context for a new agent | `project-context` |

### Commands (Slash Commands)

| Command | When to use |
| --- | --- |
| `/review-pr [aspects]` | Comprehensive PR review using specialized sub-agents (comments, tests, types, errors, code quality, simplification) |
| `/revise-rules` | Capture session learnings into `.rulesync/rules/` (the single source of truth for agent instructions) |
| `/pre-commit` | Quick quality gate before committing (code-reviewer + silent-failure-hunter) |
| `/polish` | Post-implementation refinement (code-simplifier + comment-analyzer) |
| `/plan [feature]` | Domain-aware feature planning (planner + auto-selected skill) |
| `/audit-types` | Audit all type changes in the current branch for design quality |
| `/accessibility-review` | Review UI changes for accessibility compliance (web-design-guidelines) |

### Subagents

| Subagent | When to use |
| --- | --- |
| `planner` | Planning a new feature, refactoring, or spec. User explicitly invokes to get a structured implementation plan before coding. |
| `code-reviewer` | Review code for project guideline compliance, bug detection, and code quality. Use for single-file to PR-level review before commits. |
| `code-simplifier` | Simplify and refine code for clarity and maintainability while preserving functionality. Use after implementation. |
| `comment-analyzer` | Analyze code comments for accuracy, completeness, and technical debt. Use before finalizing PRs with documentation. |
| `pr-test-analyzer` | Review test coverage quality, identify critical gaps and edge cases. Use when adding new functionality. |
| `silent-failure-hunter` | Find silent failures, inadequate error handling, and hidden catch blocks. Use when reviewing error handling code. |
| `type-design-analyzer` | Analyze type design for encapsulation, invariants, and enforcement quality. Use when introducing or refactoring types. |

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

- **Default Branch**: `develop` (PRs should target `develop`, not `main`)
- **Branch Strategy**: `develop` → `staging` → `main`
- **Database**: Dev (15432 + offset), Test (15433 + offset)
- **Git Worktree**: Supported - each worktree gets unique ports (see README.md)
- **Custom ESLint**: repository-model-access-restriction, aggregate-import-restriction, no-internal-id
- **Testing**: 95% coverage minimum
- **CI Gotcha**: `expo-env.d.ts` / `next-env.d.ts` are gitignored but required for type-aware ESLint rules. CI generates them before lint step.

---

⚠️ **REMINDER**: Do exactly what's asked. Don't create files/docs unless explicitly requested.
