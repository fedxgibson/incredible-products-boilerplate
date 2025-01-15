// LoginPage.js page object
module.exports = class LoginPage {
  constructor(page) {
    this.page = page;
    this.selectors = {
      emailInput: '[data-test-id="email-input"]',
      passwordInput: '[data-test-id="password-input"]',
      submitButton: '[data-test-id="login-submit"]',
      rememberMeCheckbox: '[data-test-id="remember-me"]',
      forgotPasswordLink: '[data-test-id="forgot-password-link"]',
      registerLink: '[data-test-id="register-link"]',
      notificationMessage: '[data-test-id="notification"]'
    };
  }

  async navigate() {
    await this.page.goto(`${process.env.BASE_URL}/login`);
  }

  async login({ email, password, rememberMe = false }) {
    await this.page.type(this.selectors.emailInput, email);
    await this.page.type(this.selectors.passwordInput, password);
    
    if (rememberMe) {
      await this.page.click(this.selectors.rememberMeCheckbox);
    }
    
    await this.page.click(this.selectors.submitButton);
  }

  async isSubmitButtonDisabled() {
    const button = await this.page.$(this.selectors.submitButton);
    return await button.evaluate(el => el.disabled);
  }

  async getSubmitButtonText() {
    return this.page.$eval(this.selectors.submitButton, el => el.textContent);
  }

  async getNotificationMessage() {
    try {
      await this.page.waitForSelector(this.selectors.notificationMessage);
      return await this.page.$eval(this.selectors.notificationMessage, el => el.textContent);
    } catch (error) {
      console.log(error)
      return null;
    }
  }

  async clickForgotPassword() {
    await this.page.click(this.selectors.forgotPasswordLink);
  }

  async clickRegister() {
    await this.page.click(this.selectors.registerLink);
  }

  async getFieldError(fieldName) {
    const errorSelector = `[data-test-id="${fieldName}-error"]`;
    try {
      await this.page.waitForSelector(errorSelector);
      return await this.page.$eval(errorSelector, el => el.textContent);
    } catch {
      return null;
    }
  }

  async waitForSuccessfulLogin() {
    await Promise.race([
      this.page.waitForNavigation(),
      this.page.waitForSelector(this.selectors.notificationMessage)
    ]);
  }
}