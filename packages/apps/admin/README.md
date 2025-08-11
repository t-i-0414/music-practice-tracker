# Admin Dashboard

## Overview

The Admin Dashboard is a Next.js 15 web application for system administrators to manage the Music Practice Tracker platform. It provides comprehensive administrative capabilities including user management, analytics, and system monitoring.

## Technology Stack

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript 5.8.3
- **Styling**: CSS Modules
- **Testing**:
  - Playwright (E2E)
  - Cypress (Integration)
  - Vitest (Unit)
  - Storybook (Component Development)
- **API Mocking**: MSW 2.10.4
- **Build**: Turbopack

## Setup

### Prerequisites

- Node.js 22.x
- Bun (for package management)
- Docker (for PostgreSQL database)

### Installation

```bash
# From the repository root
make setup

# Start the database
docker compose up -d

# Navigate to admin app
cd packages/apps/admin

# Install dependencies (handled by root setup)
bun install
```

### Development

```bash
# Start development server with Turbopack
bun run dev

# Server runs on http://localhost:8000
```

### Production Build

```bash
# Build for production
bun run build

# Start production server
bun run start
```

## Environment Variables

Create a `.env.local` file in the admin directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Music Practice Tracker Admin

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_MSW=true
```

## Scripts

| Command                    | Description                                |
| -------------------------- | ------------------------------------------ |
| `bun run dev`              | Start development server with Turbopack    |
| `bun run build`            | Build for production                       |
| `bun run start`            | Start production server                    |
| `bun run test:unit`        | Run Vitest unit tests                      |
| `bun run test:e2e`         | Run Playwright E2E tests                   |
| `bun run test:integration` | Run Cypress integration tests              |
| `bun run storybook`        | Start Storybook development                |
| `bun run gen:api-types`    | Generate TypeScript types from backend API |

## Project Structure

```
admin/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   └── components/       # Reusable components
├── public/               # Static assets
├── tests/                # Test suites
│   ├── unit/            # Vitest tests
│   ├── integration/     # Cypress tests
│   ├── e2e/            # Playwright tests
│   └── storybook/      # Component stories
└── generated/           # Generated types
    └── types/
        └── api.d.ts     # Backend API types
```

## API Integration

The admin dashboard connects to the Admin API running on port 3001. It has extended permissions compared to the regular App API, including:

- Access to soft-deleted records
- Bulk operations
- System-wide statistics
- User management across all accounts

## Links

### External Resources

- **Design System**: TODO - Add Figma link
- **API Documentation**: <http://localhost:3001/api> (Admin API Swagger)
- **Project Management**: TODO - Add Notion link

### Monitoring

- **Application Monitoring**: (TODO: Add monitoring solution)
- **Error Tracking**: (TODO: Add error tracking solution)
- **Analytics**: (TODO: Add analytics solution)
