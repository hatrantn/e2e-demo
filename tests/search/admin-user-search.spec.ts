import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login-page';
import { DashboardPage } from '../../pages/dashboard-page';
import { AdminUserSearchPage } from '../../pages/admin-user-search-page';
import { TestData } from '../../data/test-data';

test.describe('Admin User Management Search Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let adminUserSearchPage: AdminUserSearchPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    adminUserSearchPage = new AdminUserSearchPage(page);
    
    // Navigate to login page
    await loginPage.navigateToLogin();
    // Login and navigate to Admin User Management
    await loginPage.login(
      TestData.validCredentials.admin.username,
      TestData.validCredentials.admin.password,
    );
    
    // Wait for dashboard to load completely
    await dashboardPage.waitForDashboardLoad();
    // Navigate to user management and wait for it to load
    await adminUserSearchPage.navigateToUserManagement();
  });

  test.describe('Toggle Tests', () => {
    test('should toggle search panel visibility @toggle', async () => {
      //default search panel is visible so toggle will hide it
      const toggleResult = await adminUserSearchPage.testToggleSearchPanel();
      expect(toggleResult).toBe(false);
    });
  });

  test.describe('Text Input Tests', () => {
    test('should search by valid exact username @text-input @positive', async () => {
      const searchResult = await adminUserSearchPage.testUserName('Admin');
      expect(searchResult).toBe(true);
    });

    test('should search by partial username @text-input @negative ', async () => {        
      // Should show "No Records Found" for partial username
      const hasNoRecords = await adminUserSearchPage.testInvalidUserName('Adm');
      expect(hasNoRecords).toBe(true);
        
      // Verify "No Records Found" is displayed
      const isDisplayed = await adminUserSearchPage.hasNoRecordsFound();
      expect(isDisplayed).toBe(true);
    });

    test('should handle case sensitive username @text-input @edge-case', async () => {
      const searchResult = await adminUserSearchPage.testUserName('admin');
      expect(searchResult).toBe(true);
    });

    test('should handle username with special characters @text-input @edge-case', async () => {      
      // Should show "No Records Found" for special characters
      const hasNoRecords = await adminUserSearchPage.testInvalidUserName('Admin@123');
      expect(hasNoRecords).toBe(true);
      
      // Verify "No Records Found" is displayed
      const isDisplayed = await adminUserSearchPage.hasNoRecordsFound();
      expect(isDisplayed).toBe(true);
    });

    test('should handle long text in username @text-input @edge-case', async () => {
      const longText = 'A'.repeat(100);      
      // Should show "No Records Found" for long text
      const hasNoRecords = await adminUserSearchPage.testInvalidUserName(longText);
      expect(hasNoRecords).toBe(true);
      
      // Verify "No Records Found" is displayed
      const isDisplayed = await adminUserSearchPage.hasNoRecordsFound();
      expect(isDisplayed).toBe(true);
    });

    test.fixme('should handle whitespace only username @text-input @negative @bug-notHandleWhitespaceOnly', async () => {
      const hasErrorToast = await adminUserSearchPage.testWhitespaceOnlyUserName();
      expect(hasErrorToast).toBe(true); // Expect error toast to appear for whitespace-only input
        
      // Also verify we can get the error message
      const errorMessage = await adminUserSearchPage.getToastMessage();
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.length).toBeGreaterThan(0);
    });

    test('should prevent SQL injection in username @text-input @security', async () => {
      const sqlInjection = '\'; DROP TABLE users; --';        
      // Should show "No Records Found" for SQL injection
      const hasNoRecords = await adminUserSearchPage.testInvalidUserName(sqlInjection);
      expect(hasNoRecords).toBe(true);
        
      // Verify "No Records Found" is displayed
      const isDisplayed = await adminUserSearchPage.hasNoRecordsFound();
      expect(isDisplayed).toBe(true);
    });

    test('should prevent XSS injection in username @text-input @security', async () => {
      const xssPayload = '<script>alert("xss")</script>';        
      // Should show "No Records Found" for XSS injection
      const hasNoRecords = await adminUserSearchPage.testInvalidUserName(xssPayload);
      expect(hasNoRecords).toBe(true);
        
      // Verify "No Records Found" is displayed
      const isDisplayed = await adminUserSearchPage.hasNoRecordsFound();
      expect(isDisplayed).toBe(true);
    });

    test('should show "No Records Found" for invalid username @text-input @negative', async () => {
      const hasNoRecords = await adminUserSearchPage.testInvalidUserName('nonexistentuser');
      expect(hasNoRecords).toBe(true);
        
      // Verify "No Records Found" is displayed
      const isDisplayed = await adminUserSearchPage.hasNoRecordsFound();
      expect(isDisplayed).toBe(true);
    });

    test('should handle unicode characters in username @edge-case', async () => {
      await adminUserSearchPage.fillUsername('Admín');
      await adminUserSearchPage.clickSearchButton();
      await adminUserSearchPage.waitForSearchResults();
        
      const hasResults = await adminUserSearchPage.hasSearchResults();
      expect(hasResults).toBe(true);
    });
  });

  test.describe('Smart Text Input Tests', () => {
    test('should search by employee name with 1 character @smart-text @positive', async () => {
      const searchResult = await adminUserSearchPage.testEmployeeName('A');
      expect(searchResult).toBe(true);
    });

    test('should search by employee name with 2 characters @smart-text @positive', async () => {
      const searchResult = await adminUserSearchPage.testEmployeeName('Ad');
      expect(searchResult).toBe(true);
    });

    test('should search by employee name with 3 characters @smart-text @positive', async () => {
      const searchResult = await adminUserSearchPage.testEmployeeName('Adm');
      expect(searchResult).toBe(true);
    });

    test('should search by full employee name @smart-text @positive', async () => {
      const searchResult = await adminUserSearchPage.testEmployeeName('Admin User');
      expect(searchResult).toBe(true);
    });

    test('should handle copy-paste in employee name @smart-text @positive', async ({ page }) => {
      // Simulate copy-paste action
      await page.evaluate(() => {
        const input = document.querySelector('input[placeholder*="Employee Name"]') as HTMLInputElement;
        if (input) {
          input.value = 'Admin User';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      
      await adminUserSearchPage.clickSearchButton();
      await adminUserSearchPage.waitForSearchResults();
      
      const hasResults = await adminUserSearchPage.hasSearchResults();
      expect(hasResults).toBe(true);
    });
  });

  test.describe('Invalid Employee Name Validation Tests', () => {
    test('should show error for invalid employee names @validation @negative', async () => {
      const hasInvalidError = await adminUserSearchPage.testInvalidEmployeeName('NonExistentUser');
      expect(hasInvalidError).toBe(true);
        
      const allErrors = await adminUserSearchPage.getAllValidationErrors();
      const hasInvalidMessage = allErrors.some(error => error.toLowerCase().includes('invalid'));
      expect(hasInvalidMessage).toBe(true);      
    });

    test('should show error for special characters in employee name @validation @negative', async () => {
      const hasInvalidError = await adminUserSearchPage.testInvalidEmployeeName('Employee@#$%');
      expect(hasInvalidError).toBe(true);
      
      const allErrors = await adminUserSearchPage.getAllValidationErrors();
      const hasInvalidMessage = allErrors.some(error => error.toLowerCase().includes('invalid'));
      expect(hasInvalidMessage).toBe(true);
    });

    test('should handle unicode characters in employee name @edge-case', async () => {
      const hasInvalidError = await adminUserSearchPage.testInvalidEmployeeName('Admín Usér');
      expect(hasInvalidError).toBe(true);
      
      const allErrors = await adminUserSearchPage.getAllValidationErrors();
      const hasInvalidMessage = allErrors.some(error => error.toLowerCase().includes('invalid'));
      expect(hasInvalidMessage).toBe(true);
    });

    test('should show error for SQL injection in employee name @validation @security', async () => {
      const hasInvalidError = await adminUserSearchPage.testInvalidEmployeeName('\'; DROP TABLE users; --');
      expect(hasInvalidError).toBe(true);
      
      const allErrors = await adminUserSearchPage.getAllValidationErrors();
      const hasInvalidMessage = allErrors.some(error => error.toLowerCase().includes('invalid'));
      expect(hasInvalidMessage).toBe(true);
    });

    test('should show error for XSS attempt in employee name @validation @security', async () => {
      const hasInvalidError = await adminUserSearchPage.testInvalidEmployeeName('<script>alert("xss")</script>');
      expect(hasInvalidError).toBe(true);
      
      const allErrors = await adminUserSearchPage.getAllValidationErrors();
      const hasInvalidMessage = allErrors.some(error => error.toLowerCase().includes('invalid'));
      expect(hasInvalidMessage).toBe(true);
    });
  });

  test.describe('Dropdown Tests', () => {
    test('should search by valid user role @dropdown @positive', async () => {
      await adminUserSearchPage.searchUsers({ userRole: 'Admin' });
      const hasResults = await adminUserSearchPage.hasSearchResults();
      expect(hasResults).toBe(true);
    });

    test('should search by valid status @dropdown @positive', async () => {
      await adminUserSearchPage.searchUsers({ status: 'Enabled' });
      const hasResults = await adminUserSearchPage.hasSearchResults();
      expect(hasResults).toBe(true);
    });
  });

  test.describe('Combined Search Tests', () => {
    test('should search with all filters combined @combined @positive', async () => {
      const searchResult = await adminUserSearchPage.testCombinedSearch({
        employeeName: 'Admin',
        username: 'admin',
        userRole: 'Admin',
        status: 'Enabled',
      });
      
      expect(searchResult).toBe(true);
    });

    test('should search with partial filters @combined @positive', async () => {
      const searchResult = await adminUserSearchPage.testCombinedSearch({
        employeeName: 'Admin',
        userRole: 'Admin',
      });
      
      expect(searchResult).toBe(true);
    });

    test('should handle invalid combination @combined @negative', async () => {
      await adminUserSearchPage.testCombinedSearch({
        username: 'Admin',
        userRole: 'ESS',
      });
      
      const isDisplayed = await adminUserSearchPage.hasNoRecordsFound();
      expect(isDisplayed).toBe(true);
      
      // Verify toast message contains "No Records Found"
      const toastMessage = await adminUserSearchPage.getNoRecordsFoundMessage();
      expect(toastMessage).toContain('No Records Found');
    });
  });

  test.describe('System Tests', () => {
    test('should reset search criteria with Reset button @system @positive', async () => {
      const resetResult = await adminUserSearchPage.testResetSearchCriteria();
      expect(resetResult).toBe(true);
    });

    test('should search with blank filters @system @positive', async () => {
      const blankSearchResult = await adminUserSearchPage.testBlankFilters();
      expect(blankSearchResult).toBe(true);
    });

    test('should maintain default search state @system @positive', async () => {
      const defaultStateResult = await adminUserSearchPage.testDefaultSearchState();
      expect(defaultStateResult).toBe(true);
    });
  });

  test.describe('Edge Case Tests', () => {
    test.fixme('should handle leading/trailing spaces in username @edge-case @bug-notHandleLeadingSpaces', async () => {
      await adminUserSearchPage.fillUsername('  Admin  ');
      await adminUserSearchPage.clickSearchButton();
      await adminUserSearchPage.waitForSearchResults();
      
      const hasResults = await adminUserSearchPage.hasSearchResults();
      expect(hasResults).toBe(true);
    });

    test('should handle leading/trailing spaces in employee name @edge-case', async () => {
      await adminUserSearchPage.fillEmployeeName('  Admin User  ');
      await adminUserSearchPage.clickSearchButton();
      await adminUserSearchPage.waitForSearchResults();
      
      const hasResults = await adminUserSearchPage.hasSearchResults();
      expect(hasResults).toBe(true);
    });
  });
});
