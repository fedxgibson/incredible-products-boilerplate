// specs/auth.spec.js
describe('Authentication Flows', () => {
  let loginPage;
  let signupPage;
  let authFlow;

  beforeEach(async () => {
    loginPage = new LoginPage(page);
    signupPage = new SignupPage(page);
    authFlow = new AuthFlow(loginPage, signupPage);
  });

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      await loginPage.navigate();
      await loginPage.login(testUsers.valid.email, testUsers.valid.password);
      
      // Verify successful login
      await expect(page).toHaveURL('/dashboard');
    });

    it('should show error with invalid credentials', async () => {
      await loginPage.navigate();
      await loginPage.login(testUsers.invalid.email, testUsers.invalid.password);
      
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toContain('Invalid credentials');
    });
  });

  describe('Signup Flow', () => {
    it('should successfully create new account', async () => {
      const newUser = {
        name: `Test User ${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'newPassword123'
      };

      await signupPage.navigate();
      await signupPage.signup(newUser);
      
      // Verify successful signup
      await expect(page).toHaveURL('/onboarding');
    });
  });

  describe('Complex User Flows', () => {
    it('should sign up and then log in with new account', async () => {
      // Create new account
      const newUser = {
        name: `Test User ${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'newPassword123'
      };
      await authFlow.createNewAccount(newUser);
      
      // Log out
      await page.click('[data-testid="logout-button"]');
      
      // Log in with new account
      await loginPage.navigate();
      await loginPage.login(newUser.email, newUser.password);
      
      // Verify successful login
      await expect(page).toHaveURL('/dashboard');
    });
  });
});
