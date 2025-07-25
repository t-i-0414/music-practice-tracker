# -------------------------------------------------------------
# Variables
# -------------------------------------------------------------
# Default value for NEED_DB
NEED_DB ?= false

# Skip migrations for type checking
SKIP_MIGRATIONS ?= false

# -------------------------------------------------------------
# Main setup target
# -------------------------------------------------------------
.PHONY: setup
setup:
	@echo "🔧 Setting up the backend environment..."
	@${MAKE} setup-env
	@${MAKE} setup-docker
	@${MAKE} setup-database
	@echo "✅ Backend environment setup complete!"

# -------------------------------------------------------------
# Environment setup
# -------------------------------------------------------------
.PHONY: setup-env
setup-env:
	@echo "🔗 Setting up environment symlink..."
	ln -sf ../../../.env .env
	@echo "✅ Environment symlink created"

# -------------------------------------------------------------
# Docker setup
# -------------------------------------------------------------
.PHONY: setup-docker
setup-docker:
ifneq ($(NEED_DB),true)
	@echo "🐳 Setting up Docker containers..."
	@${MAKE} docker-compose-up
endif

# -------------------------------------------------------------
# Database setup
# -------------------------------------------------------------
.PHONY: setup-database
setup-database:
	@echo "🗄️ Setting up database..."
	bun run prisma:generate
ifneq ($(SKIP_MIGRATIONS),true)
	@${MAKE} run-migrations
endif
	bun run prisma:validate
	@echo "✅ Database setup complete"

.PHONY: run-migrations
run-migrations:
	@echo "📊 Running database migrations..."
	bun run prisma:migrate:dev
	bun run prisma:migrate:test
	@echo "✅ Migrations complete"

# -------------------------------------------------------------
# Docker management
# -------------------------------------------------------------
.PHONY: docker-compose-up
docker-compose-up:
	@${MAKE} cd-to-root
	@echo "🐳 Starting Docker services..."
	docker compose up -d
	@echo "✅ Docker services started"

.PHONY: docker-compose-down
docker-compose-down:
	@${MAKE} cd-to-root
	@echo "🐳 Stopping Docker services..."
	docker compose down
	@echo "✅ Docker services stopped"

.PHONY: docker-restart
docker-restart: docker-compose-down docker-compose-up
	@echo "✅ Docker services restarted"

# -------------------------------------------------------------
# Utility targets
# -------------------------------------------------------------
.PHONY: cd-to-root
cd-to-root:
	@echo "🔄 Changing directory to root..."
	cd ../../../ && pwd
	@echo "✅ Changed directory to root"
