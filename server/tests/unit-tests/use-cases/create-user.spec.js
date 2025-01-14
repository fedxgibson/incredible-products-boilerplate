const bcrypt = require('bcrypt');
const CreateUserUseCase = require('../../../src/use-cases/create-user');
const { ValidationError, ConflictError } = require('../../../src/errors/domain-errors');
const { DuplicateEntryError } = require('../../../src/errors/repository-errors');

jest.mock('bcrypt')

describe('CreateUserUseCase', () => {
  let userRepository;
  let createUserUseCase;
  let validUserData;
  let consoleErrorSpy;

  beforeAll(() => {
    // Mock console.error before all tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    // Restore console.error after all tests
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    // Clear mock calls between tests
    consoleErrorSpy.mockClear();
    
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn()
    };
    createUserUseCase = new CreateUserUseCase(userRepository);
    validUserData = {
      name: 'john_doe',
      email: 'john@example.com',
      password: 'Test1234!',
      confirmPassword: 'Test1234!'
    };
  });

  describe('execute', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const createdUser = {
        id: 1,
        name: validUserData.name,
        email: validUserData.email,
      };
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(createdUser);

      // Act
      const result = await createUserUseCase.execute(validUserData);

      // Assert
      expect(result).toEqual(expect.objectContaining({
        name: validUserData.name,
        email: validUserData.email,
        id: 1
      }));
      expect(result.password).toBeUndefined();
      expect(result.confirmPassword).toBeUndefined();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when userData is null', async () => {
      await expect(createUserUseCase.execute(null))
        .rejects
        .toThrow(new ValidationError('Invalid user data provided'));
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('name validation', () => {
    it('should throw ValidationError when name is empty', async () => {
      const userData = { ...validUserData, name: '' };
      await expect(createUserUseCase.execute(userData))
        .rejects
        .toThrow(new ValidationError('Name is required'));
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when name is too short', async () => {
      const userData = { ...validUserData, name: 'ab' };
      await expect(createUserUseCase.execute(userData))
        .rejects
        .toThrow(new ValidationError('Name must be between 3 and 50 characters'));
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when name contains invalid characters', async () => {
      const userData = { ...validUserData, name: 'john@doe' };
      await expect(createUserUseCase.execute(userData))
        .rejects
        .toThrow(new ValidationError('Name can only contain letters, numbers, and underscores'));
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('email validation', () => {
    it('should throw ValidationError when email is empty', async () => {
      const userData = { ...validUserData, email: '' };
      await expect(createUserUseCase.execute(userData))
        .rejects
        .toThrow(new ValidationError('Email is required'));
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid email format', async () => {
      const userData = { ...validUserData, email: 'invalid-email' };
      await expect(createUserUseCase.execute(userData))
        .rejects
        .toThrow(new ValidationError('Invalid email format'));
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue({ email: validUserData.email });
      await expect(createUserUseCase.execute(validUserData))
        .rejects
        .toThrow(new ConflictError('Email already exists'));
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('password validation', () => {
    it('should throw ValidationError when password is empty', async () => {
      const userData = { ...validUserData, password: '' };
      await expect(createUserUseCase.execute(userData))
        .rejects
        .toThrow(new ValidationError('Password is required'));
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when password is too short', async () => {
      const userData = { ...validUserData, password: 'Test1!' };
      await expect(createUserUseCase.execute(userData))
        .rejects
        .toThrow(new ValidationError('Password must be at least 8 characters long'));
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when password lacks uppercase', async () => {
      const userData = { ...validUserData, password: 'test1234!', confirmPassword: 'test1234!' };
      await expect(createUserUseCase.execute(userData))
        .rejects
        .toThrow(new ValidationError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'));
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when passwords do not match', async () => {
      const userData = { ...validUserData, confirmPassword: 'DifferentPass1!' };
      await expect(createUserUseCase.execute(userData))
        .rejects
        .toThrow(new ValidationError('Passwords do not match'));
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('repository errors', () => {
    it('should handle duplicate entry errors', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockRejectedValue(new DuplicateEntryError());

      // Act & Assert
      await expect(createUserUseCase.execute(validUserData))
        .rejects
        .toThrow(new ConflictError('User already exists'));
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('user creation', () => {
    it('should create user with correct data', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockImplementation(
        user => Promise.resolve({
          email: validUserData.email, name: validUserData.name, id: 1
        }));
      const hashedValue = 'hashedValue'
      bcrypt.hash.mockReturnValue(hashedValue);

      // Act
      await createUserUseCase.execute(validUserData);

      // Assert
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: undefined,
          confirmPassword: undefined,
          password: undefined,
          name: validUserData.name,
          email: validUserData.email,
          hashedPassword: hashedValue
        })
      );
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should remove sensitive data from response', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({
        name: validUserData.name,
        email: validUserData.email,
        id: 1
      });

      // Act
      const result = await createUserUseCase.execute(validUserData);

      // Assert
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('hashedPassword');
      expect(result).not.toHaveProperty('confirmPassword');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});