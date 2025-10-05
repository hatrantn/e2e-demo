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
  private readonly navigationMenu: Locator;
  private readonly quickLaunchCards: Locator;
  private readonly employeeDistributionChart: Locator;
  private readonly legendItems: Locator;
  private readonly pendingLeaveRequests: Locator;
  private readonly timeAtWork: Locator;
  private readonly myActions: Locator;
  private readonly buzzLatestPosts: Locator;
  private readonly dashboardTitle: Locator;
  private readonly profilePicture: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators for dashboard
    this.welcomeMessage = page.locator('.oxd-userdropdown-name');
    this.userMenu = page.locator('.oxd-userdropdown-tab');
    this.logoutButton = page.locator('a[href*="logout"]');
    this.navigationMenu = page.locator('.oxd-main-menu');
    this.quickLaunchCards = page.locator('.orangehrm-quick-launch-card');
    this.employeeDistributionChart = page.locator('.oxd-chart-container');
    this.legendItems = page.locator('.oxd-chart-legend-item');
    this.pendingLeaveRequests = page.locator('.pending-leave-request');
    this.timeAtWork = page.locator('.time-at-work');
    this.myActions = page.locator('.my-actions');
    this.buzzLatestPosts = page.locator('.buzz-latest-posts');
    this.dashboardTitle = page.locator('.oxd-topbar-header-breadcrumb-module');
    this.profilePicture = page.locator('.oxd-userdropdown-img');
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
   * Navigate to a specific section
   */
  async navigateToSection(section: string): Promise<void> {
    const sectionLink = this.navigationMenu.locator(`a[href*="${section}"]`);
    await this.clickElement(sectionLink);
  }

  /**
   * Click quick launch card
   */
  async clickQuickLaunchCard(cardName: string): Promise<void> {
    const card = this.quickLaunchCards.filter({ hasText: cardName });
    await this.clickElement(card);
  }

  /**
   * Get quick launch cards
   */
  async getQuickLaunchCards(): Promise<string[]> {
    const cardElements = await this.quickLaunchCards.all();
    const cardTexts: string[] = [];
    
    for (const card of cardElements) {
      if (await card.isVisible()) {
        const text = await card.textContent();
        if (text && text.trim().length > 0) {
          cardTexts.push(text.trim());
        }
      }
    }
    
    return cardTexts;
  }

  /**
   * Get employee distribution chart data
   */
  async getEmployeeDistributionData(): Promise<string[]> {
    const legendItems = await this.legendItems.allTextContents();
    return legendItems.map(item => item.trim());
  }

  /**
   * Get pending leave requests count
   */
  async getPendingLeaveRequestsCount(): Promise<number> {
    return await this.getElementCount(this.pendingLeaveRequests);
  }

  /**
   * Get time at work data
   */
  async getTimeAtWorkData(): Promise<string> {
    return await this.getText(this.timeAtWork);
  }

  /**
   * Get my actions data
   */
  async getMyActionsData(): Promise<string[]> {
    return await this.myActions.allTextContents();
  }

  /**
   * Get buzz latest posts
   */
  async getBuzzLatestPosts(): Promise<string[]> {
    return await this.buzzLatestPosts.allTextContents();
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
   * Check if profile picture is visible
   */
  async isProfilePictureVisible(): Promise<boolean> {
    return await this.isElementVisible(this.profilePicture);
  }

  /**
   * Check if navigation menu is visible
   */
  async isNavigationMenuVisible(): Promise<boolean> {
    return await this.isElementVisible(this.navigationMenu);
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
   * Check if employee distribution chart is visible
   */
  async isEmployeeDistributionChartVisible(): Promise<boolean> {
    return await this.isElementVisible(this.employeeDistributionChart);
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
   * Get the first quick launch card (for single element operations)
   */
  async getFirstQuickLaunchCard(): Promise<Locator> {
    return this.quickLaunchCards.first();
  }

  /**
   * Wait for at least one quick launch card to be visible
   */
  async waitForFirstQuickLaunchCard(): Promise<void> {
    await this.waitForElement(this.quickLaunchCards.first());
  }

  /**
   * Verify quick launch cards are properly loaded
   */
  async verifyQuickLaunchCardsLoaded(): Promise<boolean> {
    const cardCount = await this.getQuickLaunchCardsCount();
    const cardsVisible = await this.areQuickLaunchCardsVisible();
    
    // Expect at least 4 cards (typical OrangeHRM dashboard has 6)
    return cardCount >= 4 && cardsVisible;
  }

  /**
   * Get count of quick launch cards
   */
  async getQuickLaunchCardsCount(): Promise<number> {
    const cardElements = await this.quickLaunchCards.all();
    return cardElements.length;
  }

  /**
   * Check if a specific quick launch card is visible
   */
  async isQuickLaunchCardVisible(cardName: string): Promise<boolean> {
    const card = this.quickLaunchCards.filter({ hasText: cardName });
    return await card.isVisible();
  }

  /**
   * Get text content of a specific quick launch card
   */
  async getQuickLaunchCardText(cardName: string): Promise<string> {
    const card = this.quickLaunchCards.filter({ hasText: cardName });
    if (await card.isVisible()) {
      return await card.textContent() || '';
    }
    return '';
  }

  /**
   * Wait for employee distribution chart to load
   */
  async waitForEmployeeDistributionChart(): Promise<void> {
    await this.waitForElement(this.employeeDistributionChart);
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboard(): Promise<void> {
    await this.reload();
    await this.waitForDashboardLoad();
  }

  /**
   * Get navigation menu items
   */
  async getNavigationItems(): Promise<string[]> {
    const items = await this.navigationMenu.locator('a').allTextContents();
    return items.map(item => item.trim());
  }

  /**
   * Check if navigation item is active
   */
  async isNavigationItemActive(item: string): Promise<boolean> {
    const navItem = this.navigationMenu.locator(`a[href*="${item}"]`);
    return await navItem.locator('.oxd-main-menu-item--active').isVisible();
  }

  /**
   * Get dashboard page title
   */
  async getDashboardTitle(): Promise<string> {
    return await this.getText(this.dashboardTitle);
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
    await this.waitForEmployeeDistributionChart();
  }

  /**
   * Take screenshot of dashboard
   */
  async takeDashboardScreenshot(): Promise<void> {
    await this.takeScreenshot('dashboard');
  }

  /**
   * Get user profile information
   */
  async getUserProfileInfo(): Promise<{ name: string; role: string }> {
    const name = await this.getWelcomeMessage();
    // Extract role from user menu or other elements
    const role = await this.userMenu.getAttribute('title') || 'Unknown';
    
    return { name, role };
  }
}
