# -------------------------------------------------------------
# Setting up
# -------------------------------------------------------------
.PHONY: setup
setup:
	@echo "🔧 Setting up the mobile environment..."
	@${MAKE} setup-env
	npm install -g eas-cli
	@mkdir -p .vscode && printf '{\n  "files.exclude": {\n    ".expo": true,\n    "dist": true,\n    "build": true,\n    "coverage": true,\n    "expo-env.d.ts": true,\n    "node_modules": true\n  },\n  "editor.codeActionsOnSave": {\n    "source.organizeImports": "never"\n  }\n}' > .vscode/settings.json
	@echo "✅ mobile environment setup complete!"

.PHONY: setup-env
setup-env:
	@echo "🔗 Setting up environment symlink..."
	ln -sf ../../../.env .env
	@echo "✅ environment symlink created"

DEVICE_ARG := $(if $(DEVICE_ID),--device $(DEVICE_ID),)
PATH_TO_FLOW := tests/e2e/main-e2e.yaml
.PHONY: test-e2e
test-e2e: # You need to run dev server before running this command `bun run start:dev`
	maestro $(DEVICE_ARG) test $(PATH_TO_FLOW) --config ./tests/e2e/.maestro/config.yaml

.PHONY: test-e2e-ui
test-e2e-ui: # You need to run dev server before running this command `bun run start:dev`
	maestro $(DEVICE_ARG) studio
