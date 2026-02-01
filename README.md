# Music Practice Tracker

Track and improve your daily music practice. Mobile app + Admin dashboard.

## Tech Stack

**Backend**: NestJS + PostgreSQL + Prisma
**Admin**: Next.js
**Mobile**: React Native / Expo
**Runtime**: Bun

## Quick Start

```bash
# Prerequisites: Bun 1.x, Docker

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

| Service | Base | offset 0 | offset 10 | offset 20 |
|---------|------|----------|-----------|-----------|
| PostgreSQL (Dev) | 15432 | 15432 | 15442 | 15452 |
| App API | 3000 | 3000 | 3010 | 3020 |
| Admin API | 3001 | 3001 | 3011 | 3021 |
| Admin UI | 8000 | 8000 | 8010 | 8020 |
| Firebase Auth | 9099 | 9099 | 9109 | 9119 |

### Management Commands

| Command | Description |
|---------|-------------|
| `make wt-status` | Show current worktree config and container status |
| `make wt-ports` | List all ports in use |
| `make wt-list` | List all worktrees with Docker status |
| `make wt-clean` | Remove containers and volumes for current worktree |
| `make ports-list` | Show registered port offsets |
| `make ports-cleanup` | Remove entries for non-existent directories |

### Cleanup

```bash
make wt-clean                                           # Remove Docker resources
git worktree remove ../music-practice-tracker-feature-xxx  # Remove worktree
make ports-cleanup                                      # Clean port registry
```

## Development

```bash
# Quality checks (required before commit)
bun run ci:temp

# Testing
bun run test                        # Backend unit/integration tests
cd packages/apps/admin && bun run test:e2e   # Admin E2E (Playwright)
cd packages/apps/mobile && bun run test:e2e  # Mobile E2E (Maestro)

# Database
bun run prisma:studio               # GUI at localhost:5555
bun run prisma:migrate:dev

# API Docs (check .env for actual ports)
# http://localhost:${APP_API_PORT}/api   - App API
# http://localhost:${ADMIN_API_PORT}/api - Admin API
```

## License

Proprietary software. See [LICENSE](./LICENSE). For inquiries: <takuya.iwashiro@takudev.net>
