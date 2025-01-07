const express = require('express');
const bodyParser = require('body-parser');
const MongoDBConnection = require('../src/mongodb/connection');
const UserRepository = require('../src/repositories/user-repository');
const CreateUserUseCase = require('../src/use-cases/user/create-user');
const LoginUserUseCase = require('../src/use-cases/auth/login-user');
const setupRoutes = require('../src/http/routes');
const App = require('../src/app');

// Mocks
jest.mock('express', () => {
  const mockExpress = jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    listen: jest.fn()
  }));
  mockExpress.json = jest.fn();
  return mockExpress;
});

jest.mock('body-parser', () => ({
  json: jest.fn()
}));

jest.mock('../src/mongodb/connection');
jest.mock('../src/repositories/user-repository');
jest.mock('../src/use-cases/user/create-user');
jest.mock('../src/use-cases/auth/login-user');
jest.mock('../src/http/routes', () => {
  return jest.fn()
});

describe('App', () => {
  let app;
  let mockExpressInstance;
  let mockMongoConnection;

  const defaultConfig = {
    port: 3000,
    host: 'localhost',
    mongoUri: 'mongodb://localhost:27017',
    mongoDb: 'testdb',
    jwtSecret: 'random',
    jwtExpiresIn: '1h'
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup Express mock
    mockExpressInstance = {
      use: jest.fn(),
      get: jest.fn(),
      listen: jest.fn((port, host, cb) => cb())
    };
    express.mockReturnValue(mockExpressInstance);
    
    // Setup MongoDB connection mock
    mockMongoConnection = {
      connect: jest.fn().mockResolvedValue({ db: 'mockDb' })
    };
    MongoDBConnection.mockImplementation(() => mockMongoConnection);
    
    app = new App(defaultConfig);
  });

  describe('constructor', () => {
    it('should initialize with provided configuration', () => {
      expect(app.port).toBe(defaultConfig.port);
      expect(app.host).toBe(defaultConfig.host);
      expect(app.mongoUri).toBe(defaultConfig.mongoUri);
      expect(app.mongoDb).toBe(defaultConfig.mongoDb);
      expect(app.jwtExpiresIn).toBe(defaultConfig.jwtExpiresIn);
      expect(app.jwtSecret).toBe(defaultConfig.jwtSecret);
      expect(app.mongoDb).toBe(defaultConfig.mongoDb);
      expect(MongoDBConnection).toHaveBeenCalledWith(
        defaultConfig.mongoUri,
        defaultConfig.mongoDb
      );
    });

    it('should create express instance', () => {
      expect(express).toHaveBeenCalled();
      expect(app.express).toBeDefined();
    });
  });

  describe('setupMiddleware', () => {
    beforeEach(() => {
      app.setupMiddleware();
    });

    it('should setup body-parser middleware', () => {
      expect(bodyParser.json).toHaveBeenCalled();
      expect(mockExpressInstance.use).toHaveBeenCalled();
    });

    it('should setup health check endpoint', () => {
      expect(mockExpressInstance.get).toHaveBeenCalledWith(
        '/health',
        expect.any(Function)
      );
    });

    it('should return correct health check response', () => {
      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Get the health check handler and execute it
      const healthCheckHandler = mockExpressInstance.get.mock.calls.find(
        call => call[0] === '/health'
      )[1];
      healthCheckHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ status: 'ok' });
    });
  });

  describe('setupDatabase', () => {
    it('should connect to database successfully', async () => {
      const mockDb = { collection: jest.fn() };
      mockMongoConnection.connect.mockResolvedValue(mockDb);

      await app.setupDatabase();

      expect(mockMongoConnection.connect).toHaveBeenCalled();
      expect(app.db).toBe(mockDb);
    });

    it('should throw error when database connection fails', async () => {
      const errorMessage = 'Connection failed';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockMongoConnection.connect.mockRejectedValue(new Error(errorMessage));
      await expect(app.setupDatabase()).rejects.toThrow(errorMessage);
      expect(consoleSpy).toHaveBeenCalled();
    
      consoleSpy.mockRestore();
    });
  });

  describe('setupUseCases', () => {
    beforeEach(async () => {
      app.db = { collection: jest.fn() };
    });

    it('should initialize user repository and use cases', () => {
      app.setupUseCases();

      expect(UserRepository).toHaveBeenCalledWith(app.db);
      expect(CreateUserUseCase).toHaveBeenCalled();
      expect(LoginUserUseCase).toHaveBeenCalled();
      expect(app.useCases).toBeDefined();
      expect(app.useCases.createUserUseCase).toBeDefined();
      expect(app.useCases.loginUserUseCase).toBeDefined();
    });
  });

  describe('setupRoutes', () => {
    beforeEach(() => {
      app.db = { collection: jest.fn() };
      app.setupUseCases(); // Setup use cases before testing routes
    });

    it('should setup routes with correct dependencies', () => {
      app.setupRoutes();

      expect(setupRoutes).toHaveBeenCalledWith({
        express: app.express,
        db: app.db,
        useCases: app.useCases
      });
    });
  });


  describe('setup', () => {
    it('should complete full setup successfully', async () => {
      const setupSpy = jest.spyOn(app, 'setupMiddleware');
      const dbSpy = jest.spyOn(app, 'setupDatabase');
      const useCasesSpy = jest.spyOn(app, 'setupUseCases');

      const result = await app.setup();

      expect(result).toBe(true);
      expect(setupSpy).toHaveBeenCalled();
      expect(dbSpy).toHaveBeenCalled();
      expect(useCasesSpy).toHaveBeenCalled();
      expect(setupRoutes).toHaveBeenCalledWith({
        express: app.express,
        db: app.db,
        useCases: app.useCases
      });
    });

    it('should return false when setup fails', async () => {
      jest.spyOn(app, 'setupDatabase').mockRejectedValue(new Error('Setup failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await app.setup();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const setupSpy = jest.spyOn(app, 'setup').mockResolvedValue(true);
      const startSpy = jest.spyOn(app, 'start').mockImplementation();

      await app.initialize();

      expect(setupSpy).toHaveBeenCalled();
      expect(startSpy).toHaveBeenCalled();
    });

    it('should exit process when setup fails', async () => {
      const setupSpy = jest.spyOn(app, 'setup').mockResolvedValue(false);
      const processSpy = jest.spyOn(process, 'exit').mockImplementation();

      await app.initialize();

      expect(setupSpy).toHaveBeenCalled();
      expect(processSpy).toHaveBeenCalledWith(1);
      processSpy.mockRestore();
    });
  });

  describe('start', () => {
    it('should start server with configured port and host', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      app.start();

      expect(mockExpressInstance.listen).toHaveBeenCalledWith(
        defaultConfig.port,
        defaultConfig.host,
        expect.any(Function)
      );
      consoleSpy.mockRestore();
    });

    it('should use default port and host when not configured', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      app.port = null;
      app.host = null;

      app.start();

      expect(mockExpressInstance.listen).toHaveBeenCalledWith(
        3001,
        '0.0.0.0',
        expect.any(Function)
      );
      consoleSpy.mockRestore();
    });
  });
});