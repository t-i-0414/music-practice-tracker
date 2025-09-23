# Backend API

NestJS backend providing dual REST APIs for Music Practice Tracker.

## Quick Start

```bash
# Initial Setup (run once)
make setup

# Start Services
make docker-compose-up              # PostgreSQL (if needed)
make start-firebase-dev-emulators   # Firebase Emulator

# Start Development
bun run start:dev          # Both APIs
bun run start:dev:app-api  # App API only (port 3000)
bun run start:dev:admin-api # Admin API only (port 3001)

# Database
bun run prisma:studio      # GUI at http://localhost:5555
```

## Architecture

### Dual API Design

- **App API** (3000): User-scoped operations with Firebase Auth
- **Admin API** (3001): Full system access

### DDD Service Layers

1. **Domain Layer**: Business logic (query/command services)
2. **API Layer**: HTTP endpoints and DTOs
3. **Repository Layer**: Centralized database access
4. **Firebase Auth**: Authentication and authorization

### File Structure

```
src/
├── domain/
│   └── aggregates/[entity]/
│       ├── [entity].query.service.ts
│       ├── [entity].command.service.ts
│       └── utils/
│           ├── dto.ts
│           └── constants.ts
├── apis/
│   ├── admin/[entity]/
│   ├── app/[entity]/
│   └── utils/filters/
│       └── global-exception.filter.ts
├── repository/
│   ├── repository.service.ts
│   └── seeds/
├── firebase-auth/
│   └── utils/
│       └── firebase.error.ts
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

# Test Data Seeds
bun run seed:all            # Seed Firebase + DB users
bun run seed:firebase-auth  # Firebase auth only
bun run seed:user          # Database users only
```

## Key Patterns

- **UUID Public IDs**: Never expose internal IDs
- **Repository Pattern**: Centralized DB access through single service
- **Error Handling**: Custom error classes with global exception filter
- **OrFail Pattern**: Throw NotFoundException for missing resources
- **Service Separation**: Query (read) vs Command (write)
- **Firebase Integration**: Authentication with proper error mapping

## Environment Variables

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:15432/music_practice_tracker"
PORT=3000                    # App API port
ADMIN_PORT=3001             # Admin API port
NODE_ENV=development
FIREBASE_PROJECT_ID=music-practice-tracker-dev
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099  # For local development
```

## Error Handling

All errors are handled by the global exception filter and return consistent responses:

```json
{
  "statusCode": 401,
  "errorCode": "FB0006" // Specific error codes for each error type
}
```

Error code prefixes:

- `AP`: API errors
- `DO`: Domain errors
- `FB`: Firebase errors
- `RE`: Repository errors
- `UN`: Unknown errors

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
