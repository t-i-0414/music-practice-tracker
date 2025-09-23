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

# 3. Start Backend (port 3000/3001)
cd packages/apps/backend
bun run start:dev

# 4. Start Admin (port 8000)
cd packages/apps/admin
bun run start:dev

# 5. Start Mobile (port 8081)
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

# API Docs
http://localhost:3000/api           # App API
http://localhost:3001/api           # Admin API
```

## License

Proprietary software. See [LICENSE](./LICENSE). For inquiries: <takuya.iwashiro@takudev.net>
