// pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.selectors = {
      emailInput: '[data-testid="email-input"]',
      passwordInput: '[data-testid="password-input"]',
      submitButton: '[data-testid="login-submit"]',
      errorMessage: '[data-testid="error-message"]'
    };
  }

  async navigate() {
    await this.page.goto(`${process.env.BASE_URL}/login`);
  }

  async login(email, password) {
    await this.page.type(this.selectors.emailInput, email);
    await this.page.type(this.selectors.passwordInput, password);
    await this.page.click(this.selectors.submitButton);
  }

  async getErrorMessage() {
    return this.page.$eval(this.selectors.errorMessage, el => el.textContent);
  }
}

