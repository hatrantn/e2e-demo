import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Login page object model
 */
export class LoginPage extends BasePage {
  // Page elements
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly errorMessage: Locator;
  private readonly fieldErrorMessage: Locator;
  private readonly loginForm: Locator;
  private readonly logo: Locator;
  private readonly socialLoginButtons: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators for login page
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.forgotPasswordLink = page.locator('a[href*="forgotPassword"]');
    this.errorMessage = page.locator('.oxd-alert-content-text');
    this.fieldErrorMessage = page.locator('.oxd-input-field-error-message');
    this.loginForm = page.locator('.orangehrm-login-form');
    this.logo = page.locator('.orangehrm-login-branding img');
    this.socialLoginButtons = page.locator('.orangehrm-login-social');
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    await this.navigateTo('/');
  }

  /**
   * Fill username field
   */
  async fillUsername(username: string): Promise<void> {
    await this.fillInput(this.usernameInput, username);
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string): Promise<void> {
    await this.fillInput(this.passwordInput, password);
  }

  /**
   * Click login button
   */
  async clickLoginButton(): Promise<void> {
    await this.clickElement(this.loginButton);
  }

  /**
   * Perform login with credentials
   */
  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }

  /**
   * Check if error message is visible
   */
  async isErrorMessageVisible(): Promise<boolean> {
    // Check for either general error message or field error message
    return await this.isElementVisible(this.errorMessage) || 
           await this.isFieldErrorMessageVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    // Try to get general error message first
    if (await this.isElementVisible(this.errorMessage)) {
      return await this.getText(this.errorMessage);
    } 
    
    // Then try to get field error messages
    const fieldErrors = await this.getFieldErrorMessages();
    if (fieldErrors.length > 0) {
      return fieldErrors[0] || ''; // Return the first field error message
    }
    
    return '';
  }

  /**
   * Get all field error messages
   */
  async getFieldErrorMessages(): Promise<string[]> {
    const errorElements = await this.fieldErrorMessage.all();
    const errorMessages: string[] = [];
    
    for (const element of errorElements) {
      if (await element.isVisible()) {
        const text = await element.textContent();
        if (text && text.trim().length > 0) {
          errorMessages.push(text.trim());
        }
      }
    }
    
    return errorMessages;
  }

  /**
   * Check if any field error message is visible
   */
  async isFieldErrorMessageVisible(): Promise<boolean> {
    const errorElements = await this.fieldErrorMessage.all();
    
    for (const element of errorElements) {
      if (await element.isVisible()) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get username field error message
   */
  async getUsernameFieldErrorMessage(): Promise<string> {
    const usernameError = this.page.locator('input[name="username"] + .oxd-input-field-error-message');
    if (await usernameError.isVisible()) {
      return await usernameError.textContent() || '';
    }
    return '';
  }

  /**
   * Get password field error message
   */
  async getPasswordFieldErrorMessage(): Promise<string> {
    const passwordError = this.page.locator('input[name="password"] + .oxd-input-field-error-message');
    if (await passwordError.isVisible()) {
      return await passwordError.textContent() || '';
    }
    return '';
  }

  /**
   * Check if username field has error
   */
  async isUsernameFieldErrorVisible(): Promise<boolean> {
    const usernameError = this.page.locator('input[name="username"] + .oxd-input-field-error-message');
    return await usernameError.isVisible();
  }

  /**
   * Check if password field has error
   */
  async isPasswordFieldErrorVisible(): Promise<boolean> {
    const passwordError = this.page.locator('input[name="password"] + .oxd-input-field-error-message');
    return await passwordError.isVisible();
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.clickElement(this.forgotPasswordLink);
  }

  /**
   * Wait for login form to be visible
   */
  async waitForLoginForm(): Promise<void> {
    await this.waitForElement(this.loginForm);
    await this.waitForElement(this.usernameInput);
    await this.waitForElement(this.passwordInput);
    await this.waitForElement(this.loginButton);
  }

  /**
   * Wait for successful login redirect
   */
  async waitForLoginSuccess(): Promise<void> {
    await this.page.waitForURL('**/dashboard**', { timeout: 10000 });
  }

  /**
   * Wait for login failure
   */
  async waitForLoginFailure(): Promise<void> {
    // Wait for either general error message or field error message
    await Promise.race([
      this.waitForElement(this.errorMessage),
      this.waitForFieldErrorMessage(),
    ]);
  }

  /**
   * Wait for field error message to appear
   */
  async waitForFieldErrorMessage(): Promise<void> {
    await this.page.waitForFunction(() => {
      const errorElements = document.querySelectorAll('.oxd-input-field-error-message');
      return Array.from(errorElements).some(element => 
        element.textContent && element.textContent.trim().length > 0,
      );
    }, { timeout: 10000 });
  }

  /**
   * Check if login form is visible
   */
  async isLoginFormVisible(): Promise<boolean> {
    return await this.isElementVisible(this.loginForm) && 
           await this.isElementVisible(this.usernameInput) && 
           await this.isElementVisible(this.passwordInput) && 
           await this.isElementVisible(this.loginButton);
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }

  /**
   * Check if login button is disabled
   */
  async isLoginButtonDisabled(): Promise<boolean> {
    return await this.loginButton.isDisabled();
  }

  /**
   * Get username field value
   */
  async getUsernameValue(): Promise<string> {
    return await this.usernameInput.inputValue();
  }

  /**
   * Get password field type attribute
   */
  async getPasswordFieldType(): Promise<string> {
    return await this.passwordInput.getAttribute('type') || '';
  }

  /**
   * Get password field value
   */
  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  /**
   * Clear username field
   */
  async clearUsername(): Promise<void> {
    await this.usernameInput.clear();
  }

  /**
   * Clear password field
   */
  async clearPassword(): Promise<void> {
    await this.passwordInput.clear();
  }

  /**
   * Clear all form fields
   */
  async clearForm(): Promise<void> {
    await this.clearUsername();
    await this.clearPassword();
  }

  /**
   * Check if logo is visible
   */
  async isLogoVisible(): Promise<boolean> {
    return await this.isElementVisible(this.logo);
  }

  /**
   * Check if forgot password link is visible
   */
  async isForgotPasswordVisible(): Promise<boolean> {
    return await this.isElementVisible(this.forgotPasswordLink);
  }

  /**
   * Check if social login buttons are visible
   */
  async areSocialLoginButtonsVisible(): Promise<boolean> {
    return await this.isElementVisible(this.socialLoginButtons);
  }

  /**
   * Validate form fields are required
   */
  async validateRequiredFields(): Promise<{ usernameRequired: boolean; passwordRequired: boolean }> {
    const usernameRequired = await this.usernameInput.getAttribute('required') !== null;
    const passwordRequired = await this.passwordInput.getAttribute('required') !== null;
    
    return { usernameRequired, passwordRequired };
  }

  /**
   * Get form validation messages
   */
  async getFormValidationMessages(): Promise<string[]> {
    const messages: string[] = [];
    
    // Check for HTML5 validation messages
    const usernameValidation = await this.usernameInput.evaluate(el => (el as HTMLInputElement).validationMessage);
    const passwordValidation = await this.passwordInput.evaluate(el => (el as HTMLInputElement).validationMessage);
    
    if (usernameValidation) messages.push(usernameValidation);
    if (passwordValidation) messages.push(passwordValidation);
    
    return messages;
  }

  /**
   * Check if page is loaded completely
   */
  async isPageLoaded(): Promise<boolean> {
    return await this.isElementVisible(this.loginForm) && 
           await this.isElementVisible(this.logo);
  }

  /**
   * Wait for page to load completely
   */
  override async waitForPageLoad(): Promise<void> {
    await this.waitForLoginForm();
    await this.waitForElement(this.logo);
  }

  /**
   * Take screenshot of login form
   */
  async takeLoginFormScreenshot(): Promise<void> {
    await this.takeScreenshot('login-form');
  }

  /**
   * Get page title
   */
  override async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Check if user is redirected to login page
   */
  async isOnLoginPage(): Promise<boolean> {
    const currentUrl = this.getCurrentUrl();
    return currentUrl.includes('/login') || currentUrl.endsWith('/');
  }
}
