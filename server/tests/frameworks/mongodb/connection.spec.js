const { MongoClient } = require('mongodb');
const MongoDBConnection = require('../../../src/frameworks/mongodb/connection');

// Mock MongoDB client
jest.mock('mongodb', () => ({
  MongoClient: {
    connect: jest.fn()
  }
}));

describe('MongoDBConnection', () => {
  let connection;
  let mockClient;
  let mockDb;
  const TEST_URL = 'mongodb://localhost:27017';
  const TEST_DB = 'testdb';

  beforeEach(() => {
    // Reset console.log mock before each test
    jest.spyOn(console, 'log').mockImplementation(() => {});

    // Create mock database and client
    mockDb = {
      collection: jest.fn()
    };

    mockClient = {
      db: jest.fn(() => mockDb),
      close: jest.fn()
    };

    // Setup the mock implementation for MongoClient.connect
    MongoClient.connect.mockResolvedValue(mockClient);

    // Create a new connection instance
    connection = new MongoDBConnection(TEST_URL, TEST_DB);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct URL and database name', () => {
      expect(connection.url).toBe(TEST_URL);
      expect(connection.dbName).toBe(TEST_DB);
      expect(connection.client).toBeNull();
    });
  });

  describe('connect', () => {
    it('should connect successfully to MongoDB', async () => {
      const db = await connection.connect();

      expect(MongoClient.connect).toHaveBeenCalledWith(TEST_URL);
      expect(mockClient.db).toHaveBeenCalledWith(TEST_DB);
      expect(connection.client).toBe(mockClient);
      expect(connection.db).toBe(mockDb);
      expect(db).toBe(mockDb);
      expect(console.log).toHaveBeenCalledWith('Connected to MongoDB');
    });

    it('should throw error when connection fails', async () => {
      const error = new Error('Connection failed');
      MongoClient.connect.mockRejectedValue(error);

      await expect(connection.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully when client exists', async () => {
      // First connect
      await connection.connect();

      // Then disconnect
      await connection.disconnect();

      expect(mockClient.close).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Disconnected from MongoDB');
    });

    it('should not attempt to disconnect when no client exists', async () => {
      await connection.disconnect();

      expect(mockClient.close).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should handle disconnect errors gracefully', async () => {
      // First connect
      await connection.connect();

      // Mock close to throw an error
      const error = new Error('Disconnect failed');
      mockClient.close.mockRejectedValue(error);

      await expect(connection.disconnect()).rejects.toThrow('Disconnect failed');
    });
  });

  describe('connection lifecycle', () => {
    it('should support multiple connect/disconnect cycles', async () => {
      // First cycle
      await connection.connect();
      expect(connection.client).toBe(mockClient);
      await connection.disconnect();

      // Second cycle
      await connection.connect();
      expect(connection.client).toBe(mockClient);
      await connection.disconnect();

      expect(MongoClient.connect).toHaveBeenCalledTimes(2);
      expect(mockClient.close).toHaveBeenCalledTimes(2);
    });
  });
});