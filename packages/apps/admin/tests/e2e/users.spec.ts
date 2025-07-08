import { expect, test } from '@playwright/test';

test.describe('Admin App E2E', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Create Next App/iu);

    // Verify the page loaded successfully by checking for Next.js logo
    const nextLogo = page.getByAltText('Next.js logo');
    await expect(nextLogo).toBeVisible();

    // Check for main content
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });
});
