# Backend API

NestJS backend providing dual REST APIs for Music Practice Tracker.

## Quick Start

```bash
# Install dependencies
bun install

# Start development
bun run start:dev          # Both APIs
bun run start:dev:app-api  # App API only (port 3000)
bun run start:dev:admin-api # Admin API only (port 3001)

# Database
bun run prisma:studio      # GUI at http://localhost:5555
```

## Architecture

### Dual API Design

- **App API** (3000): User-scoped operations
- **Admin API** (3001): Full system access

### Service Layers (per aggregate)

1. **Repository**: Database access only
2. **Query Service**: Read operations (OrFail pattern)
3. **Command Service**: Write operations
4. **Facade Services**: API-specific orchestration

### File Structure

```
src/
├── modules/
│   ├── aggregate/[entity]/
│   │   ├── *.repository.service.ts
│   │   ├── *.query.service.ts
│   │   ├── *.command.service.ts
│   │   ├── *.facade.service.ts
│   │   ├── *.input.dto.ts
│   │   └── *.response.dto.ts
│   ├── api/
│   │   ├── admin/
│   │   └── app/
│   └── repository/
├── admin-api.main.ts
└── app-api.main.ts
```

## Commands

### Development

```bash
bun run start:dev          # Start both APIs
bun run start:debug        # Debug mode
bun run build              # Build for production
```

### Testing

```bash
bun run test               # Unit tests
bun run test:watch         # Watch mode
bun run test:cov           # Coverage report
bun run test:e2e           # E2E tests
```

### Database

```bash
bun run prisma:migrate:dev  # Create migration
bun run prisma:generate     # Generate client
bun run prisma:studio       # Database GUI
```

## Key Patterns

- **UUID Public IDs**: Never expose internal IDs
- **Repository Pattern**: All DB access through repositories
- **DTO Validation**: Input/output transformation
- **OrFail Pattern**: Throw NotFoundException for missing resources
- **Service Separation**: Query (read) vs Command (write)

## Environment Variables

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:15432/music_practice_tracker"
PORT=3000           # App API port
ADMIN_PORT=3001     # Admin API port
NODE_ENV=development
```

## API Documentation

- App API: <http://localhost:3000/api>
- Admin API: <http://localhost:3001/api>

(Swagger available in development only)

### API Type Generation

⚠️ **Important**: When API endpoints are modified, client types must be regenerated:

1. Start the backend API server:

   ```bash
   bun run start:dev
   ```

2. In the affected client project(s), regenerate the API types:

   ```bash
   # For Admin Dashboard
   cd packages/apps/admin
   bun run gen:api-types

   # For Mobile App
   cd packages/apps/mobile
   bun run gen:api-types
   ```

This ensures TypeScript types stay in sync with the backend API schema.
