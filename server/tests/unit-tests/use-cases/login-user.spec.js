const LoginUserUseCase = require('../../../src/use-cases/login-user');
const { ValidationError, AuthenticationError } = require('../../../src/errors/domain-errors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('LoginUserUseCase', () => {
  let userRepository;
  let config;
  let loginUserUseCase;
  let validLoginData;
  let consoleErrorSpy;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    consoleErrorSpy.mockClear();
    userRepository = {
      findByEmail: jest.fn()
    };
    config = {
      jwtSecret: 'test-secret',
      jwtExpiresIn: '1h'
    };
    validLoginData = {
      email: 'test@example.com',
      password: 'ValidPass123!'
    };
  });

  describe('Constructor', () => {
    it('should throw error when jwt secret is not provided', () => {
      expect(() => new LoginUserUseCase(userRepository, {}))
        .toThrow('JWT secret is required');
    });

    it('should use default expiration when not provided', () => {
      const useCase = new LoginUserUseCase(userRepository, { jwtSecret: 'secret' });
      expect(useCase.jwtExpiresIn).toBe('1h');
    });
  });

  describe('execute', () => {
    beforeEach(() => {
      loginUserUseCase = new LoginUserUseCase(userRepository, config);
    });

    it('should successfully authenticate user with valid credentials', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        email: validLoginData.email,
        hashedPassword: 'hashedPassword'
      };
      const expectedToken = 'generated-token';

      userRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(expectedToken);

      // Act
      const result = await loginUserUseCase.execute(validLoginData);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email
      }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

      expect(result).toEqual({
        token: expectedToken,
        user: {
          id: mockUser.id,
          email: mockUser.email
        }
      });
      expect(result.user.hashedPassword).toBeUndefined();
    });

    it('should throw AuthenticationError when user is not found', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(loginUserUseCase.execute(validLoginData))
        .rejects
        .toThrow(new AuthenticationError('Invalid credentials'));
    });

    it('should throw AuthenticationError when password is invalid', async () => {
      // Arrange
      const mockUser = {
        email: validLoginData.email,
        password: 'hashedPassword'
      };
      userRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(loginUserUseCase.execute(validLoginData))
        .rejects
        .toThrow(new AuthenticationError('Invalid credentials'));
    });
  });

  describe('input validation', () => {
    beforeEach(() => {
      loginUserUseCase = new LoginUserUseCase(userRepository, config);
    });

    it('should throw ValidationError for null input', async () => {
      await expect(loginUserUseCase.execute(null))
        .rejects
        .toThrow(new ValidationError('Invalid login data provided'));
    });

    it('should throw ValidationError for missing email', async () => {
      const data = { password: validLoginData.password };
      await expect(loginUserUseCase.execute(data))
        .rejects
        .toThrow(new ValidationError('Email is required'));
    });

    it('should throw ValidationError for empty email', async () => {
      const data = { ...validLoginData, email: '' };
      await expect(loginUserUseCase.execute(data))
        .rejects
        .toThrow(new ValidationError('Email is required'));
    });

    it('should throw ValidationError for invalid email format', async () => {
      const data = { ...validLoginData, email: 'invalid-email' };
      await expect(loginUserUseCase.execute(data))
        .rejects
        .toThrow(new ValidationError('Invalid email format'));
    });

    it('should throw ValidationError for missing password', async () => {
      const data = { email: validLoginData.email };
      await expect(loginUserUseCase.execute(data))
        .rejects
        .toThrow(new ValidationError('Password is required'));
    });

    it('should throw ValidationError for empty password', async () => {
      const data = { ...validLoginData, password: '' };
      await expect(loginUserUseCase.execute(data))
        .rejects
        .toThrow(new ValidationError('Password is required'));
    });

    it('should throw ValidationError for short password', async () => {
      const data = { ...validLoginData, password: '12345' };
      await expect(loginUserUseCase.execute(data))
        .rejects
        .toThrow(new ValidationError('Password must be at least 6 characters long'));
    });
  });

  describe('token generation', () => {
    beforeEach(() => {
      loginUserUseCase = new LoginUserUseCase(userRepository, config);
    });

    it('should throw AuthenticationError when token generation fails', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        email: validLoginData.email,
        password: 'hashedPassword'
      };
      userRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockImplementation(() => {
        throw new Error('Token generation failed');
      });

      // Act & Assert
      await expect(loginUserUseCase.execute(validLoginData))
        .rejects
        .toThrow(new AuthenticationError('Failed to generate authentication token'));
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});