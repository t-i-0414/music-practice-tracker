# Music Practice Tracker

Track and improve your daily music practice. Mobile app + Admin dashboard.

## Tech Stack

**Backend**: NestJS + PostgreSQL + Prisma
**Admin**: Next.js
**Mobile**: React Native / Expo
**Runtime**: Bun

## Quick Start

```bash
# Prerequisites: Bun 1.x, Docker, Homebrew

# 1. Initial Setup (run once)
make setup

# 2. Start Services
make docker-compose-up              # PostgreSQL
make start-firebase-dev-emulators   # Firebase Emulator (separate terminal)

# 3. Start Backend (App API / Admin API)
cd packages/apps/backend
bun run start:dev

# 4. Start Admin
cd packages/apps/admin
bun run start:dev

# 5. Start Mobile
cd packages/apps/mobile
bun run start:dev
```

## Project Structure

```
packages/
├── apps/
│   ├── backend/   # API + Swagger docs
│   ├── admin/     # Admin dashboard
│   └── mobile/    # Mobile app
└── libs/          # Shared configs
```

## Git Worktree Support

Work on multiple branches simultaneously with isolated environments.

### How It Works

- `PORT_OFFSET` assigns unique ports to each worktree (increments of 10)
- `.env` is auto-generated with worktree-specific ports
- `~/.music-practice-tracker-ports` manages port allocations globally

### Creating a New Worktree

```bash
# Create worktree
git worktree add ../music-practice-tracker-feature-xxx feature/xxx
cd ../music-practice-tracker-feature-xxx

# Setup (auto-assigns available ports)
make setup

# Start services
make docker-compose-up
make start-firebase-dev-emulators
```

### Port Allocation

| Service           | Base  | offset 0 | offset 10 | offset 20 |
| ----------------- | ----- | -------- | --------- | --------- |
| PostgreSQL (Dev)  | 15432 | 15432    | 15442     | 15452     |
| PostgreSQL (Test) | 15433 | 15433    | 15443     | 15453     |
| App API           | 3000  | 3000     | 3010      | 3020      |
| Admin API         | 3001  | 3001     | 3011      | 3021      |
| Admin UI          | 8000  | 8000     | 8010      | 8020      |
| Firebase Auth     | 9099  | 9099     | 9109      | 9119      |

### Management Commands

| Command              | Description                                        |
| -------------------- | -------------------------------------------------- |
| `make wt-status`     | Show current worktree config and container status  |
| `make wt-ports`      | List all ports in use                              |
| `make wt-list`       | List all worktrees with Docker status              |
| `make wt-clean`      | Remove containers and volumes for current worktree |
| `make ports-list`    | Show registered port offsets                       |
| `make ports-cleanup` | Remove entries for non-existent directories        |

### Cleanup

```bash
make wt-clean                                           # Remove Docker resources
git worktree remove ../music-practice-tracker-feature-xxx  # Remove worktree
make ports-cleanup                                      # Clean port registry
```

## Development

```bash
# Quality checks (Turborepo - parallel execution)
bun turbo lint:es:check type:check  # ESLint + TypeScript
bun turbo test                      # All tests

# Individual checks
bun run lint:es:check:root          # Root ESLint only
bun run type:check:root             # Root TypeScript only

# Testing
bun turbo test                      # All package tests (parallel)
cd packages/apps/admin && bun run test:e2e   # Admin E2E (Playwright)
cd packages/apps/mobile && bun run test:e2e  # Mobile E2E (Maestro)

# Database
bun run prisma:studio               # GUI at localhost:5555
bun run prisma:migrate:dev

# API Docs (check .env for actual ports)
# http://localhost:${APP_API_PORT}/api   - App API
# http://localhost:${ADMIN_API_PORT}/api - Admin API
```

## Turborepo

This monorepo uses [Turborepo](https://turbo.build/) for build optimization with intelligent caching.

```bash
# Common commands
bun turbo build                     # Build all packages
bun turbo lint:es:check type:check  # Parallel lint + type check
bun turbo test                      # Run all tests
bun turbo start:dev                 # Start all apps

# Filter by package (use package name or path)
bun turbo build --filter=@music-practice-tracker/backend
bun turbo test --filter=./packages/apps/admin
```

### Remote Cache

CI uses Vercel Remote Cache for faster builds. Configure locally (optional):

```bash
bunx turbo login
bunx turbo link
```

## AI Tool Configuration (RuleSync)

AI coding tool settings (rules, commands, agents, skills) are managed by [RuleSync](https://github.com/dyoshikawa/rulesync). The single source of truth is `.rulesync/` and tool-specific files are auto-generated.

```bash
# Regenerate all AI tool configs (Claude Code, Cursor, Copilot)
bun run rulesync

# Preview changes without writing
bun run rulesync:dry-run

# CI check (exits 1 if out of date)
bun run rulesync:check
```

`make setup` automatically installs RuleSync (via Homebrew) and runs generation.

### Managed Targets

| Tool | Generated Files |
| ------------ | ----------------------------------------- |
| Claude Code | `CLAUDE.md`, `.claude/` |
| Cursor | `.cursor/rules/`, `.cursor/commands/`, etc |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/prompts/` |

### Editing Rules

Edit files in `.rulesync/` (not the generated files), then run `bun run rulesync`.

| What | Location |
| -------- | ------------------------------ |
| Rules | `.rulesync/rules/CLAUDE.md` |
| Commands | `.rulesync/commands/` |
| Agents | `.rulesync/subagents/` |
| Skills | `.rulesync/skills/` |
| MCP | `.rulesync/mcp.json` |
| Ignore | `.rulesync/.aiignore` |

## License

Proprietary software. See [LICENSE](./LICENSE). For inquiries: <takuya.iwashiro@takudev.net>
