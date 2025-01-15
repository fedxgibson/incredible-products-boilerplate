const takeScreenshot = require('../../utils/screenshot');
const LoginPage = require('../pages/LoginPage');
const RegisterPage = require('../pages/RegisterPage'); // Note: Changed from SignupPage to match your components

describe('Authentication Flows', () => {
  let loginPage;
  let registerPage;

  const testUser = {
    name: `TestUser${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'newPassword123!',
    confirmPassword: 'newPassword123!'  // Added this to match your register form
  };

  beforeEach(async () => {
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
  });

  describe('Registration Flow', () => {  // Changed from Signup to Register to match your components
    it('should successfully create new account', async () => {
      await registerPage.navigate();
      await takeScreenshot(page, 'register-initial');

      await registerPage.register({
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
        confirmPassword: testUser.confirmPassword
      });

      await takeScreenshot(page, 'register-submitted');

      // Wait for notification or redirect
      await registerPage.waitForSuccessfulRegistration();
      await takeScreenshot(page, 'register-complete');
            
      // Verify successful registration redirects to login
      await page.waitForFunction(() => window.location.pathname === '/login');

      const notificationMessage = await registerPage.getNotificationMessage();
      expect(notificationMessage).toContain('Successfully registered');


      await takeScreenshot(page, 'register-success');
    });
  });

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      await loginPage.navigate();
      await takeScreenshot(page, 'login-initial');

      await loginPage.login({
        email: testUser.email,
        password: testUser.password,
        rememberMe: true  // Optional, set to true to test remember me functionality
      });

      await takeScreenshot(page, 'login-submitted');

      // Wait for login completion
      await loginPage.waitForSuccessfulLogin();
      
      // Verify successful login
      await page.waitForFunction(() => window.location.pathname === '/');
      const notificationMessage = await loginPage.getNotificationMessage();
      expect(notificationMessage).toContain('Successfully logged in');

      await takeScreenshot(page, 'login-complete');
    });

    it('should show error with invalid credentials', async () => {
      await loginPage.navigate();
      await takeScreenshot(page, 'login-error-initial');

      await loginPage.login({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      });

      await page.waitForNetworkIdle();

      await takeScreenshot(page, 'login-error-submitted');
      await page.waitForFunction(() => window.location.pathname === '/login');

      // Check for error notification
      const notificationMessage = await loginPage.getNotificationMessage();
      expect(notificationMessage).toContain('Login failed');

      await takeScreenshot(page, 'login-error-complete');
    });

    it('should validate form fields', async () => {
      await loginPage.navigate();
      await takeScreenshot(page, 'login-validation-initial');

      // Try to submit empty form
      await loginPage.login({
        email: '',
        password: ''
      });
e
      // Check for field errors
      const emailError = await loginPage.getFieldError('email');
      const passwordError = await loginPage.getFieldError('password');
      
      expect(emailError).toContain('Email is required');
      expect(passwordError).toContain('Password is required');

      await takeScreenshot(page, 'login-validation-errors');
    });
  });
});