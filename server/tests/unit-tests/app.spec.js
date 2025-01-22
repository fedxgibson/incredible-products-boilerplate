const App = require('../../src/app');
const express = require('express');
const MongoDBConnection = require('../../src/mongodb/connection');
const UserRepository = require('../../src/repositories/user-repository');
const CreateUserUseCase = require('../../src/use-cases/create-user');
const LoginUserUseCase = require('../../src/use-cases/login-user');

// Mock dependencies
jest.mock('express');
jest.mock('../../src/mongodb/connection');
jest.mock('../../src/repositories/user-repository');
jest.mock('../../src/use-cases/create-user');
jest.mock('../../src/use-cases/login-user');
jest.mock('../../src/http/router', () => jest.fn().mockReturnValue({
  use: jest.fn()
}));
jest.mock('winston', () => ({
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn()
  }),
  format: {
    timestamp: jest.fn(),
    json: jest.fn(),
    combine: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}));

describe('App', () => {
  let app;
  let mockExpress;
  let mockListen;
  let mockUse;
  let mockGet;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup Express mock
    mockListen = jest.fn((port, host, cb) => cb());
    mockUse = jest.fn();
    mockGet = jest.fn();
    mockExpress = {
      listen: mockListen,
      use: mockUse,
      get: mockGet
    };
    express.mockReturnValue(mockExpress);

    // Setup MongoDB mock
    MongoDBConnection.prototype.connect = jest.fn().mockResolvedValue({ db: 'mockDb' });
    MongoDBConnection.prototype.disconnect = jest.fn().mockResolvedValue();
    MongoDBConnection.prototype.ping = jest.fn().mockResolvedValue();
  });

  describe('constructor', () => {
    it('should initialize with default config when no options provided', () => {
      app = new App({
        mongoUri: 'mongodb://localhost',
        mongoDb: 'testdb',
        jwtSecret: 'test-secret'
      });

      expect(app.logger).toBeDefined();
      expect(app.express).toBeDefined();
      expect(app.database).toBeDefined();
    });
  });

  describe('initialize', () => {
    beforeEach(() => {
      app = new App({
        mongoUri: 'mongodb://localhost',
        mongoDb: 'testdb',
        jwtSecret: 'test-secret'
      });
    });

    it('should setup and start the application successfully', async () => {
      await app.initialize();

      expect(MongoDBConnection.prototype.connect).toHaveBeenCalled();
      expect(mockUse).toHaveBeenCalled();
      expect(mockListen).toHaveBeenCalled();
    });

    it('should exit process when initialization fails', async () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
      MongoDBConnection.prototype.connect.mockRejectedValue(new Error('Connection failed'));

      await app.initialize();

      expect(mockExit).toHaveBeenCalledWith(1);
      mockExit.mockRestore();
    });
  });

  describe('health check endpoint', () => {
    beforeEach(() => {
      app = new App({
        mongoUri: 'mongodb://localhost',
        mongoDb: 'testdb',
        jwtSecret: 'test-secret'
      });
    });

    it('should return 200 when database is healthy', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      app.setupHealthCheck();

      const healthCheckHandler = mockGet.mock.calls[0][1];
      await healthCheckHandler({}, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ok',
          services: { database: 'up' }
        })
      );
    });

    it('should return 503 when database is unhealthy', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      MongoDBConnection.prototype.ping.mockRejectedValue(new Error('Database error'));

      app.setupHealthCheck();

      const healthCheckHandler = mockGet.mock.calls[0][1];
      await healthCheckHandler({}, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          services: { database: 'down' }
        })
      );
    });
  });

  describe('setupDatabase', () => {
    beforeEach(() => {
      app = new App({
        mongoUri: 'mongodb://localhost',
        mongoDb: 'testdb',
        jwtSecret: 'test-secret'
      });
    });

    it('should establish database connection successfully', async () => {
      await app.setupDatabase();

      expect(MongoDBConnection.prototype.connect).toHaveBeenCalled();
      expect(app.db).toBeDefined();
    });

    it('should throw error when database connection fails', async () => {
      const connectionError = new Error('Connection failed');
      MongoDBConnection.prototype.connect.mockRejectedValue(connectionError);

      await expect(app.setupDatabase()).rejects.toThrow(connectionError);
    });
  });

  describe('setupMiddleware', () => {
    beforeEach(() => {
      app = new App({
        mongoUri: 'mongodb://localhost',
        mongoDb: 'testdb',
        jwtSecret: 'test-secret',
        origin: 'http://localhost:3000'
      });
    });

    it('should setup all middleware correctly', () => {
      app.setupMiddleware();

      // Verify all middleware was added
      expect(mockUse).toHaveBeenCalledTimes(4); // helmet, bodyParser, morgan
      
      // Verify health check endpoint was setup
      expect(mockGet).toHaveBeenCalledWith('/health', expect.any(Function));
    });
  });

  describe('setupUseCases', () => {
    beforeEach(() => {
      app = new App({
        mongoUri: 'mongodb://localhost',
        mongoDb: 'testdb',
        jwtSecret: 'test-secret',
        jwtExpiresIn: '1h'
      });
      app.db = { /* mock db connection */ };
    });

    it('should initialize all use cases with correct dependencies', () => {
      app.setupUseCases();

      expect(UserRepository).toHaveBeenCalledWith(app.db);
      expect(CreateUserUseCase).toHaveBeenCalledWith(
        expect.any(UserRepository),
        app.logger
      );
      expect(LoginUserUseCase).toHaveBeenCalledWith(
        expect.any(UserRepository),
        {
          jwtSecret: 'test-secret',
          jwtExpiresIn: '1h'
        },
        app.logger
      );

      expect(app.useCases.createUserUseCase).toBeDefined();
      expect(app.useCases.loginUserUseCase).toBeDefined();
    });
  });

  describe('setupRoutes', () => {
    beforeEach(() => {
      app = new App({
        mongoUri: 'mongodb://localhost',
        mongoDb: 'testdb',
        jwtSecret: 'test-secret'
      });
      app.useCases = {
        createUserUseCase: new CreateUserUseCase(),
        loginUserUseCase: new LoginUserUseCase()
      };
    });

    it('should setup API routes with correct handlers', () => {
      app.setupRoutes();

      expect(mockUse).toHaveBeenCalledWith('/api/v1', expect.any(Object));
      
      // Verify routes configuration
      const routerSetup = require('../../src/http/router');
      expect(routerSetup).toHaveBeenCalledWith({
        routes: [
          {
            path: '/register',
            handler: app.useCases.createUserUseCase,
          },
          {
            path: '/login',
            handler: app.useCases.loginUserUseCase,
          }
        ]
      }, app.logger);
    });
  });

  describe('graceful shutdown', () => {
    beforeEach(() => {
      app = new App({
        mongoUri: 'mongodb://localhost',
        mongoDb: 'testdb',
        jwtSecret: 'test-secret'
      });
    });

    it('should handle SIGTERM signal correctly', async () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
      
      app.setupGracefulShutdown();
      
      // Trigger SIGTERM handler
      process.emit('SIGTERM');
      
      // Wait for async operations to complete
      await new Promise(resolve => setImmediate(resolve));
      
      expect(MongoDBConnection.prototype.disconnect).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(0);
      
      mockExit.mockRestore();
    });

    it('should handle shutdown errors correctly', async () => {
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
      MongoDBConnection.prototype.disconnect.mockRejectedValue(new Error('Shutdown error'));
      
      app.setupGracefulShutdown();
      
      // Trigger SIGTERM handler
      process.emit('SIGTERM');
      
      // Wait for async operations to complete
      await new Promise(resolve => setImmediate(resolve));
      
      expect(mockExit).toHaveBeenCalledWith(1);
      
      mockExit.mockRestore();
    });
  });
});