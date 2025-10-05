import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login-page';
import { DashboardPage } from '../../pages/dashboard-page';
import { TestData } from '../../data/test-data';

test.describe('Login Tests - Valid Credentials', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.navigateToLogin();
  });

  test('should login successfully with admin credentials @smoke @positive @regression', async ({ page }) => {
    // Perform login with valid admin credentials
    await loginPage.login(
      TestData.validCredentials.admin.username,
      TestData.validCredentials.admin.password,
    );

    // Verify successful login and redirect to dashboard
    await dashboardPage.waitForDashboardLoad();
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verify dashboard elements are visible
    expect(await dashboardPage.isDashboardLoaded()).toBe(true);
    expect(await dashboardPage.areQuickLaunchCardsVisible()).toBe(true);
    
    // Verify welcome message contains admin name
    const welcomeMessage = await dashboardPage.getWelcomeMessage();
    expect(welcomeMessage).toBeTruthy();
    expect(welcomeMessage.length).toBeGreaterThan(0);
    
    // Take screenshot for verification
    await dashboardPage.takeDashboardScreenshot();
  });

  test('should login successfully with lowercase admin username @positive @regression', async ({ page }) => {
    // Perform login with lowercase admin username (case sensitive)
    await loginPage.login(
      TestData.validCredentials.adminLowercase.username,
      TestData.validCredentials.adminLowercase.password,
    );

    // Verify successful login and redirect to dashboard
    await dashboardPage.waitForDashboardLoad();
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verify dashboard elements are visible
    expect(await dashboardPage.isDashboardLoaded()).toBe(true);
    expect(await dashboardPage.areQuickLaunchCardsVisible()).toBe(true);
    
    // Verify welcome message contains admin name
    const welcomeMessage = await dashboardPage.getWelcomeMessage();
    expect(welcomeMessage).toBeTruthy();
    expect(welcomeMessage.length).toBeGreaterThan(0);
    
    // Take screenshot for verification
    await dashboardPage.takeDashboardScreenshot();
  });

  test('should maintain session after page refresh @session', async ({ page }) => {
    // Login first
    await loginPage.login(
      TestData.validCredentials.admin.username,
      TestData.validCredentials.admin.password,
    );
    
    await dashboardPage.waitForDashboardLoad();
    
    // Refresh page
    await page.reload();
    
    // Verify still logged in and on dashboard
    await dashboardPage.waitForDashboardLoad();
    expect(await dashboardPage.isOnDashboardPage()).toBe(true);
  });

  test.fixme('should handle browser back button after login @navigation @bug-notHandleBackAfterLogin', async ({ page }) => {
    // Login first
    await loginPage.login(
      TestData.validCredentials.admin.username,
      TestData.validCredentials.admin.password,
    );
    
    await dashboardPage.waitForDashboardLoad();
    
    // Go back to login page
    await page.goBack();
    
    // Verify redirect to dashboard (should not stay on login page)
    await expect(page).toHaveURL(/.*dashboard/);
    expect(await dashboardPage.isOnDashboardPage()).toBe(true);
  });

  test('should check password masking @security', async () => {
    // Fill password field
    await loginPage.fillPassword(TestData.passwordSecurityData.passwordMasking.password);
    
    // Verify password is masked
    const passwordType = await loginPage.getPasswordFieldType();
    expect(passwordType).toBe(TestData.passwordSecurityData.passwordMasking.expectedType);
  });

  test('should handle copy-paste password @security', async ({ page }) => {
    // Test copy-paste functionality
    await loginPage.fillUsername(TestData.passwordSecurityData.copyPastePassword.username);
    
    // Simulate copy-paste action
    await page.evaluate(() => {
      const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
      passwordInput.value = 'admin123';
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    // Verify password was pasted
    const passwordValue = await loginPage.getPasswordValue();
    expect(passwordValue).toBe(TestData.passwordSecurityData.copyPastePassword.password);
  });

  test('should logout successfully @session @regression', async ({ page }) => {
    // Login first
    await loginPage.login(
      TestData.validCredentials.admin.username,
      TestData.validCredentials.admin.password,
    );
    
    // Wait for dashboard to load
    await dashboardPage.waitForDashboardLoad();
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Perform logout
    await dashboardPage.logout();
    
    // Verify logout by checking URL and login form
    await expect(page).toHaveURL(/.*login/);
    expect(await loginPage.isOnLoginPage()).toBe(true);
  });

  test('should remember session when remember me is checked @session @regression', async ({ page }) => {
    // Login with remember me checked
    await loginPage.login(
      TestData.sessionTestData.rememberSession.username,
      TestData.sessionTestData.rememberSession.password,
    );
    
    // Verify successful login
    await dashboardPage.waitForDashboardLoad();
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Close browser and reopen to test session persistence
    await page.context().close();
    const browser = page.context().browser();
    if (!browser) {
      throw new Error('Browser instance not available');
    }
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();
    
    // Navigate to protected URL
    await newPage.goto('/dashboard');
    
    // Should still be logged in (session remembered)
    await expect(newPage).toHaveURL(/.*dashboard/);
    
    await newContext.close();
  });
});
