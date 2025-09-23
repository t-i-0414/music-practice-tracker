# Repository Guidelines

## Project Structure & Module Organization

- Monorepo uses workspaces under `packages/`; primary apps: `packages/apps/backend` (NestJS + Prisma), `packages/apps/admin` (Next.js), `packages/apps/mobile` (Expo).
- Shared tooling lives in `packages/libs/*`; test suites reside under `tests/<app>` mirroring each app. Backend Prisma schema stays in `packages/apps/backend/prisma/`.

## Build, Test, and Development Commands

- Run `make setup` once to install dependencies, sync `.env`, and prepare tooling.
- Use `bun run quality:check` at the root for formatting, lint, type, and spell checks; fix with `bun run quality:fix`.
- Backend: from `packages/apps/backend`, start locally via `bun run start:dev`; build with `bun run build`; bring up the DB with `make docker-compose-up`.
- Admin: inside `packages/apps/admin`, run `bun run start:dev` for Next.js dev server; `bun run build` for production bundles.
- Mobile: from `packages/apps/mobile`, launch Expo with `bun run start:dev` or platform-specific variants.

## Coding Style & Naming Conventions

- TypeScript everywhere; follow `@music-practice-tracker/eslint-configs` and `packages/libs/tsconfig-base`.
- Prettier enforces 120-char width, single quotes; run `bun run format:check` or `format:fix`.
- Keep filenames kebab-case; React components PascalCase; favor descriptive module boundaries matching workspace folders.

## Testing Guidelines

- Backend uses Jest (`bun run test`, `test:unit`, `test:integration`, `test:e2e`, `test:cov`); ensure meaningful coverage on new modules.
- Admin relies on Vitest (`bun run test:unit`), Cypress (`test:integration`), and Playwright (`test:e2e`); mobile uses Jest (`test:unit`) and Maestro via `make test-e2e`.
- Place new tests alongside respective packages under `tests/`, mirroring feature folders.

## Commit & Pull Request Guidelines

- Commitlint enforces Conventional Commits; allowed scopes: `backend`, `admin`, `mobile`, `eslint-configs`, `eslint-plugins`, `tsconfig-base`. Example: `feat(backend): add practice session API`.
- PRs should describe intent, link issues, note risks/rollbacks, and include UI screenshots when touching frontend. Ensure CI passes and docs stay current.

## Security & Configuration Tips

- Environment variables derive from the root `.env`; copy `.env.example` or run `make setup`. Apps symlink automatically.
- Run `bun run lint:secret:check` and `bun run lint:dotenv:check` after env changes; Prisma models validate during commits.

## Agent Workflow Notes

- Build a concise plan before changes, keep edits scoped, and prefer `rg` for repository search.
- Use `apply_patch` for modifications, limit file reads to focused chunks, and run package-level checks relevant to touched code.
