import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import { TIMEOUTS, UI } from '../utils/constants';

/**
 * Base search page class that provides common search functionality
 * for all module search pages
 */
export abstract class BaseSearchPage extends BasePage {
  // Common search elements
  protected readonly searchButton: Locator;
  protected readonly resetButton: Locator;
  protected readonly searchPanel: Locator;
  protected readonly toggleButton: Locator;
  protected readonly searchResults: Locator;
  protected readonly noRecordsFound: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize common search locators
    this.searchButton = page.locator('button[type="submit"]:has-text("Search")');
    this.resetButton = page.locator('button[type="button"]:has-text("Reset")');
    this.searchPanel = page.locator('.oxd-table-filter-area');
    this.toggleButton = page.locator('.oxd-main-menu-button');
    // Use more specific locator for search results - prioritize table body over table wrapper
    this.searchResults = page.locator(UI.SELECTORS.TABLE_BODY);
    this.noRecordsFound = page.locator('.oxd-table-body .oxd-table-cell:has-text("No Records Found")');
  }

  /**
   * Toggle search panel visibility
   */
  async toggleSearchPanel(): Promise<void> {
    const toggleButton = this.page.locator('.oxd-table-filter-area-toggle');
    if (await toggleButton.isVisible()) {
      await this.clickElement(toggleButton);
    }
  }

  /**
   * Show search panel
   */
  async showSearchPanel(): Promise<void> {
    const toggleButton = this.page.locator('.oxd-table-filter-area-toggle');
    if (await this.isSearchPanelHidden()) {
      await this.clickElement(toggleButton);
    }
  }

  /**
   * Hide search panel
   */
  async hideSearchPanel(): Promise<void> {
    const toggleButton = this.page.locator('.oxd-table-filter-area-toggle');
    if (await this.isSearchPanelVisible()) {
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
      // Check if element exists
      const isPresent = await panelElement.count() > 0;
      if (!isPresent) return false;
      
      // Get the style attribute
      const style = await panelElement.getAttribute('style');
      
      // Panel is visible when:
      // 1. No style attribute exists (null/undefined)
      // 2. Style attribute exists but doesn't contain "display:none"
      if (!style) {
        return true; // No style attribute = visible
      }
      
      // Check if style contains display:none (case insensitive)
      const hasDisplayNone = style.toLowerCase().includes('display:none') || 
                           style.toLowerCase().includes('display: none');
      
      return !hasDisplayNone; // Visible if no display:none
    } catch (error) {
      console.log('Error checking search panel visibility:', error);
      return false;
    }
  }

  /**
   * Check if search panel is hidden
   * Panel is hidden when: style attribute contains "display:none"
   */
  async isSearchPanelHidden(): Promise<boolean> {
    const panelElement = this.page.locator('.oxd-table-filter-area');
    
    try {
      // Check if element doesn't exist
      const count = await panelElement.count();
      if (count === 0) return true;
      
      // Get the style attribute
      const style = await panelElement.getAttribute('style');
      
      // Panel is hidden when style contains "display:none"
      if (!style) {
        return false; // No style attribute = visible (not hidden)
      }
      
      // Check if style contains display:none (case insensitive)
      const hasDisplayNone = style.toLowerCase().includes('display:none') || 
                           style.toLowerCase().includes('display: none');
      
      return hasDisplayNone; // Hidden if contains display:none
    } catch (error) {
      console.log('Error checking search panel hidden state:', error);
      return true; // Assume hidden on error
    }
  }

  /**
   * Wait for search panel to be visible
   */
  async waitForSearchPanelVisible(): Promise<void> {
    await this.page.waitForFunction(() => {
      const panel = document.querySelector('.oxd-table-filter-area');
      if (!panel) return false;
      
      const style = panel.getAttribute('style');
      // Panel is visible when no style attribute OR style doesn't contain display:none
      return !style || (!style.toLowerCase().includes('display:none') && !style.toLowerCase().includes('display: none'));
    }, { timeout: TIMEOUTS.ELEMENT_WAIT });
  }

  /**
   * Wait for search panel to be hidden
   */
  async waitForSearchPanelHidden(): Promise<void> {
    await this.page.waitForFunction(() => {
      const panel = document.querySelector('.oxd-table-filter-area');
      if (!panel) return true;
      
      const style = panel.getAttribute('style');
      // Panel is hidden when style contains display:none
      return style && (style.toLowerCase().includes('display:none') || style.toLowerCase().includes('display: none'));
    }, { timeout: TIMEOUTS.ELEMENT_WAIT });
  }

  /**
   * Click search button
   */
  async clickSearchButton(): Promise<void> {
    await this.clickElement(this.searchButton);
  }

  /**
   * Click reset button
   */
  async clickResetButton(): Promise<void> {
    await this.clickElement(this.resetButton);
  }

  /**
   * Wait for search results to load
   */
  async waitForSearchResults(): Promise<void> {
    // Quick check first - if we already have results or no records, return immediately
    const hasResults = await this.hasSearchResults();
    const hasNoRecords = await this.hasNoRecordsFound();
    
    if (hasResults || hasNoRecords) {
      console.log('Search results already available - no waiting needed');
      return;
    }
    
    try {
      // Wait for any search results table or "No Records Found" message
      await Promise.race([
        this.waitForElement(this.searchResults, TIMEOUTS.SEARCH_RESULTS),
        this.waitForElement(this.noRecordsFound, TIMEOUTS.SEARCH_RESULTS),
      ]);
    } catch {
      console.log('Search results not found');
    }
  }

  /**
   * Wait for search to complete (alternative method)
   */
  async waitForSearchComplete(): Promise<void> {
    // First, quickly check if we already have results or "No Records Found"
    const hasResults = await this.hasSearchResults();
    const hasNoRecords = await this.hasNoRecordsFound();
    
    if (hasResults || hasNoRecords) {
      return;
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
    try {
      const toastMessage = this.page.locator('.oxd-text--toast-message');
      if (await toastMessage.isVisible({ timeout: TIMEOUTS.ELEMENT_QUICK_WAIT })) {
        return await toastMessage.textContent() || '';
      }
      return '';
    } catch {
      return '';
    }
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
    if (await suggestion.isVisible({ timeout: TIMEOUTS.SEARCH_RESULTS })) {
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
    await this.page.waitForTimeout(TIMEOUTS.ELEMENT_QUICK_WAIT); // Wait for reset to complete
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

  /**
   * Take screenshot of search panel
   */
  async takeSearchPanelScreenshot(): Promise<void> {
    await this.takeScreenshot('search-panel');
  }

  /**
   * Take screenshot of search results
   */
  async takeSearchResultsScreenshot(): Promise<void> {
    await this.takeScreenshot('search-results');
  }
}
