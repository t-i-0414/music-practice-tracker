import { test as base } from '@playwright/test';

// カスタムフィクスチャの定義
// 将来的にAPIモックやテストデータのセットアップなどを追加できます
export const test = base.extend({});

export { expect } from '@playwright/test';
