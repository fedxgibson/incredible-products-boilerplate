// pages/SignupPage.js
module.exports = class SignupPage {
  constructor(page) {
    this.page = page;
    this.selectors = {
      nameInput: '[data-testid="name-input"]',
      emailInput: '[data-testid="email-input"]',
      passwordInput: '[data-testid="password-input"]',
      confirmPasswordInput: '[data-testid="confirm-password-input"]',
      submitButton: '[data-testid="signup-submit"]'
    };
  }

  async navigate() {
    await this.page.goto(`${process.env.BASE_URL}/signup`);
  }

  async signup(userData) {
    await this.page.type(this.selectors.nameInput, userData.name);
    await this.page.type(this.selectors.emailInput, userData.email);
    await this.page.type(this.selectors.passwordInput, userData.password);
    await this.page.type(this.selectors.confirmPasswordInput, userData.password);
    await this.page.click(this.selectors.submitButton);
  }
}