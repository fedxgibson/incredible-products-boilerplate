const {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError
} = require('../../../src/errors/domain-errors');

describe('Router Module', () => {
  let mockRouter;
  let mockHandler;
  let routeHandler;
  let mockLogger;

  beforeEach(() => {
    // Clear Jest's module registry before each test
    jest.resetModules();
    
    // Reset mocks
    jest.clearAllMocks();

    // Mock handler
    mockHandler = {
      execute: jest.fn()
    };

    // Create mock router with post method that captures the handler
    mockRouter = {
      use: jest.fn(),
      post: jest.fn((path, handler) => {
        routeHandler = handler;
      })
    };

    mockLogger = {
      error: jest.fn()
    };

    // Mock express
    jest.mock('express', () => {
      const mockExpress = jest.fn(() => ({
        use: jest.fn()
      }));
      mockExpress.Router = jest.fn(() => mockRouter);
      return mockExpress;
    });

    // Mock dependencies
    const mockDeps = {
      routes: [
        { path: '/test', handler: mockHandler }
      ]
    };

    // Import router module
    routerModule = require('../../../src/http/router')(mockDeps, mockLogger);
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('Initialization', () => {
    it('should throw error when dependencies are missing', () => {
      expect(() => {
        require('../../../src/http/router')();
      }).toThrow('Missing required dependencies');
    });

    it('should setup middleware and routes when initialized properly', () => {
      expect(mockRouter.use).toHaveBeenCalled();
      expect(mockRouter.post).toHaveBeenCalled();
    });
  });

  describe('Middleware', () => {
    it('should set content-type header to application/json', () => {
      const mockRes = {
        setHeader: jest.fn()
      };
      const mockNext = jest.fn();

      const middleware = mockRouter.use.mock.calls[0][0];
      middleware({}, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/json'
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Route Handler', () => {
    it('should return 200 and result for successful request', async () => {
      const expectedResult = { success: true };
      mockHandler.execute.mockResolvedValue(expectedResult);

      const mockReq = { body: { data: 'test' } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await routeHandler(mockReq, mockRes);

      expect(mockHandler.execute).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expectedResult);
    });
  });

  describe('Error Handling', () => {
    const testCases = [
      {
        error: new ValidationError('Invalid data'),
        expectedStatus: 400,
        expectedBody: {
          error: 'ValidationError',
          message: 'Invalid data'
        }
      },
      {
        error: new AuthenticationError('Not authenticated'),
        expectedStatus: 401,
        expectedBody: {
          error: 'AuthenticationError',
          message: 'Not authenticated'
        }
      },
      {
        error: new AuthorizationError('Not authorized'),
        expectedStatus: 403,
        expectedBody: {
          error: 'AuthorizationError',
          message: 'Not authorized'
        }
      },
      {
        error: new NotFoundError('Resource not found'),
        expectedStatus: 404,
        expectedBody: {
          error: 'NotFoundError',
          message: 'Resource not found'
        }
      },
      {
        error: new ConflictError('Resource conflict'),
        expectedStatus: 409,
        expectedBody: {
          error: 'ConflictError',
          message: 'Resource conflict'
        }
      }
    ];

    testCases.forEach(({ error, expectedStatus, expectedBody }) => {
      it(`should handle ${error.constructor.name} correctly`, async () => {
        // Log error details for debugging        
        mockHandler.execute.mockRejectedValue(error);

        const mockReq = { body: { data: 'test' } };
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };

        await routeHandler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(expectedStatus);
        expect(mockRes.json).toHaveBeenCalledWith(expectedBody);
      })
    });

    it('should handle unexpected errors with 500 status', async () => {
      const unexpectedError = new Error('Unexpected error');
      mockHandler.execute.mockRejectedValue(unexpectedError);

      const mockReq = { body: { data: 'test' } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await routeHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'InternalServerError',
          message: 'Internal server error'
        })
      );

      consoleSpy.mockRestore();
    });
  });
});