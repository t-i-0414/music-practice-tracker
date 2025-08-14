# Admin Dashboard

Next.js 15 admin dashboard for Music Practice Tracker.

## Quick Start

```bash
# Install dependencies
bun install

# Start development
bun run start:dev        # http://localhost:8000

# Build for production
bun run build
bun run start:prod
```

## Tech Stack

- **Framework**: Next.js 15.3 (App Router)
- **Styling**: CSS Modules
- **Testing**: Vitest, Cypress, Playwright
- **Development**: Turbopack

## Project Structure

```
src/
├── app/                # App Router pages
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # React components
└── lib/               # Utilities & API clients
```

## Commands

### Development

```bash
bun run start:dev       # Start dev server
bun run build           # Build for production
bun run start:prod      # Start production server
```

### Testing

```bash
bun run test:unit       # Vitest unit tests
bun run test:e2e        # Playwright E2E tests
bun run test:cypress    # Cypress integration tests
bun run storybook       # Component development
```

### Code Generation

```bash
bun run gen:api-types   # Generate TypeScript types from backend
```

## Key Patterns

- **Server Components**: Default for data fetching
- **Client Components**: Use `'use client'` when needed
- **CSS Modules**: Component-scoped styles
- **Error Boundaries**: Graceful error handling
- **Loading States**: Skeleton screens

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development
```

## Development Tools

- **Storybook**: Component isolation and documentation
- **MSW**: API mocking for development/testing
- **Turbopack**: Fast bundling in development
