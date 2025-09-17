# Music Practice Tracker

The fastest way to capture, review, and improve your daily music practice. Mobile app + Admin dashboard, backed by a scalable NestJS API.

## What’s Inside

- Backend: NestJS + PostgreSQL + Prisma (Bun runtime)
- Admin: Next.js dashboard
- Mobile: React Native / Expo
- Monorepo: Bun workspaces, shared ESLint configs and rules

```
/
├── packages/
│   ├── apps/
│   │   ├── backend/   # App API (3000) / Admin API (3001) + Swagger
│   │   ├── admin/     # Next.js dashboard (8000)
│   │   └── mobile/    # Expo app (8081)
│   └── libs/          # Shared lint configs, plugins, tsconfig
└── docker-compose.yml # PostgreSQL (15432)
```

## Quick Start (Local)

Prerequisites

- Bun 1.x
- Docker + Docker Compose

Setup

1. Copy env and start DB
   - `cp .env.example .env`
   - `docker compose up -d postgres`
2. Install deps at repo root
   - `bun install`
3. Backend (migrate + start)
   - `cd packages/apps/backend`
   - `bun run prisma:migrate:dev`
   - `bun run start:dev`
   - Swagger: <http://localhost:3000/api> (App), <http://localhost:3001/api> (Admin)
4. Admin (in new terminal)
   - `cd packages/apps/admin && bun run start:dev`
5. Mobile (in new terminal)
   - `cd packages/apps/mobile && bun run start:dev`

## Scripts You’ll Use Most

- Format/linters/types: `bun run quality:check`
- Backend
  - Migrate: `bun run prisma:migrate:dev`
  - Start dev: `bun run start:dev`
  - Open Swagger: `bun run open:swagger-ui`
- Admin: `bun run start:dev`
- Mobile: `bun run start:dev`

## License

Proprietary software. See [LICENSE](./LICENSE). For inquiries: <takuya.iwashiro@takudev.net>

---

Last updated: September 3, 2025
