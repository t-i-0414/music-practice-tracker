# Repository Guidelines

## Project Structure & Module Organization

This Bun monorepo hosts three primary apps under `packages/apps/`: `backend` (NestJS + Prisma), `admin` (Next.js), and `mobile` (Expo). Shared tooling and configs live in `packages/libs/`. Tests mirror runtime folders inside each app (`packages/apps/<app>/tests`). Prisma schema files stay in `packages/apps/backend/prisma/`, and generated Prisma clients output to `packages/apps/backend/generated/`.

## Build, Test, and Development Commands

Run `make setup` once to install dependencies, copy `.env.example` to `.env`, and build shared ESLint/TS configs. Bring up infrastructure with `make docker-compose-up` (PostgreSQL) and `make start-firebase-dev-emulators`. Start apps via:

- `cd packages/apps/backend && bun run start:dev`
- `cd packages/apps/admin && bun run start:dev`
- `cd packages/apps/mobile && bun run start:dev`
Repo-wide quality gate: `bun run quality:check`; autofix with `bun run quality:fix`. Regenerate frontend API clients after backend changes using `bun run gen:api-types` inside admin/mobile.

## Coding Style & Naming Conventions

TypeScript is required throughout, inheriting settings from `packages/libs/tsconfig-base`. ESLint rules come from `@music-practice-tracker/eslint-configs`. Prettier enforces 120-character lines and single quotes (`bun run format:check`). Keep filenames kebab-case, React components PascalCase, and service classes suffixed with `Service`. Prefer descriptive module boundaries matching workspace folders.

## Testing Guidelines

- Backend: Jest via `bun run test`, with extras `test:integration`, `test:e2e`, `test:cov`. Ensure PostgreSQL and Firebase emulators are running first.
- Admin: Vitest (`bun run test:unit`), Cypress (`test:integration`), Playwright (`test:e2e`). Aggregate all tiers with `bun run test`.
- Mobile: Jest (`bun run test`, `test:unit`) and Maestro (`test:e2e`). Simulators or devices may be required for E2E runs.
Place new specs under the appropriate `tests/` subtree and mirror the runtime feature structure.

## Commit & Pull Request Guidelines

Follow Conventional Commits with approved scopes (`backend`, `admin`, `mobile`, `eslint-configs`, `eslint-plugins`, `tsconfig-base`). PRs should explain intent, link issues, outline risks/rollbacks, and include UI screenshots when adjusting admin or mobile surfaces. Run `bun run quality:check` plus affected package-level tests before pushing; CI expects parity.

## Security & Configuration Tips

Environment variables derive from the root `.env`; keep it synced with `.env.example`. Validate changes with `bun run lint:dotenv:check` and scan for secrets using `bun run lint:secret:check`. Prisma models are verified by Lefthook pre-commit hooks—do not bypass them. Keep Firebase credentials out of version control and rely on the provided emulators during local development.
