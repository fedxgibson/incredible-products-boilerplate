const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const LoginUserUseCase = require('../../../src/use-cases/auth/login-user');

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn()
}));

describe('LoginUserUseCase', () => {
  let loginUserUseCase;
  let mockUserRepository;
  let config;

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: 'user'
  };

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn()
    };

    config = {
      jwtSecret: 'test-secret',
      jwtExpiresIn: '1h'
    };

    loginUserUseCase = new LoginUserUseCase(mockUserRepository, config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully login user and return token', async () => {
      // Setup
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-token');

      // Execute
      const result = await loginUserUseCase.execute(loginData);

      // Verify
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          email: mockUser.email,
          role: mockUser.role
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );
      expect(result).toEqual({
        token: 'mock-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role
        }
      });
    });

    it('should throw error when user is not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(loginUserUseCase.execute(loginData))
        .rejects
        .toThrow('Login failed: Invalid credentials');
    });

    it('should throw error when password is invalid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(loginUserUseCase.execute(loginData))
        .rejects
        .toThrow('Login failed: Invalid credentials');
    });
  });

  describe('input validation', () => {
    it('should validate email format', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      await expect(loginUserUseCase.execute(invalidData))
        .rejects
        .toThrow('Login failed: Invalid email format');
    });

    it('should validate password length', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: '12345'
      };

      await expect(loginUserUseCase.execute(invalidData))
        .rejects
        .toThrow('Login failed: Password must be at least 6 characters long');
    });

    it('should require both email and password', async () => {
      await expect(loginUserUseCase.execute({ email: 'test@example.com' }))
        .rejects
        .toThrow('Login failed: Email and password are required');

      await expect(loginUserUseCase.execute({ password: 'password123' }))
        .rejects
        .toThrow('Login failed: Email and password are required');
    });
  });

  describe('sanitizeUser', () => {
    it('should remove password from user object', () => {
      const sanitizedUser = loginUserUseCase.sanitizeUser(mockUser);
      expect(sanitizedUser).not.toHaveProperty('password');
      expect(sanitizedUser).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role
      });
    });
  });
});