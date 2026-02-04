# EAS Update 統合アーキテクチャ設計書

## 1. 概要

### 1.1 目的

Music Practice Tracker モバイルアプリに EAS Update (OTA更新) を統合し、ストア審査なしでJavaScriptバンドルの更新を配信できるようにする。

### 1.2 スコープ

| 対象                                          | 含む/含まない            |
| --------------------------------------------- | ------------------------ |
| アプリ内更新検知・ダウンロード・適用          | ✅ 含む                  |
| GitHub Actions による自動デプロイ             | ✅ 含む                  |
| チャンネル別環境管理 (dev/staging/production) | ✅ 含む                  |
| ロールバック対応                              | ✅ 含む                  |
| ネイティブコード変更を伴う更新                | ❌ 含まない (ストア経由) |

### 1.3 現在の状態

| 項目                      | 状態                | 備考                                   |
| ------------------------- | ------------------- | -------------------------------------- |
| `expo-updates`            | ✅ インストール済み | v29.0.15                               |
| `eas.json` チャンネル設定 | ✅ 設定済み         | dev/staging/production                 |
| `runtimeVersion` ポリシー | ✅ 設定済み         | `appVersion`                           |
| EAS Project ID            | ✅ 設定済み         | `382a6dba-a16c-4b4d-91be-abade4f6c750` |
| GitHub Actions            | ❌ 未設定           | CI/CD連携なし                          |
| アプリ内更新UI            | ❌ 未実装           | `useUpdates` フック未使用              |

---

## 2. システムアーキテクチャ

### 2.1 全体構成図

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
│  │  │ --auto       │  │ --channel    │  │ --channel    │       │         │
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

### 2.2 チャンネル・ブランチ構成

| Channel       | Git Branch   | 用途                 | 配信先                  |
| ------------- | ------------ | -------------------- | ----------------------- |
| `development` | develop / PR | 開発・PRプレビュー   | 開発チーム              |
| `staging`     | staging      | QAテスト             | TestFlight / 内部テスト |
| `production`  | main         | 本番リリース         | App Store / Google Play |
| `storybook`   | -            | UIコンポーネント確認 | デザインチーム          |

---

## 3. コンポーネント設計

### 3.1 ファイル構成

```
packages/apps/mobile/src/
├── features/
│   └── updates/                          # 🆕 新規ディレクトリ
│       ├── index.ts                      # Public exports
│       ├── hooks/
│       │   └── useAppUpdates.ts          # 更新管理フック
│       ├── components/
│       │   ├── UpdateBanner.tsx          # 更新通知バナー
│       │   └── UpdateModal.tsx           # 更新確認モーダル
│       ├── context/
│       │   └── UpdatesProvider.tsx       # 更新Context Provider
│       └── utils/
│           └── updateHelpers.ts          # ヘルパー関数
├── app/
│   └── _layout.tsx                       # 📝 UpdatesProvider追加
└── hooks/
    └── index.ts                          # 📝 エクスポート追加
```

### 3.2 コンポーネント詳細

#### 3.2.1 useAppUpdates Hook

```typescript
interface UseAppUpdatesReturn {
  // 状態
  isEnabled: boolean;
  isEmbeddedLaunch: boolean;
  isUpdateAvailable: boolean;
  isUpdatePending: boolean;
  isDownloading: boolean;
  downloadProgress: number;

  // エラー
  checkError: Error | null;
  downloadError: Error | null;

  // 更新情報
  currentUpdate: Updates.UpdateInfo | null;
  availableUpdate: Updates.UpdateInfo | null;

  // アクション
  checkForUpdates: () => Promise<void>;
  downloadAndApplyUpdate: () => Promise<void>;
  dismissUpdate: () => void;
}
```

**責務:**

- `expo-updates` の状態をラップ
- 更新チェック・ダウンロード・適用のロジック
- エラーハンドリング

#### 3.2.2 UpdatesProvider Context

```typescript
interface UpdatesContextValue extends UseAppUpdatesReturn {
  // UI状態
  showBanner: boolean;
  showModal: boolean;

  // UI制御
  openModal: () => void;
  closeModal: () => void;
  hideBanner: () => void;
}
```

**責務:**

- アプリ全体で更新状態を共有
- UI表示状態の管理
- 自動更新チェック (アプリ起動時)

#### 3.2.3 UpdateBanner Component

