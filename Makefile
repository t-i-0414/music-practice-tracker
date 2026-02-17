# -------------------------------------------------------------
# Setting up
# -------------------------------------------------------------
.PHONY: setup
setup:
	@echo "🔧 Setting up the environment with git worktree support..."
	@bin/local/setup-env
	@${MAKE} setup-dotenv-linter
	bun install
	@make -C packages/libs/tsconfig-base setup
	@make -C packages/libs/eslint-configs setup
	@make -C packages/libs/eslint-configs build
	@make -C packages/libs/eslint-plugins setup
	@make -C packages/libs/eslint-plugins build
	@make -C packages/apps/backend setup
	@make -C packages/apps/mobile setup
	@make -C packages/apps/admin setup
	@mkdir -p .vscode && printf '{\n  "files.exclude": {\n    ".postgres-backups": true\n  },\n  "jest.enable": false,\n  "editor.codeActionsOnSave": {\n    "source.organizeImports": "never"\n  }\n}' > .vscode/settings.json
	@echo "✅ Setup complete!"
	@bin/local/status

.PHONY: setup-ci-env
setup-ci-env:
	@echo "🔧 Setting up CI environment variables..."
	@CI=true bin/local/setup-env
	@echo "✅ CI environment variables set up."

.PHONY: setup-dotenv-linter
setup-dotenv-linter:
	curl -sSfL https://raw.githubusercontent.com/dotenv-linter/dotenv-linter/master/install.sh | sh -s

# -------------------------------------------------------------
# Docker Compose
# -------------------------------------------------------------
.PHONY: docker-compose-up
docker-compose-up:
	@echo "🐳 Starting Docker containers..."
	docker compose up -d
	@echo "✅ Docker containers started"

.PHONY: docker-compose-down
docker-compose-down:
	@echo "🐳 Stopping Docker containers..."
	docker compose down
	@echo "✅ Docker containers stopped"

.PHONY: docker-compose-down-volumes
docker-compose-down-volumes:
	@echo "🐳 Stopping Docker containers and removing volumes..."
	docker compose down -v --remove-orphans
	@echo "✅ Docker containers and volumes removed"

.PHONY: docker-compose-restart
docker-compose-restart:
	@echo "🐳 Restarting Docker containers..."
	docker compose restart
	@echo "✅ Docker containers restarted"

.PHONY: docker-compose-logs
docker-compose-logs:
	docker compose logs -f

.PHONY: docker-compose-ps
docker-compose-ps:
	docker compose ps

# -------------------------------------------------------------
# Firebase
# -------------------------------------------------------------
.PHONY: firebase-login
firebase-login:
	@echo "🔐 Logging into Firebase..."
	@command -v firebase >/dev/null 2>&1 || \
		( echo "📦 Installing firebase-tools..." && npm install -g firebase-tools )
	firebase login

.PHONY: firebase-logout
firebase-logout:
	@echo "🔐 Logging out of Firebase..."
	firebase logout

.PHONY: firebase-use-dev-project
firebase-use-dev-project:
	@echo "🔧 Setting Firebase dev project"
	firebase use --add music-practice-tracker-dev

.PHONY: firebase-use-stg-project
firebase-use-stg-project:
	@echo "🔧 Setting Firebase staging project"
	firebase use --add music-practice-tracker-stg

.PHONY: firebase-use-prod-project
firebase-use-prod-project:
	@echo "🔧 Setting Firebase prod project"
	firebase use --add music-practice-tracker-prod

.PHONY: start-firebase-dev-emulators
start-firebase-dev-emulators:
	@echo "🚀 Starting Firebase dev emulators..."
	@bin/firebase/start-dev-emulators

.PHONY: start-firebase-test-emulators
start-firebase-test-emulators:
	@echo "🚀 Starting Firebase test emulators..."
	@bin/firebase/start-test-emulators

.PHONY: stop-firebase-emulators
stop-firebase-emulators:
	@echo "🛑 Stopping Firebase emulators..."
	@pkill -f "firebase emulators:start" 2>/dev/null || true
	@echo "✅ Firebase emulators stopped"

# -------------------------------------------------------------
# Git Worktree Management
# -------------------------------------------------------------
.PHONY: wt-status
wt-status:
	@bin/wt/status

.PHONY: wt-list
wt-list:
	@bin/wt/list

.PHONY: wt-ports
wt-ports:
	@bin/wt/ports

.PHONY: wt-clean
wt-clean:
	@bin/wt/clean

# -------------------------------------------------------------
# Port Registry Management
# -------------------------------------------------------------
.PHONY: ports-list
ports-list:
	@bin/port-registry list

.PHONY: ports-cleanup
ports-cleanup:
	@bin/port-registry cleanup

.PHONY: ports-reset
ports-reset:
	@bin/port-registry reset

# -------------------------------------------------------------
# Status
# -------------------------------------------------------------
.PHONY: status
status:
	@bin/local/status
