import { Page, Locator, expect } from '@playwright/test';
import { getBaseUrl } from '../utils/config';
import { TIMEOUTS } from '../utils/constants';

/**
 * Base page class that provides common functionality for all page objects
 */
export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    // Get baseURL from Playwright config via utility
    this.baseUrl = getBaseUrl();
  }

  /**
   * Navigate to a specific URL
   */
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout: number = TIMEOUTS.ELEMENT_WAIT): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(locator: Locator, timeout: number = TIMEOUTS.ELEMENT_WAIT): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Click on an element with retry logic
   */
  async clickElement(locator: Locator, timeout: number = TIMEOUTS.ELEMENT_WAIT): Promise<void> {
    await this.waitForElement(locator, timeout);
    await locator.click();
  }

  /**
   * Fill input field with text
   */
  async fillInput(locator: Locator, text: string, timeout: number = TIMEOUTS.ELEMENT_WAIT): Promise<void> {
    await this.waitForElement(locator, timeout);
    await locator.clear();
    await locator.fill(text);
  }

  /**
   * Get text content from element
   */
  async getText(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    return await locator.textContent() || '';
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT_SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element exists
   */
  async isElementPresent(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'attached', timeout: TIMEOUTS.ELEMENT_SHORT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for text to appear in element
   */
  async waitForText(locator: Locator, text: string, timeout: number = TIMEOUTS.ELEMENT_WAIT): Promise<void> {
    await expect(locator).toContainText(text, { timeout });
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `screenshots/${name}-${Date.now()}.png`,
      fullPage: true, 
    });
  }

  /**
   * Wait for network request to complete
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for specific network response
   */
  async waitForResponse(urlPattern: string | RegExp, timeout: number = TIMEOUTS.NAVIGATION): Promise<import('@playwright/test').Response> {
    return await this.page.waitForResponse(urlPattern, { timeout });
  }

  /**
   * Wait for specific network request
   */
  async waitForRequest(urlPattern: string | RegExp, timeout: number = TIMEOUTS.NAVIGATION): Promise<import('@playwright/test').Request> {
    return await this.page.waitForRequest(urlPattern, { timeout });
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Reload page
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  /**
   * Go forward in browser history
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
    await this.waitForPageLoad();
  }

  /**
   * Execute JavaScript in page context
   */
  async executeScript(script: string): Promise<unknown> {
    return await this.page.evaluate(script);
  }

  /**
   * Add JavaScript to page
   */
  async addInitScript(script: string): Promise<void> {
    await this.page.addInitScript(script);
  }

  /**
   * Handle alerts, confirms, and prompts
   */
  async handleDialog(accept: boolean = true, text?: string): Promise<void> {
    this.page.on('dialog', async dialog => {
      if (text) {
        await dialog.accept(text);
      } else if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Wait for element to have specific attribute value
   */
  async waitForAttribute(locator: Locator, attribute: string, value: string, timeout: number = TIMEOUTS.ELEMENT_WAIT): Promise<void> {
    await expect(locator).toHaveAttribute(attribute, value, { timeout });
  }

  /**
   * Wait for element to have specific CSS class
   */
  async waitForClass(locator: Locator, className: string, timeout: number = TIMEOUTS.ELEMENT_WAIT): Promise<void> {
    await expect(locator).toHaveClass(new RegExp(className), { timeout });
  }

  /**
   * Select option from dropdown
   */
  async selectOption(locator: Locator, value: string | string[]): Promise<void> {
    await this.waitForElement(locator);
    await locator.selectOption(value);
  }

  /**
   * Check checkbox
   */
  async checkCheckbox(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.check();
  }

  /**
   * Uncheck checkbox
   */
  async uncheckCheckbox(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.uncheck();
  }

  /**
   * Hover over element
   */
  async hover(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.hover();
  }

  /**
   * Double click element
   */
  async doubleClick(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.dblclick();
  }

  /**
   * Right click element
   */
  async rightClick(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.click({ button: 'right' });
  }

  /**
   * Drag and drop element
   */
  async dragAndDrop(source: Locator, target: Locator): Promise<void> {
    await this.waitForElement(source);
    await this.waitForElement(target);
    await source.dragTo(target);
  }

  /**
   * Upload file
   */
  async uploadFile(locator: Locator, filePath: string): Promise<void> {
    await this.waitForElement(locator);
    await locator.setInputFiles(filePath);
  }

  /**
   * Wait for element to be enabled
   */
  async waitForEnabled(locator: Locator, timeout: number = TIMEOUTS.ELEMENT_WAIT): Promise<void> {
    await expect(locator).toBeEnabled({ timeout });
  }

  /**
   * Wait for element to be disabled
   */
  async waitForDisabled(locator: Locator, timeout: number = TIMEOUTS.ELEMENT_WAIT): Promise<void> {
    await expect(locator).toBeDisabled({ timeout });
  }

  /**
   * Wait for element to be focused
   */
  async waitForFocused(locator: Locator, timeout: number = TIMEOUTS.ELEMENT_WAIT): Promise<void> {
    await expect(locator).toBeFocused({ timeout });
  }

  /**
   * Get element count
   */
  async getElementCount(locator: Locator): Promise<number> {
    return await locator.count();
  }

  /**
   * Get all text contents from elements
   */
  async getAllTexts(locator: Locator): Promise<string[]> {
    return await locator.allTextContents();
  }

  /**
   * Wait for element to have specific count
   */
  async waitForCount(locator: Locator, count: number, timeout: number = TIMEOUTS.ELEMENT_WAIT): Promise<void> {
    await expect(locator).toHaveCount(count, { timeout });
  }
}
