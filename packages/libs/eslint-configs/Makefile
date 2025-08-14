# -------------------------------------------------------------
# Setting up
# -------------------------------------------------------------
.PHONY: setup
setup:
	@echo "🔧 Setting up ESLint configs..."
	@mkdir -p .vscode && printf '{\n  "files.exclude": {\n    "build": true,\n    "node_modules": true\n  },\n  "editor.codeActionsOnSave": {\n    "source.organizeImports": "never"\n  },\n  "jest.enable": false\n}' > .vscode/settings.json
	@echo "✅ ESLint configs setup complete!"

# -------------------------------------------------------------
# Building
# -------------------------------------------------------------
.PHONY: build
build:
	@echo "🔨 Building ESLint configs..."
	bun run build
	@echo "✅ ESLint configs built successfully!"
