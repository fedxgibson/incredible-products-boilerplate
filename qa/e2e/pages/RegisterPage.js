// pages/RegisterPage.js
module.exports = class RegisterPage {
  constructor(page) {
    this.page = page;
    this.selectors = {
      usernameInput: '[data-test-id="username-input"]',
      emailInput: '[data-test-id="email-input"]',
      passwordInput: '[data-test-id="password-input"]',
      confirmPasswordInput: '[data-test-id="confirm-password-input"]',
      submitButton: '[data-test-id="register-submit"]',
      loginLink: '[data-test-id="login-link"]',
      notificationMessage: '[data-test-id="notification"]'
    };
  }

  async navigate() {
    await this.page.goto(`${process.env.BASE_URL}/register`);
  }

  async register({ username, email, password, confirmPassword }) {
    await this.page.type(this.selectors.usernameInput, username);
    await this.page.type(this.selectors.emailInput, email);
    await this.page.type(this.selectors.passwordInput, password);
    await this.page.type(this.selectors.confirmPasswordInput, confirmPassword);
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
      return null;
    }
  }

  async clickLoginLink() {
    await this.page.click(this.selectors.loginLink);
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

  async waitForSuccessfulRegistration() {
    await Promise.race([
      this.page.waitForNavigation(),
      this.page.waitForSelector(this.selectors.notificationMessage)
    ]);
  }
}