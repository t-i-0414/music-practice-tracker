# -------------------------------------------------------------
# Setting up
# -------------------------------------------------------------
.PHONY: setup
setup:
	@echo "🔧 Setting up the environment..."
	@${MAKE} setup-env
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

.PHONY: setup-env
setup-env:
	@echo "🔧 Setting up environment..."
	@if [ ! -f .env ]; then \
		echo "Creating .env file from .env.example..."; \
		cp .env.example .env; \
		echo "✅ .env file created"; \
	else \
		echo "⚠️  .env file already exists, skipping creation"; \
	fi

.PHONY: setup-dotenv-linter
setup-dotenv-linter:
	curl -sSfL https://raw.githubusercontent.com/dotenv-linter/dotenv-linter/master/install.sh | sh -s

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
	@echo "🔍 Checking if Firebase emulators are already running..."
	@if lsof -Pi :9099 -sTCP:LISTEN -t >/dev/null 2>&1 || \
		lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1 || \
		lsof -Pi :4400 -sTCP:LISTEN -t >/dev/null 2>&1; then \
		echo "⚠️  Firebase emulators are already running on dev ports (Auth: 9099, UI: 4000)"; \
		echo "📝 To view the emulator UI, open: http://localhost:4000"; \
	else \
		echo "🚀 Starting Firebase emulators..."; \
		firebase emulators:start --config firebase.dev.json --project dev --import ./.firebase-emulator-data/dev --export-on-exit; \
	fi

.PHONY: start-firebase-test-emulators
start-firebase-test-emulators:
	@echo "🔍 Checking if Firebase emulators are already running..."
	@if lsof -Pi :9199 -sTCP:LISTEN -t >/dev/null 2>&1 || \
		lsof -Pi :4001 -sTCP:LISTEN -t >/dev/null 2>&1 || \
		lsof -Pi :4401 -sTCP:LISTEN -t >/dev/null 2>&1; then \
		echo "⚠️  Firebase emulators are already running on test ports (Auth: 9199, UI: 4001)"; \
		echo "📝 To view the emulator UI, open: http://localhost:4001"; \
	else \
		echo "🚀 Starting Firebase emulators..."; \
		firebase emulators:start --config firebase.test.json --project music-practice-tracker-test; \
	fi

.PHONY: stop-firebase-emulators
stop-firebase-emulators:
	@echo "🛑 Stopping Firebase emulators..."
	@pkill -f "firebase emulators:start" 2>/dev/null || true
	@echo "✅ Firebase emulators stopped"
