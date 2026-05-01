# -------------------------------------------------------------
# Setting up
# -------------------------------------------------------------
.PHONY: setup
setup:
	@echo "🔧 Setting up the mobile environment..."
	@${MAKE} setup-env
	@${MAKE} eas-install
	@mkdir -p .vscode && printf '{\n  "files.exclude": {\n    ".expo": true,\n    "dist": true,\n    "build": true,\n    "coverage": true,\n    "expo-env.d.ts": true,\n    "node_modules": true\n  },\n  "jest.enable": false,\n  "editor.codeActionsOnSave": {\n    "source.organizeImports": "never"\n  }\n}' > .vscode/settings.json
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

# -------------------------------------------------------------
# EAS Build
# -------------------------------------------------------------
.PHONY: eas-build-dev-simulator
eas-build-dev-simulator:
	@echo "📱 Building development client (iOS simulator)..."
	eas build --profile development-simulator --platform ios

.PHONY: eas-build-dev-ios
eas-build-dev-ios:
	@echo "📱 Building development client (iOS device)..."
	eas build --profile development --platform ios

.PHONY: eas-build-dev-android
eas-build-dev-android:
	@echo "📱 Building development client (Android)..."
	eas build --profile development --platform android

.PHONY: eas-build-staging-ios
eas-build-staging-ios:
	@echo "📦 Building staging (iOS)..."
	eas build --profile staging --platform ios

.PHONY: eas-build-staging-android
eas-build-staging-android:
	@echo "📦 Building staging (Android)..."
	eas build --profile staging --platform android

.PHONY: eas-build-production-ios
eas-build-production-ios:
	@echo "🚀 Building production (iOS)..."
	eas build --profile production --platform ios

.PHONY: eas-build-production-android
eas-build-production-android:
	@echo "🚀 Building production (Android)..."
	eas build --profile production --platform android

.PHONY: eas-build-list
eas-build-list:
	eas build:list

# -------------------------------------------------------------
# EAS Update (OTA)
# -------------------------------------------------------------
.PHONY: eas-update-dev
eas-update-dev:
	@echo "📡 Publishing OTA update (development)..."
	eas update --channel development

.PHONY: eas-update-staging
eas-update-staging:
	@echo "📡 Publishing OTA update (staging)..."
	eas update --channel staging

.PHONY: eas-update-production
eas-update-production:
	@echo "📡 Publishing OTA update (production)..."
	eas update --channel production

# -------------------------------------------------------------
# EAS Submit
# -------------------------------------------------------------
.PHONY: eas-submit-ios
eas-submit-ios:
	@echo "🍎 Submitting to App Store..."
	eas submit --profile production --platform ios

.PHONY: eas-submit-android
eas-submit-android:
	@echo "🤖 Submitting to Google Play..."
	eas submit --profile production --platform android

# -------------------------------------------------------------
# EAS Device
# -------------------------------------------------------------
.PHONY: eas-device-list
eas-device-list:
	eas device:list

.PHONY: eas-device-create
eas-device-create:
	@echo "📲 Registering new device..."
	eas device:create

# -------------------------------------------------------------
# EAS Others
# -------------------------------------------------------------
.PHONY: eas-install
eas-install:
	@echo "📥 Installing EAS CLI..."
	npm install -g eas-cli

.PHONY: eas-version
eas-version:
	@echo "📊 EAS CLI version:"
	eas --version

.PHONY: eas-login
eas-login:
	@echo "🔐 Logging into EAS..."
	eas login

.PHONY: eas-logout
eas-logout:
	@echo "🔓 Logging out of EAS..."
	eas logout

.PHONY: eas-whoami
eas-whoami:
	@echo "👤 Checking EAS login status..."
	eas whoami

.PHONY: eas-config
eas-config:
	@echo "⚙️  Showing EAS configuration..."
	eas config

.PHONY: eas-build-clean
eas-build-clean:
	@echo "🧹 Cleaning EAS build cache..."
	eas build:cache:clear

.PHONY: eas-diagnostics
eas-diagnostics:
	@echo "🔍 Running EAS diagnostics..."
	eas diagnostics

.PHONY: expo-doctor
expo-doctor:
	@echo "🩺 Running Expo doctor..."
	npx expo-doctor