```
┌──────────────────────────────────────────────────────────────┐
│ 🔄 新しいバージョンが利用可能です          [更新する] [×]   │
└──────────────────────────────────────────────────────────────┘
```

**責務:**

- 非侵入型の更新通知
- ダウンロード進捗表示
- ユーザーアクション (更新/閉じる)

#### 3.2.4 UpdateModal Component

```
┌────────────────────────────────────────┐
│           アプリを更新                  │
│                                        │
│  新しいバージョンが利用可能です。       │
│  更新すると、最新の機能と修正が         │
│  適用されます。                         │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ ████████████████░░░░  75%     │   │
│  └────────────────────────────────┘   │
│                                        │
│      [後で]           [今すぐ更新]      │
└────────────────────────────────────────┘
```

**責務:**

- 更新の詳細表示
- ダウンロード進捗
- 確認ダイアログ

---

## 4. データフロー

### 4.1 更新チェックフロー

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

### 4.2 更新適用フロー

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

## 5. CI/CD パイプライン設計

### 5.1 ワークフロー構成

| ワークフロー         | トリガー        | アクション                        |
| -------------------- | --------------- | --------------------------------- |
| `eas-preview.yml`    | Pull Request    | `eas update --auto`               |
| `eas-staging.yml`    | push to staging | `eas update --channel staging`    |
| `eas-production.yml` | push to main    | `eas update --channel production` |

### 5.2 setup-eas Action (新規)

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
          command: eas update --auto
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
        run: |
          eas update \
            --channel production \
            --message "${{ github.event.head_commit.message }}"
```

---

## 6. 設定変更

### 6.1 app.config.ts 追加設定

```typescript
// 追加する設定
{
  updates: {
    url: `https://u.expo.dev/382a6dba-a16c-4b4d-91be-abade4f6c750`,
    fallbackToCacheTimeout: 0,
    checkAutomatically: 'ON_LOAD',
  },
}
```

### 6.2 必要な環境変数・シークレット

| 名前         | 場所           | 用途         | 取得元                                                        |
| ------------ | -------------- | ------------ | ------------------------------------------------------------- |
| `EXPO_TOKEN` | GitHub Secrets | EAS CLI 認証 | [Expo Access Tokens](https://expo.dev/settings/access-tokens) |

---

## 7. 実装優先順位

### Phase 1: 基盤 (必須)

1. `app.config.ts` に `updates` 設定追加
2. `useAppUpdates` フック実装
3. `UpdatesProvider` 実装

### Phase 2: UI (必須)

1. `UpdateBanner` コンポーネント実装
2. `_layout.tsx` に Provider 追加

### Phase 3: CI/CD (推奨)

1. `setup-eas` Action 作成
2. `eas-preview.yml` ワークフロー追加
3. `eas-production.yml` ワークフロー追加

### Phase 4: 拡張 (オプション)

1. `UpdateModal` コンポーネント (強制更新用)
2. 段階的ロールアウト設定
3. エラー監視連携

---

## 8. テスト戦略

### 8.1 ユニットテスト

- `useAppUpdates` フックのモック動作テスト
- `UpdateBanner` レンダリングテスト

### 8.2 E2Eテスト

- 更新バナー表示テスト (Maestro)

### 8.3 手動テスト

1. Development build で `eas update --channel development` 実行
2. 更新検知・ダウンロード・適用の動作確認

---

## 9. 運用コマンド

### 更新の公開

```bash
# 開発環境
eas update --channel development --message "Fix: bug description"

# ステージング
eas update --channel staging --message "Release: v1.0.1"

# 本番 (段階的ロールアウト)
eas update --channel production --rollout-percentage 10 --message "Release: v1.0.1"

# ロールアウト拡大
eas update:edit --rollout-percentage 50
eas update:edit --rollout-percentage 100
```

### Republish (ステージング → 本番)

```bash
eas update:republish --destination-channel production
```

### ロールバック

```bash
eas update:rollback --channel production
```

---

## 10. 参考資料

- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Runtime Versions](https://docs.expo.dev/eas-update/runtime-versions/)
- [Deployment Patterns](https://docs.expo.dev/eas-update/deployment/)
- [expo-updates SDK](https://docs.expo.dev/versions/latest/sdk/updates/)
- [GitHub Actions Integration](https://docs.expo.dev/eas-update/github-actions/)
