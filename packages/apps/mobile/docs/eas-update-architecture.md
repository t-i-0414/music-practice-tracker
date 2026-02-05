# EAS Update Integration Architecture

## 1. Overview

### 1.1 Purpose

Integrate EAS Update (OTA updates) into the Music Practice Tracker mobile app, enabling JavaScript bundle updates without app store review.

### 1.2 Scope

| Item                                         | Included/Excluded          |
| -------------------------------------------- | -------------------------- |
| In-app update detection, download, and apply | Included                   |
| Automated deployment via GitHub Actions      | Included                   |
| Channel-based environment management         | Included                   |
| Rollback support                             | Included                   |
| Updates requiring native code changes        | Excluded (via app stores)  |

### 1.3 Current State

| Item                      | Status       | Notes                                  |
| ------------------------- | ------------ | -------------------------------------- |
| `expo-updates`            | Installed    | v29.0.15                               |
| `eas.json` channel config | Configured   | dev/staging/production                 |
| `runtimeVersion` policy   | Configured   | `appVersion`                           |
| EAS Project ID            | Configured   | `382a6dba-a16c-4b4d-91be-abade4f6c750` |
| GitHub Actions            | Not set up   | No CI/CD integration                   |
| In-app update UI          | Implemented  | `useUpdates` hook in use               |

---

## 2. System Architecture

### 2.1 Overall Structure

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              GitHub Repository                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                   │
│  │   develop   │───▶│   staging   │───▶│    main     │                   │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                   │
│         │                  │                  │                           │
│         ▼                  ▼                  ▼                           │
│  ┌─────────────────────────────────────────────────────────────┐         │
│  │                   GitHub Actions Workflows                   │         │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │         │
│  │  │ PR Preview   │  │ Staging      │  │ Production   │       │         │
│  │  │ eas update   │  │ eas update   │  │ eas update   │       │         │
│  │  │ --branch pr-N│  │ --channel    │  │ --channel    │       │         │
│  │  └──────┬───────┘  │ staging      │  │ production   │       │         │
│  │         │          └──────┬───────┘  └──────┬───────┘       │         │
│  └─────────┼─────────────────┼─────────────────┼───────────────┘         │
└────────────┼─────────────────┼─────────────────┼─────────────────────────┘
             │                 │                 │
             ▼                 ▼                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           EAS Update Server                               │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │   Channels                                                          │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │ │
│  │  │development │  │  staging   │  │ production │  │ storybook  │    │ │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘    │ │
│  └────────┼───────────────┼───────────────┼───────────────┼───────────┘ │
└───────────┼───────────────┼───────────────┼───────────────┼─────────────┘
            │               │               │               │
            ▼               ▼               ▼               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              Mobile App                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                      Updates Provider                                │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │ │
│  │  │ useUpdates   │──│ UpdateBanner │──│ UpdateModal  │              │ │
│  │  │    Hook      │  │  Component   │  │  Component   │              │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Channel and Branch Configuration

| Channel       | Git Branch   | Purpose              | Target Audience         |
| ------------- | ------------ | -------------------- | ----------------------- |
| `development` | develop / PR | Development/Preview  | Development team        |
| `staging`     | staging      | QA testing           | TestFlight/Internal     |
| `production`  | main         | Production release   | App Store/Google Play   |
| `storybook`   | -            | UI component preview | Design team             |

---

## 3. Component Design

### 3.1 File Structure

```
packages/apps/mobile/src/
├── features/
│   └── updates/
│       ├── index.ts                      # Public exports
│       ├── hooks/
│       │   └── useAppUpdates.ts          # Update management hook
│       ├── components/
│       │   ├── UpdateBanner.tsx          # Update notification banner
│       │   └── UpdateModal.tsx           # Update confirmation modal
│       ├── context/
│       │   └── UpdatesProvider.tsx       # Updates Context Provider
│       └── utils/
│           └── updateHelpers.ts          # Helper functions
├── app/
│   └── _layout.tsx                       # UpdatesProvider added
└── hooks/
    └── index.ts                          # Export additions
```

