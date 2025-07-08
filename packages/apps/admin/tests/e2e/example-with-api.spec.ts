import { expect, test } from '@playwright/test';

test.describe('Example: Testing with API interactions', () => {
  test('should interact with backend API', async ({ page }) => {
    // APIレスポンスをインターセプトしてモックする例
    await page.route('**/api/admin/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            { id: '1', email: 'user1@example.com', name: 'User 1' },
            { id: '2', email: 'user2@example.com', name: 'User 2' },
          ],
          total: 2,
        }),
      });
    });

    // 実際の画面遷移（将来的にユーザー一覧画面が実装された場合）
    // await page.goto('/users');
    // await expect(page.getByText('user1@example.com')).toBeVisible();
    // await expect(page.getByText('user2@example.com')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // APIエラーをシミュレート
    await page.route('**/api/admin/users', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    // エラーハンドリングのテスト（将来的な実装例）
    // await page.goto('/users');
    // await expect(page.getByText('エラーが発生しました')).toBeVisible();
  });
});