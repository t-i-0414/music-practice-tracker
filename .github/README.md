# GitHub Actions Configuration

This directory contains GitHub Actions workflows and custom actions for the Music Practice Tracker project.

## Structure

```tree
.github/
├── actions/
│   └── setup-bun/         # Composite action for Bun setup with caching
│       └── action.yml
└── workflows/
    └── ci.yml             # Main CI workflow
```

## Composite Actions

### setup-bun

A reusable composite action that:

- Installs Bun runtime
- Caches dependencies for faster builds
- Supports monorepo structure with workspaces

**Usage:**

```yaml
- name: Setup Bun with cache
  uses: ./.github/actions/setup-bun
  with:
    bun-version: 'latest' # Optional, defaults to 'latest'
```

**Cache Strategy:**

- Primary key: `bun-${OS}-${hash(bun.lock)}`
- Fallback key: `bun-${OS}-` for partial cache hits
- Caches:
  - Root `node_modules/`
  - Workspace `packages/*/node_modules/`
  - Bun global cache `~/.bun/install/cache/`

## Workflows

### CI Workflow (ci.yml)

Main continuous integration workflow that runs on:

- Push to `main` and `develop` branches
- Pull requests targeting `main` and `develop`
- Manual dispatch

**Current Jobs:**

- `setup`: Validates Bun installation and caching

**Planned Jobs (Phase 2):**

- `format-check`: Prettier formatting validation
- `cspell`: Spell checking
- `markdown-check`: Markdown linting
- `secretlint-check`: Secret detection
- `lint-check`: ESLint validation
- `type-check`: TypeScript compilation
- `dotenv-linter`: Environment file validation
- `test`: Run all tests

## Migration Status

Currently migrating from `npm run ci:temp` script to GitHub Actions:

- [x] Phase 1: Basic setup with caching
- [ ] Phase 2: Individual job migration
- [ ] Phase 3: Optimization and parallelization

## Performance Optimizations

1. **Dependency Caching**: Significantly reduces install time on subsequent runs
2. **Concurrency Control**: Cancels outdated runs for the same PR/branch
3. **Lock File Based Caching**: Cache invalidates only when dependencies change

## Local Testing

To test the composite action locally:

```bash
# Install act (GitHub Actions local runner)
brew install act

# Run the workflow
act push -W .github/workflows/ci.yml
```
