# -------------------------------------------------------------
# Setting up
# -------------------------------------------------------------
.PHONY: setup
setup:
	@echo "🔧 Setting up the environment..."
	@${MAKE} setup-env
	bun install
	@make -C packages/libs/eslint-configs setup
	@make -C packages/libs/eslint-configs build
	@make -C packages/libs/eslint-plugins setup
	@make -C packages/libs/eslint-plugins build
	@make -C packages/apps/backend setup
	@make -C packages/apps/mobile setup
	@make -C packages/apps/admin setup
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
