# -------------------------------------------------------------
# Setting up
# -------------------------------------------------------------
.PHONY: setup
setup:
	@echo "🔧 Setting up the admin environment..."
	@${MAKE} setup-env
	bun run cypress install
	bunx playwright install --with-deps
	@mkdir -p .vscode && printf '{\n  "files.exclude": {\n    ".expo": true,\n    "dist": true,\n    "build": true,\n    ".next": true,\n    "next-env.d.ts": true,\n    "coverage": true,\n    "node_modules": true,\n    "**/playwright-report": true,\n    "**/test-results": true,\n    "**/storybook-static": true\n  },\n  "jest.enable": false,\n  "editor.codeActionsOnSave": {\n    "source.organizeImports": "never"\n  }\n}' > .vscode/settings.json
	@echo "✅ admin environment setup complete!"

.PHONY: setup-env
setup-env:
	@echo "🔗 Setting up environment symlink..."
	ln -sf ../../../.env .env
	@echo "✅ environment symlink created"
