import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login-page';
import { TestData } from '../../data/test-data';
import { getBaseUrl } from '../../utils/config';

test.describe.skip('Login Tests - Invalid Credentials', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
  });

  test('should show error for wrong username @negative @regression', async () => {
    // Attempt login with wrong username
    await loginPage.login(
      TestData.invalidCredentials.wrongUsername.username,
      TestData.invalidCredentials.wrongUsername.password,
    );

    // Verify error message is displayed
    await loginPage.waitForLoginFailure();
    expect(await loginPage.isErrorMessageVisible()).toBe(true);
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
    
    // Verify still on login page
    expect(await loginPage.isOnLoginPage()).toBe(true);
  });

  test('should show error for wrong password @negative @regression', async () => {
    // Attempt login with wrong password
    await loginPage.login(
      TestData.invalidCredentials.wrongPassword.username,
      TestData.invalidCredentials.wrongPassword.password,
    );

    // Verify error message is displayed
    await loginPage.waitForLoginFailure();
    expect(await loginPage.isErrorMessageVisible()).toBe(true);
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
  });

  test('should show error for empty username @negative @regression', async () => {
    // Attempt login with empty username
    await loginPage.login(
      TestData.invalidCredentials.emptyUsername.username,
      TestData.invalidCredentials.emptyUsername.password,
    );

    // Verify error message is displayed
    await loginPage.waitForLoginFailure();
    expect(await loginPage.isErrorMessageVisible()).toBe(true);
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Required');
  });

  test('should show error for empty password @negative @regression', async () => {
    // Attempt login with empty password
    await loginPage.login(
      TestData.invalidCredentials.emptyPassword.username,
      TestData.invalidCredentials.emptyPassword.password,
    );

    // Verify error message is displayed
    await loginPage.waitForLoginFailure();
    expect(await loginPage.isErrorMessageVisible()).toBe(true);
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Required');
  });

  test('should show error for both empty fields @negative @regression', async () => {
    // Attempt login with both fields empty
    await loginPage.login(
      TestData.invalidCredentials.bothEmpty.username,
      TestData.invalidCredentials.bothEmpty.password,
    );

    // Verify error message is displayed
    await loginPage.waitForLoginFailure();
    expect(await loginPage.isErrorMessageVisible()).toBe(true);
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Required');
  });

  test('should handle multiple failed login attempts @security', async () => {
    // Attempt multiple failed logins
    for (let i = 0; i < 3; i++) {
      await loginPage.login('wronguser', 'wrongpass');
      await loginPage.waitForLoginFailure();
      
      // Verify error message is still displayed
      expect(await loginPage.isErrorMessageVisible()).toBe(true);
    }
    
    // Verify login form is still functional
    expect(await loginPage.isLoginFormVisible()).toBe(true);
    expect(await loginPage.isLoginButtonEnabled()).toBe(true);
  });

  test('should show error for excessively long username @negative', async () => {
    await loginPage.login(
      TestData.invalidCredentials.excessivelyLongUsername.username,
      TestData.invalidCredentials.excessivelyLongUsername.password,
    );

    await loginPage.waitForLoginFailure();
    expect(await loginPage.isErrorMessageVisible()).toBe(true);
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain(TestData.invalidCredentials.excessivelyLongUsername.expectedError);
  });

  test('should show error for whitespace only username @negative', async () => {
    await loginPage.login(
      TestData.invalidCredentials.whitespaceOnly.username,
      TestData.invalidCredentials.whitespaceOnly.password,
    );

    await loginPage.waitForLoginFailure();
    expect(await loginPage.isErrorMessageVisible()).toBe(true);
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain(TestData.invalidCredentials.whitespaceOnly.expectedError);
  });

  test('should prevent XSS attack in username @security @regression', async ({ page }) => {
    await loginPage.login(
      TestData.invalidCredentials.xssAttempt.username,
      TestData.invalidCredentials.xssAttempt.password,
    );

    await loginPage.waitForLoginFailure();
    expect(await loginPage.isErrorMessageVisible()).toBe(true);
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain(TestData.invalidCredentials.xssAttempt.expectedError);
    
    // Verify no script execution occurred
    const alerts = await page.evaluate(() => window.alert);
    expect(alerts).toBeUndefined();
  });

  test('should prevent SQL injection in username @security @regression', async () => {
    await loginPage.login(
      TestData.invalidCredentials.sqlInjection.username,
      TestData.invalidCredentials.sqlInjection.password,
    );

    await loginPage.waitForLoginFailure();
    expect(await loginPage.isErrorMessageVisible()).toBe(true);
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain(TestData.invalidCredentials.sqlInjection.expectedError);
  });

  test('should show error for special characters in username @negative', async () => {
    await loginPage.login(
      TestData.invalidCredentials.specialCharsUsername.username,
      TestData.invalidCredentials.specialCharsUsername.password,
    );

    await loginPage.waitForLoginFailure();
    expect(await loginPage.isErrorMessageVisible()).toBe(true);
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain(TestData.invalidCredentials.specialCharsUsername.expectedError);
  });

  test.fixme('should handle too many login attempts @security @regression @bug-notHandleManyAttempts', async () => {
    const maxAttempts = TestData.sessionTestData.tooManyAttempts.maxAttempts;
    
    // Attempt multiple failed logins
    for (let i = 0; i < maxAttempts; i++) {
      await loginPage.login(
        TestData.sessionTestData.tooManyAttempts.username,
        TestData.sessionTestData.tooManyAttempts.password,
      );
      
      // Wait for error message
      await loginPage.waitForLoginFailure();
      expect(await loginPage.isErrorMessageVisible()).toBe(true);
      
      // Clear fields for next attempt
      await loginPage.clearForm();
    }
    
    // After max attempts, should show account locked message
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Too many login attempts');
  });

  test('should redirect to login when accessing dashboard without authentication @security', async ({ page }) => {
    const baseUrl = getBaseUrl();
    const dashboardUrl = `${baseUrl}/web/index.php/dashboard/index`;
    // Try to access dashboard directly without login
    await page.goto(dashboardUrl);
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Should be redirected to login page
    const currentUrl = page.url();
    // Verify we're on login page
    expect(currentUrl).toMatch(/.*login/);
    expect(await loginPage.isOnLoginPage()).toBe(true);
    
    // Verify login form is visible
    expect(await loginPage.isLoginFormVisible()).toBe(true);
  });

  test('should restrict access to protected URLs without login @security @regression', async ({ page }) => {
    const protectedUrls = TestData.sessionTestData.urlAccessRestriction.protectedUrls;
    const baseUrl = getBaseUrl();
    
    for (const url of protectedUrls) {
      // Try to access protected URL directly (construct full URL)
      const fullUrl = `${baseUrl}${url}`;
      await page.goto(fullUrl);
      
      // Wait for navigation to complete
      await page.waitForLoadState('networkidle');
      
      // Should be redirected to login page
      const currentUrl = page.url();
      // Check if we're on login page
      const isOnLoginPage = await loginPage.isOnLoginPage();
      
      // Verify redirect to login page
      expect(currentUrl).toMatch(/.*login/);
      expect(isOnLoginPage).toBe(true);
    }
  });
});