### 3.2 Component Details

#### 3.2.1 useAppUpdates Hook

```typescript
interface UseAppUpdatesReturn {
  // State
  isEnabled: boolean;
  isEmbeddedLaunch: boolean;
  isUpdateAvailable: boolean;
  isUpdatePending: boolean;
  isDownloading: boolean;
  downloadProgress: number;

  // Errors
  checkError: Error | null;
  downloadError: Error | null;

  // Update info
  currentUpdate: Updates.UpdateInfo | null;
  availableUpdate: Updates.UpdateInfo | null;

  // Actions
  checkForUpdates: () => Promise<void>;
  downloadAndApplyUpdate: () => Promise<void>;
  dismissUpdate: () => void;
}
```

**Responsibilities:**

- Wrap `expo-updates` state
- Update check, download, and apply logic
- Error handling

#### 3.2.2 UpdatesProvider Context

```typescript
interface UpdatesContextValue extends UseAppUpdatesReturn {
  // UI state
  showBanner: boolean;
  showModal: boolean;

  // UI controls
  openModal: () => void;
  closeModal: () => void;
  hideBanner: () => void;
}
```

**Responsibilities:**

- Share update state across the app
- Manage UI display state
- Auto-check updates on app launch

#### 3.2.3 UpdateBanner Component

```
┌──────────────────────────────────────────────────────────────┐
│ 🔄 A new update is available                  [Update] [×]   │
└──────────────────────────────────────────────────────────────┘
```

**Responsibilities:**

- Non-intrusive update notification
- Download progress display
- User actions (update/dismiss)

#### 3.2.4 UpdateModal Component

```
┌────────────────────────────────────────┐
│           Update App                    │
│                                        │
│  A new version is available.           │
│  Updating will apply the latest        │
│  features and fixes.                   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ ████████████████░░░░  75%     │   │
│  └────────────────────────────────┘   │
│                                        │
│      [Later]           [Update Now]    │
└────────────────────────────────────────┘
```

**Responsibilities:**

- Update details display
- Download progress
- Confirmation dialog

---

## 4. Data Flow

### 4.1 Update Check Flow

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  App Start  │────▶│ UpdatesProvider  │────▶│ checkForUpdate  │
└─────────────┘     │   useEffect      │     │   Async()       │
                    └──────────────────┘     └────────┬────────┘
                                                      │
                    ┌─────────────────────────────────┘
                    ▼
         ┌──────────────────┐
         │ isUpdateAvailable │
         │    === true?      │
         └────────┬─────────┘
                  │
        ┌─────────┴─────────┐
        │ YES               │ NO
        ▼                   ▼
┌───────────────┐    ┌───────────────┐
│ Show Banner   │    │ Do Nothing    │
└───────────────┘    └───────────────┘
```

### 4.2 Update Apply Flow

```
┌───────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ User Taps     │────▶│ fetchUpdateAsync │────▶│ isUpdatePending │
│ "Update Now"  │     │                  │     │    === true     │
└───────────────┘     └──────────────────┘     └────────┬────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │ reloadAsync()   │
                                               │ (App Restarts)  │
                                               └─────────────────┘
```

---

## 5. CI/CD Pipeline Design

### 5.1 Workflow Configuration

| Workflow             | Trigger         | Action                            |
| -------------------- | --------------- | --------------------------------- |
| `eas-preview.yml`    | Pull Request    | `eas update --branch pr-N`        |
| `eas-staging.yml`    | push to staging | `eas update --channel staging`    |
| `eas-production.yml` | push to main    | `eas update --channel production` |

### 5.2 setup-eas Action

```yaml
# .github/actions/setup-eas/action.yml
name: Setup EAS
description: Setup Expo EAS CLI for mobile deployments

inputs:
  expo_token:
    description: 'Expo access token'
    required: true

runs:
  using: composite
  steps:
    - name: Setup EAS CLI
      uses: expo/expo-github-action@v8
      with:
        eas-version: latest
        token: ${{ inputs.expo_token }}
