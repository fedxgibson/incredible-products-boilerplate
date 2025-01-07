// specs/auth.spec.js
const LoginPage = require('../pages/LoginPage')
const SignupPage = require('../pages/SignupPage')

describe('Authentication Flows', () => {
  let loginPage;
  let signupPage;

  beforeEach(async () => {
    loginPage = new LoginPage(page);
    signupPage = new SignupPage(page);
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
});
