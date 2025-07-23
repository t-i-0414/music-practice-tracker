# -------------------------------------------------------------
# Setting up
# -------------------------------------------------------------
# Default value for IS_CI
IS_CI ?= false
# Skip migrations for type checking
SKIP_MIGRATIONS ?= false

.PHONY: setup
setup:
	@echo "🔧 Setting up the backend environment..."
	@${MAKE} setup-env
ifneq ($(IS_CI),true)
	@${MAKE} docker-compose-up
endif
	bun install
	bun run prisma:generate
ifneq ($(SKIP_MIGRATIONS),true)
ifneq ($(IS_CI),true)
	bun run prisma:migrate:dev
endif
	bun run prisma:migrate:test
endif
	bun run prisma:validate
	@echo "✅ Backend environment setup complete!"

.PHONY: setup-env
setup-env:
	@echo "🔗 Setting up environment symlink..."
	ln -sf ../../../.env .env
	@echo "✅ environment symlink created"

# -------------------------------------------------------------
# docker
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
