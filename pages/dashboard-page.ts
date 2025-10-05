import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Dashboard page object model
 */
export class DashboardPage extends BasePage {
  // Page elements
  private readonly welcomeMessage: Locator;
  private readonly userMenu: Locator;
  private readonly logoutButton: Locator;
  private readonly quickLaunchCards: Locator;
  private readonly dashboardTitle: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators for dashboard
    this.welcomeMessage = page.locator('.oxd-userdropdown-name');
    this.userMenu = page.locator('.oxd-userdropdown-tab');
    this.logoutButton = page.locator('a[href*="logout"]');
    this.quickLaunchCards = page.locator('.orangehrm-quick-launch-card');
    this.dashboardTitle = page.locator('.oxd-topbar-header-breadcrumb-module');
  }

  /**
   * Navigate to dashboard
   */
  async navigateToDashboard(): Promise<void> {
    await this.navigateTo('/dashboard');
  }

  /**
   * Wait for dashboard to load
   */
  async waitForDashboardLoad(): Promise<void> {
    await this.waitForElement(this.dashboardTitle);
    // Wait for quick launch cards to be visible and have content
    await this.waitForQuickLaunchCards();
  }

  /**
   * Get welcome message text
   */
  async getWelcomeMessage(): Promise<string> {
    return await this.getText(this.welcomeMessage);
  }

  /**
   * Click user menu
   */
  async clickUserMenu(): Promise<void> {
    await this.clickElement(this.userMenu);
  }

  /**
   * Click logout button
   */
  async clickLogout(): Promise<void> {
    await this.clickElement(this.logoutButton);
  }

  /**
   * Perform logout
   */
  async logout(): Promise<void> {
    await this.clickUserMenu();
    await this.clickLogout();
    await this.page.waitForURL('**/login**', { timeout: 10000 });
  }

  /**
   * Check if dashboard is loaded
   */
  async isDashboardLoaded(): Promise<boolean> {
    const titleVisible = await this.isElementVisible(this.dashboardTitle);
    const cardsVisible = await this.areQuickLaunchCardsVisible();
    const userMenuVisible = await this.isUserMenuVisible();
    
    return titleVisible && cardsVisible && userMenuVisible;
  }

  /**
   * Check if user menu is visible
   */
  async isUserMenuVisible(): Promise<boolean> {
    return await this.isElementVisible(this.userMenu);
  }

  /**
   * Check if quick launch cards are visible
   */
  async areQuickLaunchCardsVisible(): Promise<boolean> {
    const cardElements = await this.quickLaunchCards.all();
    
    if (cardElements.length > 0) {
      return true;
    }
    
    return false;
  }

  /**
   * Wait for quick launch cards to load
   */
  async waitForQuickLaunchCards(): Promise<void> {
    // Wait for at least one card to be visible using first() to avoid strict mode violation
    await this.waitForFirstQuickLaunchCard();
    
    // Then wait for cards to have content
    await this.page.waitForFunction(() => {
      const cards = document.querySelectorAll('.orangehrm-quick-launch-card');
      return cards.length > 0 && Array.from(cards).some(card => 
        card.textContent && card.textContent.trim().length > 0,
      );
    }, { timeout: 10000 });
  }

  /**
   * Wait for at least one quick launch card to be visible
   */
  async waitForFirstQuickLaunchCard(): Promise<void> {
    await this.waitForElement(this.quickLaunchCards.first());
  }

  /**
   * Check if user is on dashboard page
   */
  async isOnDashboardPage(): Promise<boolean> {
    const currentUrl = this.getCurrentUrl();
    return currentUrl.includes('/dashboard');
  }

  /**
   * Wait for page to load completely
   */
  override async waitForPageLoad(): Promise<void> {
    await this.waitForDashboardLoad();
  }

  /**
   * Take screenshot of dashboard
   */
  async takeDashboardScreenshot(): Promise<void> {
    await this.takeScreenshot('dashboard');
  }
}
