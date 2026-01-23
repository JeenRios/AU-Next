import { test, expect } from '@playwright/test';

test('verify settings page UI with delete button', async ({ page }) => {
  // Mock the profile API
  await page.route('**/api/user/profile', async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            first_name: 'Demo',
            last_name: 'User',
            phone: '+1 555 1234',
            country: 'United States',
            city: 'New York',
            address: '123 Wall St',
            postal_code: '10005',
            email: 'user@au.com',
            role: 'user'
          }
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock session
  await page.route('**/api/session', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 1, email: 'user@au.com', role: 'user' }
      }),
    });
  });

  // Go to dashboard with settings tab
  await page.goto('http://localhost:3004/dashboard?tab=settings');

  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'screenshots/debug_settings.png', fullPage: true });
});
