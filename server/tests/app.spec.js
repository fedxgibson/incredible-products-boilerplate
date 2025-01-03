const App = require('../src/app');
const MongoDBConnection = require('../src/frameworks/mongodb/connection');
const express = require('express');

// Mock process.exit
jest.spyOn(process, 'exit').mockImplementation(() => {});

// Mock express before any imports
jest.mock('express', () => {
  const mockRouter = {
    post: jest.fn(),
    get: jest.fn(),
    use: jest.fn()
  };

  const mockApp = {
    listen: jest.fn((port, host, callback) => {
      callback?.();
      return { close: jest.fn() };
    }),
    use: jest.fn(),
    get: jest.fn()
  };
  
  const mockExpress = jest.fn(() => mockApp);
  mockExpress.Router = jest.fn(() => mockRouter);
  
  return mockExpress;
});

describe('App', () => {
  let mockDatabase;
  let expressApp;
  const mockOpts = {
    PORT: 3002,
    HOST: 'localhost',
    MONGO_URI: 'mongodb://localhost:27017',
    MONGO_DB: 'testdb',
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Get fresh express app instance
    expressApp = express();

    // Mock MongoDB connection
    mockDatabase = {
      connect: jest.fn().mockResolvedValue({}),
      disconnect: jest.fn().mockResolvedValue({}),
    };

    jest.spyOn(MongoDBConnection.prototype, 'connect')
      .mockImplementation(() => mockDatabase.connect());

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('constructor', () => {
    it('should initialize with provided options', () => {
      const app = new App(mockOpts);

      expect(app.port).toBe(mockOpts.PORT);
      expect(app.host).toBe(mockOpts.HOST);
      expect(app.mongoUri).toBe(mockOpts.MONGO_URI);
      expect(app.mongoDb).toBe(mockOpts.MONGO_DB);
    });
  });

  describe('setup', () => {
    it('should setup the application successfully', async () => {
      const app = new App(mockOpts);
      app.express = expressApp;
      
      const result = await app.setup();

      expect(result).toBe(true);
      expect(mockDatabase.connect).toHaveBeenCalled();
    });

    it('should return false when setup fails', async () => {
      const error = new Error('Setup failed');
      mockDatabase.connect.mockRejectedValue(error);

      const app = new App(mockOpts);
      app.express = expressApp;
      
      const result = await app.setup();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Failed to setup application:', error);
    });
  });

  describe('initialize', () => {
    it('should initialize the application when setup is successful', async () => {
      const app = new App(mockOpts);
      app.express = expressApp;
      
      await app.initialize();

      expect(mockDatabase.connect).toHaveBeenCalled();
      expect(expressApp.listen).toHaveBeenCalledWith(
        mockOpts.PORT,
        mockOpts.HOST,
        expect.any(Function)
      );
    });

    it('should exit process when setup fails', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.connect.mockRejectedValue(error);

      const app = new App(mockOpts);
      await app.initialize();

      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('setupDatabase', () => {
    it('should establish database connection', async () => {
      const app = new App(mockOpts);
      await app.setupDatabase();

      expect(mockDatabase.connect).toHaveBeenCalled();
    });

    it('should throw error when database connection fails', async () => {
      const error = new Error('Database connection failed');
      mockDatabase.connect.mockRejectedValue(error);

      const app = new App(mockOpts);

      await expect(app.setupDatabase()).rejects.toThrow('Database connection failed');
      expect(console.error).toHaveBeenCalledWith('Database connection failed:', error);
    });
  });

  describe('setupRoutes', () => {
    it('should throw error when database is not connected', () => {
      const app = new App(mockOpts);

      expect(() => app.setupRoutes()).toThrow('Database connection not established');
    });

    it('should setup routes when database is connected', async () => {
      const app = new App(mockOpts);
      app.db = {}; // Mock database connection
      app.express = expressApp;
    
      app.setupRoutes();
    
      expect(expressApp.use).toHaveBeenCalledWith('/api', expect.objectContaining({
        get: expect.any(Function),
        post: expect.any(Function),
        use: expect.any(Function)
      }));
    });
  });
});