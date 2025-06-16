# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

音楽練習トラッカーアプリケーション。ワークスペースを使用したモノレポ構造で構築されており、3つのメインアプリケーションで構成されています：

- **Backend**: PostgreSQLデータベースを使用したNestJS APIサーバー
- **Admin**: Next.js管理ダッシュボード
- **Mobile**: Expoを使用したReact Nativeアプリ

## 開発セットアップ

### 初期セットアップ

```bash
make setup
```

これにより以下が実行されます：

- `bun install`で依存関係をインストール
- `.env.example`を`.env`にコピー（存在しない場合）
- ルートの`.env`をbackendディレクトリにシンボリックリンク
- Prismaマイグレーションを実行

### データベース

- PostgreSQLデータベースはDocker Composeで実行
- PrismaORMでデータベーススキーマを管理
- 生成されたPrismaクライアントは`packages/apps/backend/generated/prisma`に出力
- データベースURL: `postgresql://postgres:postgres@localhost:15432/music_practice_tracker`
- ポート15432を使用（デフォルトの5432ではない）

### Dockerコマンド

```bash
# データベース開始
docker compose up -d

# データベース停止
docker compose down

# backendディレクトリから
make docker-compose-up
make docker-compose-down
```

### Prismaコマンド

```bash
# backendディレクトリで実行
cd packages/apps/backend

# マイグレーション作成・実行
bunx prisma migrate dev --name [migration_name]

# スキーマをデータベースにプッシュ（開発時のみ）
bunx prisma db push

# Prisma Studioでデータベース確認
bunx prisma studio

# クライアント再生成
bunx prisma generate
```

## 開発コマンド

### ルートレベルコマンド

```bash
# 全パッケージの型チェック
npm run type:check

# 型同期とインストール
npm run type:sync

# フォーマットチェックと修正
npm run format:check
npm run format:fix

# スペルチェック
npm run cspell
```

### Backend (packages/apps/backend)

```bash
# 開発
npm run start:dev
npm run start:debug

# ビルド
npm run build
npm run start:prod

# テスト
npm run test
npm run test:watch
npm run test:e2e
npm run test:cov
npm run test:debug  # デバッグモードでテスト実行

# リンティング
npm run lint:check
npm run lint:fix

# 型チェック
npm run type:check
```

### Admin (packages/apps/admin)

```bash
# 開発（Turbopack使用）
npm run dev

# ビルド
npm run build
npm run start

# リンティング
npm run lint:check
npm run lint:fix

# 型チェック
npm run type:check
```

### Mobile (packages/apps/mobile)

```bash
# 開発
npm run dev
npm run dev:ios
npm run dev:android
npm run dev:web

# リンティング（並列実行）
npm run lint
npm run lint:check
npm run lint:fix

# 型チェック
npm run type:check

# プロジェクトリセット
npm run reset-project
```

## アーキテクチャ

### Backendの構造

- **NestJS**フレームワークでモジュラーアーキテクチャ
- **Prisma ORM**でデータベース操作
- **PostgreSQL**データベース
- **APIモジュール**は`src/api/`に配置（例：usersモジュール）
- **リポジトリパターン**を`src/repository/`で実装
- **サービス層**は`src/services/`でビジネスロジックを処理
- **共通ユーティリティ**は`src/common/`に配置（デコレータなど）

### データベーススキーマ

- シンプルなUserモデル（id、email、name フィールド）
- 現在は基本的なCRUD操作のみ実装

### フロントエンドアプリケーション

- **Admin**: TypeScriptを使用したNext.js 15
- **Mobile**: Expo Router for navigationを使用したExpo 53とReact Native

### 共有ライブラリ

- 現在`packages/libs/`には共有ライブラリなし
- 共有依存関係はルートレベルで管理

## 主要技術

- **ランタイム**: パッケージ管理と開発にBun使用
- **言語**: 全パッケージでTypeScript使用
- **データベース**: PostgreSQL with Prisma
- **Backend**: NestJS
- **Frontend**: Next.js（admin）、React Native with Expo（mobile）
- **テスト**: Jest
- **リンティング**: ESLint with Prettier
- **Gitフック**: Lefthookで pre-commit チェック
- **コミット**: commitlintで Conventional commits

## Git フック設定

Lefthookによる自動化：

- コミットメッセージの検証（commitlint）
- package.jsonの自動ソート
- 並列処理でパフォーマンス最適化

## 環境設定

- ルートの`.env`ファイルでデータベース設定
- backendへシンボリックリンクしてデータベースアクセス
- PostgreSQLはポート15432で実行（デフォルトの5432ではない）
