# Developer Quick Reference

## 🚀 Essential Commands

### Before Starting Work

```bash
git pull origin develop
bun install
docker compose up -d
```

### During Development

#### Backend

```bash
cd packages/apps/backend
bun run start:dev           # Start both APIs
bun run test:watch          # Run tests in watch mode
bunx prisma studio          # Database GUI
```

#### Frontend (Admin)

```bash
cd packages/apps/admin
bun run dev                 # Start dev server (port 8000)
bun run test:unit          # Run unit tests
```

#### Mobile

```bash
cd packages/apps/mobile
bun run dev                # Start Expo
bun run dev:ios           # iOS simulator
bun run dev:android       # Android emulator
```

### Before Committing

**MUST RUN ALL** ✅

```bash
bun run format:fix        # 1. Format code
bun run cspell           # 2. Check spelling
bun run lint:es:check    # 3. Lint
bun run type:check       # 4. Type check
bun run test             # 5. Run tests

# Or all at once:
bun run ci:temp
```

## 📁 Project Structure

```
packages/
├── apps/
│   ├── backend/         # NestJS APIs (ports 3000, 3001)
│   ├── admin/           # Next.js dashboard (port 8000)
│   └── mobile/          # React Native app
└── libs/
    ├── eslint-configs/  # Shared ESLint
    └── eslint-plugins/  # Custom rules
```

## 🏗️ Architecture Patterns

### Backend Service Layers

```
Controller → Facade → Command/Query → Repository → Database
```

### Service Files per Aggregate

- `*.repository.service.ts` - Database access
- `*.query.service.ts` - Read operations
- `*.command.service.ts` - Write operations
- `*.facade.service.ts` - API orchestration

## 📝 Documentation

### Where to Document

| What           | Where                                   |
| -------------- | --------------------------------------- |
| Feature specs  | `packages/apps/<app>/docs/<feature>.md` |
| Component docs | Next to component as `README.md`        |
| API specs      | `/docs/api-specs/*.yaml`                |
| Architecture   | `/docs/architecture.md`                 |

### Required Documentation

- ✅ New features need specs
- ✅ Components need README
- ✅ APIs need OpenAPI specs
- ✅ Breaking changes need migration guides

## 🧪 Testing

### Coverage Requirements

- Unit: 80% minimum
- New code: 100%
- Critical paths: E2E tests

### Test Commands

```bash
bun run test              # All tests
bun run test:unit        # Unit only
bun run test:e2e         # E2E only
bun run test:cov         # Coverage report
```

## 🔍 Common Tasks

### Add New Feature

1. Create spec: `docs/specifications/<feature>.md`
2. Create API spec: `docs/api-specs/<feature>.yaml`
3. Implement backend aggregate
4. Build UI components
5. Write tests
6. Update documentation

### Create Component

```bash
# Use VS Code snippet: comp-spec
# Structure:
ComponentName/
├── ComponentName.tsx
├── ComponentName.spec.md    # Specification
├── ComponentName.test.tsx    # Tests
├── ComponentName.stories.tsx # Storybook
└── index.ts
```

### Database Changes

```bash
cd packages/apps/backend

# Create migration
bunx prisma migrate dev --name description

# Apply to test DB
DATABASE_URL="postgresql://postgres:postgres@localhost:15433/music_practice_tracker_test" bunx prisma migrate deploy

# Open database GUI
bunx prisma studio
```

## 🐛 Debugging

### Backend

```bash
bun run start:debug      # Debug mode
bun run test:debug      # Debug tests
```

### Frontend

```bash
# Next.js Admin
bun run dev -- --inspect

# React Native
bun run dev -- --dev-client
```

### Database

```bash
# Connect to dev DB
psql postgresql://postgres:postgres@localhost:15432/music_practice_tracker

# Connect to test DB
psql postgresql://postgres:postgres@localhost:15433/music_practice_tracker_test
```

## 🎯 Git Workflow

### Branch Names

```bash
feature/add-something
fix/bug-description
refactor/component-name
docs/update-something
```

### Commit Format

```bash
type(scope): description

# Examples:
feat(backend): add practice session endpoints
fix(mobile): correct timer display
docs(admin): update component specs
```

## ⚠️ Important Rules

### Never Commit

- 🚫 `.env` files with real values
- 🚫 Secrets, keys, tokens
- 🚫 `console.log` statements
- 🚫 Commented out code
- 🚫 Code that fails quality checks

### Always Do

- ✅ Run quality checks before committing
- ✅ Write tests for new code
- ✅ Update documentation
- ✅ Follow naming conventions
- ✅ Use TypeScript strict mode

## 🔧 Troubleshooting

| Problem                   | Solution                             |
| ------------------------- | ------------------------------------ |
| Port already in use       | `lsof -i :PORT` then `kill -9 PID`   |
| Database connection error | Check Docker: `docker compose up -d` |
| Type errors               | Don't use `any`, fix the types       |
| Lint errors               | Run `bun run lint:es:fix`            |
| Test failures             | Check test DB on port 15433          |
| Prisma issues             | Run `bunx prisma generate`           |

## 📚 Resources

- [CLAUDE.md](../CLAUDE.md) - AI assistant guide
- [Code Quality](code-quality.md) - Detailed standards
- [Architecture](architecture.md) - System design
- [Swagger Docs](http://localhost:3000/api) - API documentation (dev only)

## 🎮 VS Code Snippets

Available snippets (type prefix + Tab):

- `feat-spec` - Feature specification
- `comp-spec` - Component specification
- `api-spec` - API endpoint
- `prisma-model` - Prisma model
- `nest-service` - NestJS service
- `rn-component` - React Native component
- `next-component` - Next.js component

## 💡 Pro Tips

1. **Use Prisma Studio** for database inspection
2. **Check Swagger** at `/api` for API testing
3. **Run tests in watch mode** during development
4. **Use VS Code snippets** for faster coding
5. **Keep PRs small** and focused
6. **Document as you code**, not after
7. **Test locally** before pushing

## 🆘 Getting Help

- Check `CLAUDE.md` for project conventions
- Review existing code for patterns
- Ask in team chat for clarifications
- Create an issue for bugs/improvements
