# -------------------------------------------------------------
# Variables
# -------------------------------------------------------------
# Default value for NEED_DB
NEED_DB ?= true

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
	@mkdir -p .vscode && printf '{\n  "files.exclude": {\n    "dist": true,\n    "build": true,\n    "coverage": true,\n    "tests/coverage": true,\n    "node_modules": true\n  },\n  "jest.runMode": "on-demand",\n  "editor.codeActionsOnSave": {\n    "source.organizeImports": "never"\n  }\n}' > .vscode/settings.json
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
ifeq ($(NEED_DB),true)
	@echo "🐳 Setting up Docker containers..."
	@${MAKE} docker-compose-up
endif

# -------------------------------------------------------------
# Database setup
# -------------------------------------------------------------
.PHONY: setup-database
setup-database:
	@echo "🗄️ Setting up database..."
	bun run prisma:client:generate
ifneq ($(SKIP_MIGRATIONS),true)
	@${MAKE} run-migrations
endif
	bun run prisma:validate
	@echo "✅ Database setup complete"

.PHONY: run-migrations
run-migrations:
	@echo "📊 Running database migrations..."
	bun run prisma:migrate:apply
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
# firebase management
# -------------------------------------------------------------
.PHONY: start-firebase-dev-emulators
start-firebase-dev-emulators:
	@make -C ../../../ start-firebase-dev-emulators

.PHONY: start-firebase-test-emulators
start-firebase-test-emulators:
	@make -C ../../../ start-firebase-test-emulators


# -------------------------------------------------------------
# Utility targets
# -------------------------------------------------------------
.PHONY: cd-to-root
cd-to-root:
	@echo "🔄 Changing directory to root..."
	cd ../../../ && pwd
	@echo "✅ Changed directory to root"
