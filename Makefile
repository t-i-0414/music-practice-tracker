.PHONY: setup install-deps setup-env setup-backend-env build-eslint-rules setup-database clean-eslint-rules

# Main setup target that orchestrates all setup tasks
setup: install-deps setup-env setup-backend-env build-eslint-rules setup-database
	@echo "✅ Setup complete!"

# Install dependencies
install-deps:
	@echo "📦 Installing dependencies..."
	bun install
	@echo "✅ Dependencies installed"

# Setup environment file
setup-env:
	@echo "🔧 Setting up environment..."
	@if [ ! -f .env ]; then \
		echo "Creating .env file from .env.example..."; \
		cp .env.example .env; \
		echo "✅ .env file created"; \
	else \
		echo "⚠️  .env file already exists, skipping creation"; \
	fi

# Setup backend environment symlink
setup-backend-env:
	@echo "🔗 Setting up backend environment symlink..."
	ln -sf ../../../.env packages/apps/backend/.env
	@echo "✅ Backend environment symlink created"

# Build custom ESLint rules
build-eslint-rules:
	@echo "🛠️  Building custom ESLint rules..."
	cd packages/libs/eslint-rules && bunx tsc
	@echo "✅ ESLint rules built"

# Setup database with migrations
setup-database:
	@echo "🗄️  Setting up database..."
	cd packages/apps/backend && bunx prisma migrate dev
	@echo "✅ Database setup complete"

# Clean ESLint rules build artifacts
clean-eslint-rules:
	@echo "🧹 Cleaning ESLint rules build artifacts..."
	rm -rf packages/libs/eslint-rules/dist
	@echo "✅ ESLint rules cleaned"

# Additional useful targets
.PHONY: docker-up docker-down docker-restart

# Start Docker services
docker-up:
	@echo "🐳 Starting Docker services..."
	docker compose up -d
	@echo "✅ Docker services started"

# Stop Docker services
docker-down:
	@echo "🐳 Stopping Docker services..."
	docker compose down
	@echo "✅ Docker services stopped"

# Restart Docker services
docker-restart: docker-down docker-up
	@echo "✅ Docker services restarted"

# Development helpers
.PHONY: dev-backend dev-admin dev-mobile

# Start backend development server
dev-backend:
	@echo "🚀 Starting backend development server..."
	cd packages/apps/backend && bun run start:dev

# Start admin development server
dev-admin:
	@echo "🚀 Starting admin development server..."
	cd packages/apps/admin && bun run dev

# Start mobile development server
dev-mobile:
	@echo "🚀 Starting mobile development server..."
	cd packages/apps/mobile && bun run dev

# Database helpers
.PHONY: db-reset db-seed prisma-studio

# Reset database
db-reset:
	@echo "🗑️  Resetting database..."
	cd packages/apps/backend && bunx prisma migrate reset --force
	@echo "✅ Database reset complete"

# Open Prisma Studio
prisma-studio:
	@echo "🎨 Opening Prisma Studio..."
	cd packages/apps/backend && bunx prisma studio

# Help target
.PHONY: help

help:
	@echo "📚 Available targets:"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make setup              - Complete project setup"
	@echo "  make install-deps       - Install dependencies"
	@echo "  make setup-env          - Setup environment files"
	@echo "  make setup-backend-env  - Setup backend environment symlink"
	@echo "  make build-eslint-rules - Build custom ESLint rules"
	@echo "  make setup-database     - Setup database with migrations"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up          - Start Docker services"
	@echo "  make docker-down        - Stop Docker services"
	@echo "  make docker-restart     - Restart Docker services"
	@echo ""
	@echo "Development:"
	@echo "  make dev-backend        - Start backend dev server"
	@echo "  make dev-admin          - Start admin dev server"
	@echo "  make dev-mobile         - Start mobile dev server"
	@echo ""
	@echo "Database:"
	@echo "  make db-reset           - Reset database"
	@echo "  make prisma-studio      - Open Prisma Studio"
	@echo ""
	@echo "Cleaning:"
	@echo "  make clean-eslint-rules - Clean ESLint rules build"
