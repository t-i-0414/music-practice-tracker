# -------------------------------------------------------------
# Setting up
# -------------------------------------------------------------
.PHONY: setup
setup:
	@echo "🔧 Setting up the admin environment..."
	@${MAKE} setup-env
	bun run cypress install
	bunx playwright install --with-deps
	@echo "✅ admin environment setup complete!"

.PHONY: setup-env
setup-env:
	@echo "🔗 Setting up environment symlink..."
	ln -sf ../../../.env .env
	@echo "✅ environment symlink created"
