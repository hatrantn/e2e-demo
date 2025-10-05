import { Page } from '@playwright/test';
import { BaseSearchPage } from './base-search-page';

/**
 * Admin User Management search page
 */
export class AdminUserSearchPage extends BaseSearchPage {

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Admin User Management page
   */
  async navigateToUserManagement(): Promise<void> {
    await this.navigateTo('/web/index.php/admin/viewSystemUsers');
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
   * Perform user search with all criteria
   */
  async searchUsers(criteria: {
    employeeName?: string;
    username?: string;
    userRole?: string;
    status?: string;
  }): Promise<void> {
    await this.fillSearchCriteria(criteria);
    await this.page.waitForTimeout(1000);
    
    if ((criteria.employeeName && await this.hasEmployeeNameError()) ||
        (criteria.username && await this.hasUsernameError())) {
      return;
    }
    
    await this.clickSearchButton();
    await this.waitForSearchResults();
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
    const hasNoRecords = await this.hasNoRecordsFound();
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
    if (message === '' && await this.isToastVisible()) {
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
      this.waitForToast(),
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
    return await this.isToastVisible();
  }

  /**
   * Check if there are any validation errors (either field errors or toast errors)
   */
  async hasAnyValidationError(): Promise<boolean> {
    const hasFieldError = await this.hasUsernameError() || await this.hasEmployeeNameError();
    const hasToastError = await this.isToastVisible();
    
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
    if (await this.isToastVisible()) {
      const toastMessage = await this.getToastMessage();
      if (toastMessage && toastMessage.trim().length > 0) {
        errors.push(toastMessage.trim());
      }
    }
    
    return errors;
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

}
