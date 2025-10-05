import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export abstract class BaseSearchPage extends BasePage {
  protected readonly searchButton: Locator;
  protected readonly resetButton: Locator;
  protected readonly searchPanel: Locator;
  protected readonly toggleButton: Locator;
  protected readonly searchResults: Locator;
  protected readonly noRecordsFound: Locator;
  protected readonly toastMessage: Locator;
  protected readonly searchResultsTable: Locator;

  constructor(page: Page) {
    super(page);
    this.searchButton = page.locator('button[type="submit"]:has-text("Search")');
    this.resetButton = page.locator('button[type="button"]:has-text("Reset")');
    this.searchPanel = page.locator('.oxd-table-filter-area');
    this.toggleButton = page.locator('.oxd-main-menu-button');
    this.searchResults = page.locator('.oxd-table-body');
    this.noRecordsFound = page.locator('span.oxd-text.oxd-text--span:has-text("No Records Found")');
    this.toastMessage = page.locator('.oxd-toast-content--error, .oxd-text--toast-message');
    this.searchResultsTable = page.locator('.oxd-table-body');
  }

  async toggleSearchPanel(): Promise<void> {
    const toggleButton = this.page.locator('.oxd-table-filter-area-toggle');
    if (await toggleButton.isVisible()) {
      await this.clickElement(toggleButton);
    }
  }

  /**
   * Check if search panel is visible
   * Panel is visible when: no style attribute OR style doesn't contain "display:none"
   */
  async isSearchPanelVisible(): Promise<boolean> {
    const panelElement = this.page.locator('.oxd-table-filter-area');
    
    try {
      if (await panelElement.count() === 0) return false;
      
      const style = await panelElement.getAttribute('style');
      if (!style) return true;
      
      return !style.toLowerCase().includes('display:none');
    } catch {
      return false;
    }
  }

  async clickSearchButton(): Promise<void> {
    await this.clickElement(this.searchButton);
  }

  async clickResetButton(): Promise<void> {
    await this.clickElement(this.resetButton);
  }

  async waitForSearchResults(): Promise<void> {
    const hasResults = await this.hasSearchResults();
    const hasNoRecords = await this.hasNoRecordsFound();
    
    if (hasResults || hasNoRecords) {
      return;
    }
    
    try {
      // Wait for any search results table or "No Records Found" message
      await Promise.race([
        this.waitForElement(this.searchResults, 3000),
        this.waitForElement(this.noRecordsFound, 3000),
      ]);
    } catch {
      console.log('Search results not found');
    }
  }

  /**
   * Check if search results are visible
   */
  async hasSearchResults(): Promise<boolean> {
    return await this.isElementVisible(this.searchResults) && 
           !(await this.isElementVisible(this.noRecordsFound));
  }

  /**
   * Check if "No Records Found" is displayed
   */
  async hasNoRecordsFound(): Promise<boolean> {
    // Check search results for "No Records Found"
    const hasNoRecordsInResults = await this.noRecordsFound.isVisible();
    
    // Check toast message for "No Records Found"
    const toastMessage = await this.getToastMessage();
    const hasNoRecordsInToast = toastMessage.toLowerCase().includes('no records found');
    
    return hasNoRecordsInResults || hasNoRecordsInToast;
  }

  /**
   * Get toast message text
   */
  async getToastMessage(): Promise<string> {
    if (await this.isToastVisible()) {
      return await this.toastMessage.textContent() || '';
    }
    return '';
  }

  /**
   * Check if toast is visible
   */
  async isToastVisible(): Promise<boolean> {
    try {
      return await this.toastMessage.isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  }

  /**
   * Wait for toast to appear
   */
  async waitForToast(): Promise<void> {
    await this.waitForElement(this.toastMessage);
  }

  /**
   * Get search results count
   */
  async getSearchResultsCount(): Promise<number> {
    if (await this.isElementVisible(this.noRecordsFound)) {
      return 0;
    }
    
    const resultRows = this.searchResults.locator('.oxd-table-row');
    return await resultRows.count();
  }

  /**
   * Fill text input field
   */
  async fillTextInput(fieldName: string, value: string): Promise<void> {
    const input = this.page.locator(`//label[normalize-space()='${fieldName}']/ancestor::div[contains(@class,'oxd-input-group')]//input`);
    await this.fillInput(input, value);
  }

  /**
   * Fill smart text input (autocomplete)
   */
  async fillSmartTextInput(fieldName: string, value: string): Promise<void> {
    const input = this.page.locator(`//label[normalize-space()='${fieldName}']/ancestor::div[contains(@class,'oxd-input-group')]//input`);
    await this.fillInput(input, value);
    
    // Wait for autocomplete suggestions and select first match
    const suggestion = this.page.locator('.oxd-autocomplete-option').first();
    if (await suggestion.isVisible({ timeout: 3000 })) {
      await this.clickElement(suggestion);
    }
  }

  /**
   * Select dropdown option
   */
  async selectDropdownOption(fieldName: string, optionValue: string): Promise<void> {
    const dropdown = this.page.locator(`//label[normalize-space()='${fieldName}']/ancestor::div[contains(@class,'oxd-input-group')]//div[contains(@class,'oxd-select-text-input')]`);
    await this.clickElement(dropdown);
    
    const option = this.page.locator(`//label[normalize-space()='${fieldName}']/ancestor::div[contains(@class,'oxd-input-group')]//div[contains(@class,'oxd-select-text-input')]//following::div[contains(@class,'oxd-select-option')][normalize-space()='${optionValue}']`);
    await this.clickElement(option);
  }

  /**
   * Select radio button option
   */
  async selectRadioOption(fieldName: string, optionValue: string): Promise<void> {
    const radio = this.page.locator(`input[name="${fieldName}"][value="${optionValue}"]`);
    await this.clickElement(radio);
  }

  /**
   * Toggle boolean switch
   */
  async toggleBooleanSwitch(fieldName: string, enabled: boolean): Promise<void> {
    const switchElement = this.page.locator(`//p[normalize-space()='${fieldName}']/following::input[@type='checkbox'][1]`);
    const isCurrentlyEnabled = await switchElement.isChecked();
    
    if (isCurrentlyEnabled !== enabled) {
      await this.clickElement(switchElement);
    }
  }

  /**
   * Fill date range inputs
   */
  async fillDateRange(fromFieldName: string, toFieldName: string, fromDate: string, toDate: string): Promise<void> {
    await this.fillTextInput(fromFieldName, fromDate);
    await this.fillTextInput(toFieldName, toDate);
  }

  /**
   * Clear all search fields
   */
  async clearAllSearchFields(): Promise<void> {
    const inputs = this.page.locator('input[type="text"], input[type="date"], textarea');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      await inputs.nth(i).clear();
    }
  }

  /**
   * Get field error message
   */
  async getFieldErrorMessage(fieldName: string): Promise<string> {
    const errorElement = this.page.locator(`//label[normalize-space()='${fieldName}']/ancestor::div[contains(@class,'oxd-input-group')]/span[contains(@class,'oxd-input-field-error-message')]`);
    if (await errorElement.isVisible()) {
      return await errorElement.textContent() || '';
    }
    return '';
  }

  /**
   * Check if field has error
   */
  async hasFieldError(fieldName: string): Promise<boolean> {
    const errorElement = this.page.locator(`//label[normalize-space()='${fieldName}']/ancestor::div[contains(@class,'oxd-input-group')]/span[contains(@class,'oxd-input-field-error-message')]`);
    const isVisible = await errorElement.isVisible();
    return isVisible;
  }

  /**
   * Get value of a text input field
   */
  async getTextInputValue(fieldName: string): Promise<string> {
    const input = this.page.locator(`input[placeholder*="${fieldName}"], input[name="${fieldName.toLowerCase()}"]`);
    return await input.inputValue();
  }

  /**
   * Perform search with given criteria
   */
  async performSearch(searchCriteria: Record<string, string | boolean>): Promise<void> {
    for (const [fieldName, value] of Object.entries(searchCriteria)) {
      if (typeof value === 'string') {
        await this.fillTextInput(fieldName, value);
      } else if (typeof value === 'boolean') {
        await this.toggleBooleanSwitch(fieldName, value);
      }
    }
    
    await this.clickSearchButton();
    await this.waitForSearchResults();
  }

  /**
   * Reset search criteria
   */
  async resetSearchCriteria(): Promise<void> {
    await this.clickResetButton();
    await this.page.waitForTimeout(1000); // Wait for reset to complete
  }

  /**
   * Verify search panel is in default state
   */
  async verifyDefaultSearchState(): Promise<boolean> {
    // Check if all text inputs are empty
    const textInputs = this.page.locator('input[type="text"]');
    const inputCount = await textInputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const value = await textInputs.nth(i).inputValue();
      if (value.trim() !== '') {
        return false;
      }
    }
    
    return true;
  }
}
