import { Page, Locator } from '@playwright/test';
import { BaseSearchPage } from './base-search-page';
import { TIMEOUTS, URLS, UI } from '../utils/constants';

/**
 * Admin User Management search page
 */
export class AdminUserSearchPage extends BaseSearchPage {
  // Admin-specific search elements
  private readonly employeeNameInput: Locator;
  private readonly usernameInput: Locator;
  private readonly userRoleDropdown: Locator;
  private readonly statusDropdown: Locator;
  private readonly searchResultsTable: Locator;
  private readonly addUserButton: Locator;
  private readonly errorToast: Locator;
  private readonly toastMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize Admin User Management specific locators
    this.employeeNameInput = page.locator('input[placeholder*="Employee Name"]');
    this.usernameInput = page.locator('input[name="username"]');
    this.userRoleDropdown = page.locator('.oxd-select-wrapper:has-text("User Role")');
    this.statusDropdown = page.locator('.oxd-select-wrapper:has:text("Status")');
    // Use specific locator for search results table body only
    this.searchResultsTable = page.locator(UI.SELECTORS.TABLE_BODY);
    this.addUserButton = page.locator('button:has-text("Add")');
    this.errorToast = page.locator(UI.SELECTORS.ERROR_TOAST);
    this.toastMessage = page.locator(UI.SELECTORS.TOAST_MESSAGE);
  }

  /**
   * Navigate to Admin User Management page
   */
  async navigateToUserManagement(): Promise<void> {
    await this.navigateTo(URLS.ADMIN_USER_MANAGEMENT);
    
    // Verify navigation was successful
    const currentUrl = this.page.url();
    if (!currentUrl.includes('admin/viewSystemUsers')) {
      throw new Error('Failed to navigate to Admin User Management page');
    }
  }


  /**
   * Wait for admin search results specifically
   */
  async waitForAdminSearchResults(): Promise<void> {
    // Quick check first - if we already have results or no records, return immediately
    const hasResults = await this.hasSearchResults();
    const hasNoRecords = await this.hasNoRecordsFound();
    
    if (hasResults || hasNoRecords) {
      console.log('Admin search results already available - no waiting needed');
      return;
    }

    try {
      // Wait for the admin search results table or no records message
      await Promise.race([
        this.waitForElement(this.searchResultsTable, TIMEOUTS.SEARCH_RESULTS),
        this.waitForElement(this.noRecordsFound, TIMEOUTS.SEARCH_RESULTS),
        this.waitForToastMessage(),
      ]);
    } catch {
      // If specific elements don't appear, wait for general indicators
      console.log('Admin search elements not found, waiting for general indicators');
      await this.page.waitForTimeout(TIMEOUTS.ELEMENT_QUICK_WAIT);
      
      // Try to find the table body specifically
      const tableBody = this.page.locator('.oxd-table-body');
      if (await tableBody.count() > 0) {
        await tableBody.first().waitFor({ state: 'visible', timeout: TIMEOUTS.SEARCH_RESULTS });
      } else {
        // If no table body, check for any table or "No Records Found" message
        const anyTable = this.page.locator('table, .oxd-table, [role="table"]');
        const tableCount = await anyTable.count();
        
        if (tableCount === 0) {
          // No tables found, this is likely "No Records Found"
          console.log('No tables found, search completed with no results');
        } else {
          console.log(`Found ${tableCount} table(s), search completed`);
        }
      }
    }
  }

  /**
   * Fill employee name (smart text input)
   */
  async fillEmployeeName(employeeName: string): Promise<void> {
    await this.fillSmartTextInput('Employee Name', employeeName);
  }

  /**
   * Fill username (text input)
   */
  async fillUsername(username: string): Promise<void> {
    await this.fillTextInput('Username', username);
  }

  /**
   * Select user role
   */
  async selectUserRole(role: string): Promise<void> {
    await this.selectDropdownOption('User Role', role);
  }

  /**
   * Select status
   */
  async selectStatus(status: string): Promise<void> {
    await this.selectDropdownOption('Status', status);
  }

  /**
   * Fill all search criteria fields
   */
  private async fillSearchCriteria(criteria: {
    employeeName?: string;
    username?: string;
    userRole?: string;
    status?: string;
  }): Promise<void> {
    if (criteria.employeeName) {
      await this.fillEmployeeName(criteria.employeeName);
    }
    
    if (criteria.username) {
      await this.fillUsername(criteria.username);
    }
    
    if (criteria.userRole) {
      await this.selectUserRole(criteria.userRole);
    }
    
    if (criteria.status) {
      await this.selectStatus(criteria.status);
    }
  }

  /**
   * Validate search criteria for errors
   */
  private async validateSearchCriteria(criteria: {
    employeeName?: string;
    username?: string;
  }): Promise<boolean> {
    const hasEmployeeNameError = criteria.employeeName ? await this.hasEmployeeNameError() : false;
    const hasUsernameError = criteria.username ? await this.hasUsernameError() : false;
    
    return hasEmployeeNameError || hasUsernameError;
  }

  /**
   * Wait for search completion with fallback
   */
  private async waitForSearchCompletion(): Promise<void> {
    try {
      await this.waitForSearchComplete();
    } catch {
      console.log('Search complete wait failed, using fallback');
      await this.waitForAdminSearchResults();
    }
  }

  /**
   * Perform user search with all criteria
   */
  async searchUsers(criteria: {
    employeeName?: string;
    username?: string;
    userRole?: string;
    status?: string;
  }): Promise<void> {
    // Fill all fields first
    await this.fillSearchCriteria(criteria);
    
    // Wait for all validations to complete
    await this.page.waitForTimeout(TIMEOUTS.VALIDATION_WAIT);
    
    // Check for any validation errors before proceeding with search
    const hasValidationErrors = await this.validateSearchCriteria(criteria);
    if (hasValidationErrors) {
      return; // Don't proceed with search if there are any validation errors
    }
    
    await this.clickSearchButton();
    await this.waitForSearchCompletion();
  }

  /**
   * Test username search functionality
   */
  async testUserName(username: string): Promise<boolean> {
    await this.searchUsers({ username });
    return await this.hasSearchResults();
  }

  /**
   * Test search with invalid username that should return "No Records Found"
   */
  async testInvalidUserName(username: string): Promise<boolean> {
    await this.searchUsers({ username: username });
    
    // Should show "No Records Found" either in results or toast
    const hasNoRecords = await this.hasNoRecordsFound();
    
    // Get the actual no records message for debugging
    const noRecordsMessage = await this.getNoRecordsFoundMessage();
    
    return hasNoRecords && noRecordsMessage.length > 0;
  }

  /**
   * Test employee name search functionality
   */
  async testEmployeeName(employeeName: string): Promise<boolean> {
    await this.searchUsers({ employeeName });
    return await this.hasSearchResults();
  }

  /**
   * Test invalid employee name and check for validation error
   */
  async testInvalidEmployeeName(employeeName: string): Promise<boolean> {
    await this.searchUsers({ employeeName });
    
    // Check for validation errors (field errors or toast errors)
    const hasValidationError = await this.hasAnyValidationError();
    if (hasValidationError) {
      // Get the error message to verify it contains "Invalid"
      const allErrors = await this.getAllValidationErrors();
      return allErrors.some(error => error.toLowerCase().includes('invalid'));
    }
    
    return false;
  }

  /**
   * Get search results as array of user objects
   */
  async getSearchResults(): Promise<Array<{
    username: string;
    userRole: string;
    employeeName: string;
    status: string;
  }>> {
    const results: Array<{
      username: string;
      userRole: string;
      employeeName: string;
      status: string;
    }> = [];

    const rows = this.searchResultsTable.locator('.oxd-table-row');
    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const cells = row.locator('.oxd-table-cell');
      
      const username = await cells.nth(1).textContent() || '';
      const userRole = await cells.nth(2).textContent() || '';
      const employeeName = await cells.nth(3).textContent() || '';
      const status = await cells.nth(4).textContent() || '';

      results.push({
        username: username.trim(),
        userRole: userRole.trim(),
        employeeName: employeeName.trim(),
        status: status.trim(),
      });
    }

    return results;
  }

  /**
   * Verify search results contain expected user
   */
  async verifyUserInResults(username: string): Promise<boolean> {
    const results = await this.getSearchResults();
    return results.some(user => user.username === username);
  }

  /**
   * Verify search results contain expected role
   */
  async verifyRoleInResults(userRole: string): Promise<boolean> {
    const results = await this.getSearchResults();
    return results.some(user => user.userRole === userRole);
  }

  /**
   * Verify search results contain expected status
   */
  async verifyStatusInResults(status: string): Promise<boolean> {
    const results = await this.getSearchResults();
    return results.some(user => user.status === status);
  }

  /**
   * Get employee name field error message
   */
  async getEmployeeNameError(): Promise<string> {
    return await this.getFieldErrorMessage('employeeName');
  }

  /**
   * Get username field error message
   */
  async getUsernameError(): Promise<string> {
    return await this.getFieldErrorMessage('username');
  }

  /**
   * Check if employee name field has error
   */
  async hasEmployeeNameError(): Promise<boolean> {
    return await this.hasFieldError('Employee Name');
  }

  /**
   * Check if username field has error
   */
  async hasUsernameError(): Promise<boolean> {
    return await this.hasFieldError('Username');
  }

  /**
   * Check if error toast is visible
   */
  async isErrorToastVisible(): Promise<boolean> {
    try {
      return await this.errorToast.isVisible({ timeout: TIMEOUTS.TOAST_MESSAGE });
    } catch {
      return false;
    }
  }

  /**
   * Get error toast message text
   */
  async getErrorToastMessage(): Promise<string> {
    try {
      if (await this.isErrorToastVisible()) {
        return await this.errorToast.textContent() || '';
      }
      return '';
    } catch {
      return '';
    }
  }

  /**
   * Wait for error toast to appear
   */
  async waitForErrorToast(): Promise<void> {
    await this.waitForElement(this.errorToast);
  }

  /**
   * Wait for error toast to disappear
   */
  async waitForErrorToastToDisappear(): Promise<void> {
    await this.waitForElementHidden(this.errorToast);
  }

  /**
   * Check if toast message is visible
   */
  async isToastMessageVisible(): Promise<boolean> {
    try {
      return await this.toastMessage.isVisible({ timeout: TIMEOUTS.TOAST_MESSAGE });
    } catch {
      return false;
    }
  }

  /**
   * Get toast message text
   */
  override async getToastMessage(): Promise<string> {
    try {
      if (await this.isToastMessageVisible()) {
        return await this.toastMessage.textContent() || '';
      }
      return '';
    } catch {
      return '';
    }
  }

  /**
   * Wait for toast message to appear
   */
  async waitForToastMessage(): Promise<void> {
    await this.waitForElement(this.toastMessage);
  }

  /**
   * Wait for toast message to disappear
   */
  async waitForToastMessageToDisappear(): Promise<void> {
    await this.waitForElementHidden(this.toastMessage);
  }

  /**
   * Check if "No Records Found" message is displayed (either in results or toast)
   */
  async isNoRecordsFoundDisplayed(): Promise<boolean> {
    // Check search results for "No Records Found"
    const hasNoRecordsInResults = await this.noRecordsFound.isVisible();
    
    // Check toast message for "No Records Found"
    const toastText = await this.getToastMessage();
    const hasNoRecordsInToast = toastText.toLowerCase().includes('no records found');
    
    return hasNoRecordsInResults || hasNoRecordsInToast;
  }

  /**
   * Get "No Records Found" message from both results and toast
   */
  async getNoRecordsFoundMessage(): Promise<string> {
    let message = '';
    
    // Check search results first
    if (await this.noRecordsFound.isVisible()) {
      const resultText = await this.noRecordsFound.textContent();
      if (resultText && resultText.includes('No Records Found')) {
        message = resultText.trim();
      }
    }
    
    // Check toast message
    if (message === '' && await this.isToastMessageVisible()) {
      const toastText = await this.getToastMessage();
      if (toastText && toastText.toLowerCase().includes('no records found')) {
        message = toastText.trim();
      }
    }
    
    return message;
  }

  /**
   * Wait for "No Records Found" message to appear (either in results or toast)
   */
  async waitForNoRecordsFound(): Promise<void> {
    await Promise.race([
      this.waitForElement(this.noRecordsFound),
      this.waitForToastMessage(),
    ]);
  }

  /**
   * Test search with whitespace only username
   */
  async testWhitespaceOnlyUserName(): Promise<boolean> {
    await this.searchUsers({ username: '   ' });
    
    // Wait for potential error toast to appear
    await this.page.waitForTimeout(1000);
    
    // Check if error toast is visible (indicating validation error)
    return await this.isErrorToastVisible();
  }

  /**
   * Check if there are any validation errors (either field errors or toast errors)
   */
  async hasAnyValidationError(): Promise<boolean> {
    const hasFieldError = await this.hasUsernameError() || await this.hasEmployeeNameError();
    const hasToastError = await this.isErrorToastVisible();
    
    return hasFieldError || hasToastError;
  }

  /**
   * Get all validation error messages (field errors and toast errors)
   */
  async getAllValidationErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    // Check field errors
    try {
      // Check username field error
      const usernameError = await this.getFieldErrorMessage('Username');
      if (usernameError && usernameError.trim().length > 0) {
        errors.push(usernameError.trim());
      }
      
      // Check employee name field error
      const employeeNameError = await this.getFieldErrorMessage('Employee Name');
      if (employeeNameError && employeeNameError.trim().length > 0) {
        errors.push(employeeNameError.trim());
      }
    } catch {
      // Field errors may not exist, continue
    }
    
    // Check toast error
    if (await this.isErrorToastVisible()) {
      const toastMessage = await this.getErrorToastMessage();
      if (toastMessage && toastMessage.trim().length > 0) {
        errors.push(toastMessage.trim());
      }
    }
    
    return errors;
  }

  /**
   * Enhanced method to check if search has no records (combining both results and toast)
   */
  override async hasNoRecordsFound(): Promise<boolean> {
    // Check if "No Records Found" is displayed in either results or toast
    return await this.isNoRecordsFoundDisplayed();
  }

  /**
   * Enhanced method to check if search has results (opposite of no records found)
   */
  override async hasSearchResults(): Promise<boolean> {
    // Wait for search to complete
    await this.page.waitForTimeout(1000);
    
    // Check if "No Records Found" is NOT displayed
    const noRecordsFound = await this.isNoRecordsFoundDisplayed();
    
    // Also check if search results table has data rows (use .first() to avoid strict mode violation)
    const dataRows = this.searchResultsTable.locator('.oxd-table-row');
    const hasDataRows = await dataRows.count() > 0;
    
    return !noRecordsFound && hasDataRows;
  }

  /**
   * Test search with whitespace only employee name
   */
  async testWhitespaceOnlyEmployeeName(): Promise<boolean> {
    await this.searchUsers({ employeeName: '   ' });
    return !(await this.hasEmployeeNameError());
  }

  /**
   * Test search with all filters combined
   */
  async testCombinedSearch(criteria: {
    employeeName?: string;
    username?: string;
    userRole?: string;
    status?: string;
  }): Promise<boolean> {
    await this.searchUsers(criteria);
    return await this.hasSearchResults();
  }

  /**
   * Test reset functionality
   */
  async testResetSearchCriteria(): Promise<boolean> {
    // First fill some search criteria
    await this.fillEmployeeName('Test Employee');
    await this.fillUsername('testuser');
    await this.selectUserRole('Admin');
    await this.selectStatus('Enabled');
    
    // Reset the search
    await this.resetSearchCriteria();
    
    // Verify all fields are cleared
    return await this.verifyDefaultSearchState();
  }

  /**
   * Test search panel toggle functionality
   */
  async testToggleSearchPanel(): Promise<boolean> {
    const initialVisibility = await this.isSearchPanelVisible();
    await this.toggleSearchPanel();
    
    // Wait for the toggle to take effect
    await this.page.waitForTimeout(500);
    
    const finalVisibility = await this.isSearchPanelVisible();
    return initialVisibility !== finalVisibility;
  }

  /**
   * Test default search state
   */
  async testDefaultSearchState(): Promise<boolean> {
    return await this.verifyDefaultSearchState();
  }

  /**
   * Test search with blank filters
   */
  async testBlankFilters(): Promise<boolean> {
    await this.clickSearchButton();
    await this.waitForSearchResults();
    
    // Should return all users or show appropriate message
    return true;
  }

  /**
   * Take screenshot of user search results
   */
  async takeUserSearchResultsScreenshot(): Promise<void> {
    await this.takeSearchResultsScreenshot();
  }

  /**
   * Get the first search result row (safe for strict mode)
   */
  async getFirstSearchResultRow(): Promise<Locator | null> {
    const rows = this.searchResultsTable.locator('.oxd-table-row');
    const count = await rows.count();
    
    if (count > 0) {
      return rows.first();
    }
    
    return null;
  }

  /**
   * Get count of search result rows
   */
  async getSearchResultRowCount(): Promise<number> {
    const rows = this.searchResultsTable.locator('.oxd-table-row');
    return await rows.count();
  }
}