```

### 5.3 eas-preview.yml

```yaml
name: EAS Preview

on:
  pull_request:
    paths:
      - 'packages/apps/mobile/**'
      - '.github/workflows/eas-preview.yml'

jobs:
  preview:
    name: EAS Update Preview
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4

      - uses: ./.github/actions/setup-base-project

      - uses: ./.github/actions/setup-eas
        with:
          expo_token: ${{ secrets.EXPO_TOKEN }}

      - uses: expo/expo-github-action/preview@v8
        with:
          working-directory: packages/apps/mobile
          command: eas update --branch pr-${{ github.event.pull_request.number }}
```

### 5.4 eas-production.yml

```yaml
name: EAS Production Deploy

on:
  push:
    branches: [main]
    paths:
      - 'packages/apps/mobile/**'

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: ./.github/actions/setup-base-project

      - uses: ./.github/actions/setup-eas
        with:
          expo_token: ${{ secrets.EXPO_TOKEN }}

      - name: Publish Update
        working-directory: packages/apps/mobile
        env:
          EAS_UPDATE_MESSAGE: ${{ github.event.head_commit.message }}
        run: |
          eas update \
            --channel production \
            --message "$EAS_UPDATE_MESSAGE" \
            --non-interactive
```

---

## 6. Configuration Changes

### 6.1 app.config.ts Additional Settings

```typescript
// Settings to add
{
  updates: {
    url: `https://u.expo.dev/382a6dba-a16c-4b4d-91be-abade4f6c750`,
    fallbackToCacheTimeout: 0,
    checkAutomatically: 'ON_LOAD',
  },
}
```

### 6.2 Required Environment Variables and Secrets

| Name         | Location       | Purpose          | Source                                                        |
| ------------ | -------------- | ---------------- | ------------------------------------------------------------- |
| `EXPO_TOKEN` | GitHub Secrets | EAS CLI auth     | [Expo Access Tokens](https://expo.dev/settings/access-tokens) |

---

## 7. Implementation Priority

### Phase 1: Foundation (Required)

1. Add `updates` configuration to `app.config.ts`
2. Implement `useAppUpdates` hook
3. Implement `UpdatesProvider`

### Phase 2: UI (Required)

1. Implement `UpdateBanner` component
2. Add Provider to `_layout.tsx`

### Phase 3: CI/CD (Recommended)

1. Create `setup-eas` Action
2. Add `eas-preview.yml` workflow
3. Add `eas-production.yml` workflow

### Phase 4: Extensions (Optional)

1. `UpdateModal` component (for forced updates)
2. Gradual rollout configuration
3. Error monitoring integration

---

## 8. Testing Strategy

### 8.1 Unit Tests

- `useAppUpdates` hook mock behavior tests
- `UpdateBanner` rendering tests

### 8.2 E2E Tests

- Update banner display tests (Maestro)

### 8.3 Manual Testing

1. Run `eas update --channel development` with development build
2. Verify update detection, download, and apply behavior

---

## 9. Operations Commands

### Publishing Updates

```bash
# Development
eas update --channel development --message "Fix: bug description"

# Staging
eas update --channel staging --message "Release: v1.0.1"

# Production (gradual rollout)
eas update --channel production --rollout-percentage 10 --message "Release: v1.0.1"

# Expand rollout
eas update:edit --rollout-percentage 50
eas update:edit --rollout-percentage 100
```

### Republish (Staging → Production)

```bash
eas update:republish --destination-channel production
```

### Rollback

```bash
eas update:rollback --channel production
```

---

## 10. References

- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Runtime Versions](https://docs.expo.dev/eas-update/runtime-versions/)
- [Deployment Patterns](https://docs.expo.dev/eas-update/deployment/)
- [expo-updates SDK](https://docs.expo.dev/versions/latest/sdk/updates/)
- [GitHub Actions Integration](https://docs.expo.dev/eas-update/github-actions/)
