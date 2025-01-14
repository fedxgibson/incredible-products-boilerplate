const { ObjectId } = require('mongodb');
const UserRepository = require('../../../src/repositories/user-repository');
const { 
  QueryError, 
  DuplicateEntryError, 
  EntityNotFoundError 
} = require('../../../src/errors/repository-errors');

describe('UserRepository', () => {
  let database;
  let collection;
  let userRepository;

  beforeEach(() => {
    // Create mock collection with all required methods
    collection = {
      insertOne: jest.fn(),
      findOne: jest.fn()
    };

    // Create mock database with collection method
    database = {
      collection: jest.fn().mockReturnValue(collection)
    };

    userRepository = new UserRepository(database);
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const user = {
        name: 'John Doe',
        email: 'john@example.com',
        hashedPassword: 'hashedPassword123'
      };
      const insertedId = new ObjectId();
      collection.insertOne.mockResolvedValue({ insertedId });

      // Act
      const result = await userRepository.create(user);

      // Assert
      expect(database.collection).toHaveBeenCalledWith('users');
      expect(collection.insertOne).toHaveBeenCalledWith({
        name: user.name,
        email: user.email,
        hashedPassword: user.hashedPassword,

      });
      expect(result).toEqual({
        ...user,
        _id: insertedId
      });
    });

    it('should throw DuplicateEntryError when email already exists', async () => {
      // Arrange
      const user = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123'
      };
      
      collection.insertOne.mockRejectedValue({ 
        code: 11000,
        message: 'Duplicate key error'
      });

      // Act & Assert
      await expect(userRepository.create(user))
        .rejects
        .toThrow(DuplicateEntryError);
    });

    it('should throw QueryError on other database errors', async () => {
      // Arrange
      const user = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123'
      };
      
      collection.insertOne.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(userRepository.create(user))
        .rejects
        .toThrow(QueryError);
    });
  });

  describe('findById', () => {
    it('should find a user by id successfully', async () => {
      // Arrange
      const userId = new ObjectId();
      const expectedUser = {
        _id: userId,
        name: 'John Doe',
        email: 'john@example.com'
      };
      collection.findOne.mockResolvedValue(expectedUser);

      // Act
      const result = await userRepository.findById(userId);

      // Assert
      expect(database.collection).toHaveBeenCalledWith('users');
      expect(collection.findOne).toHaveBeenCalledWith({ _id: userId });
      expect(result).toEqual(expectedUser);
    });

    it('should convert string id to ObjectId', async () => {
      // Arrange
      const userId = new ObjectId();
      const userIdString = userId.toString();
      const expectedUser = {
        _id: userId,
        name: 'John Doe',
        email: 'john@example.com'
      };
      collection.findOne.mockResolvedValue(expectedUser);

      // Act
      const result = await userRepository.findById(userIdString);

      // Assert
      expect(collection.findOne).toHaveBeenCalledWith({ _id: expect.any(ObjectId) });
      expect(result).toEqual(expectedUser);
    });

    it('should throw QueryError for invalid id format', async () => {
      // Arrange
      const invalidId = 'invalid-id';

      // Act & Assert
      await expect(userRepository.findById(invalidId))
        .rejects
        .toThrow(QueryError);
    });

    it('should throw EntityNotFoundError when user is not found', async () => {
      // Arrange
      const userId = new ObjectId();
      collection.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(userRepository.findById(userId))
        .rejects
        .toThrow(EntityNotFoundError);
    });

    it('should throw QueryError on database errors', async () => {
      // Arrange
      const userId = new ObjectId();
      collection.findOne.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(userRepository.findById(userId))
        .rejects
        .toThrow(QueryError);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email successfully', async () => {
      // Arrange
      const email = 'john@example.com';
      const expectedUser = {
        _id: new ObjectId(),
        name: 'John Doe',
        email: email
      };
      collection.findOne.mockResolvedValue(expectedUser);

      // Act
      const result = await userRepository.findByEmail(email);

      // Assert
      expect(database.collection).toHaveBeenCalledWith('users');
      expect(collection.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(expectedUser);
    });

    it('should return null when user is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      collection.findOne.mockResolvedValue(null);

      // Act
      const result = await userRepository.findByEmail(email);

      // Assert
      expect(result).toBeNull();
    });

    it('should throw QueryError on database errors', async () => {
      // Arrange
      const email = 'john@example.com';
      collection.findOne.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(userRepository.findByEmail(email))
        .rejects
        .toThrow(QueryError);
    });
  });
});