# -------------------------------------------------------------
# Setting up
# -------------------------------------------------------------
.PHONY: setup
setup:
	@echo "🔧 Setting up ESLint plugins..."
	@mkdir -p .vscode && printf '{\n  "files.exclude": {\n    "coverage": true,\n    "node_modules": true\n  },\n  "editor.codeActionsOnSave": {\n    "source.organizeImports": "never"\n  },\n  "jest.enable": false\n}' > .vscode/settings.json
	@echo "✅ ESLint plugins setup complete!"

# -------------------------------------------------------------
# Building
# -------------------------------------------------------------
.PHONY: build
build:
	@echo "🔨 Building ESLint rules..."
	bun run build
	@echo "✅ ESLint rules built successfully!"
