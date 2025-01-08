const { ObjectId } = require('mongodb');
const UserRepository = require('../../src/repositories/user-repository');
const User = require('../../src/entities/user');

describe('UserRepository', () => {
  let database;
  let userRepository;
  let collectionMock;

  beforeEach(() => {
    collectionMock = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
    };
    
    database = {
      collection: jest.fn(() => collectionMock),
    };
    
    userRepository = new UserRepository(database);
  });

  describe('create', () => {
    it('should create a user in the database', async () => {
      const user = new User(null, 'John Doe', 'john@example.com');
      const insertedId = new ObjectId('123456789012345678901234');

      collectionMock.insertOne.mockResolvedValue({ insertedId });

      const createdUser = await userRepository.create(user);

      expect(database.collection).toHaveBeenCalledWith('users');
      expect(collectionMock.insertOne).toHaveBeenCalledWith({
        name: user.name,
        email: user.email,
      });
      expect(createdUser._id).toEqual(insertedId);
      expect(createdUser.name).toBe(user.name);
      expect(createdUser.email).toBe(user.email);
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const userId = new ObjectId('123456789012345678901234');
      const expectedUser = {
        _id: userId,
        name: 'John Doe',
        email: 'john@example.com',
      };

      collectionMock.findOne.mockResolvedValue(expectedUser);

      const user = await userRepository.findById(userId);

      expect(database.collection).toHaveBeenCalledWith('users');
      expect(collectionMock.findOne).toHaveBeenCalledWith({ _id: userId });
      expect(user).toEqual(expectedUser);
    });

    it('should return null when user is not found', async () => {
      const userId = new ObjectId('123456789012345678901234');
      
      collectionMock.findOne.mockResolvedValue(null);

      const user = await userRepository.findById(userId);

      expect(database.collection).toHaveBeenCalledWith('users');
      expect(collectionMock.findOne).toHaveBeenCalledWith({ _id: userId });
      expect(user).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const userEmail = 'john@example.com';
      const expectedUser = {
        _id: new ObjectId('123456789012345678901234'),
        name: 'John Doe',
        email: userEmail,
      };
  
      collectionMock.findOne.mockResolvedValue(expectedUser);
  
      const user = await userRepository.findByEmail(userEmail);
  
      expect(database.collection).toHaveBeenCalledWith('users');
      expect(collectionMock.findOne).toHaveBeenCalledWith({ email: userEmail });
      expect(user).toEqual(expectedUser);
    });
  
    it('should return null when user is not found', async () => {
      const userEmail = 'nonexistent@example.com';
      
      collectionMock.findOne.mockResolvedValue(null);
  
      const user = await userRepository.findByEmail(userEmail);
  
      expect(database.collection).toHaveBeenCalledWith('users');
      expect(collectionMock.findOne).toHaveBeenCalledWith({ email: userEmail });
      expect(user).toBeNull();
    });
  });
});