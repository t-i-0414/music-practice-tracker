# -------------------------------------------------------------
# Setting up
# -------------------------------------------------------------
.PHONY: setup
setup:
	@echo "🔧 Setting up the mobile environment..."
	bun install
	@echo "✅ mobile environment setup complete!"

DEVICE_ARG := $(if $(DEVICE_ID),--device $(DEVICE_ID),)
PATH_TO_FLOW := tests/e2e/main-e2e.yaml
.PHONY: test-e2e
test-e2e: # You need to run dev server before running this command `bun run start:dev`
	maestro $(DEVICE_ARG) test $(PATH_TO_FLOW) --config ./tests/e2e/.maestro/config.yaml

.PHONY: test-e2e-ui
test-e2e-ui: # You need to run dev server before running this command `bun run start:dev`
	maestro $(DEVICE_ARG) studio
