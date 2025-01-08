// Mock express and Router
const mockRouter = {
  post: jest.fn(),
  use: jest.fn(),
  get: jest.fn()
};

const mockExpress = jest.fn(() => ({
  use: jest.fn()
}));

mockExpress.Router = jest.fn(() => mockRouter);

jest.mock('express', () => mockExpress);

const setupRoutes = require('../../src/http/routes');

describe('Router Setup', () => {
  let mockCreateUserUseCase;
  let mockLoginUserUseCase;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup mock use cases
    mockCreateUserUseCase = {
      execute: jest.fn()
    };
    
    mockLoginUserUseCase = {
      execute: jest.fn()
    };
  });

  describe('Route Configuration', () => {
    it('should set up routes with provided dependencies', () => {
      const deps = {
        useCases: {
        	createUserUseCase: mockCreateUserUseCase,
          loginUserUseCase: mockLoginUserUseCase
        }
      };

      const router = setupRoutes(deps);

      // Verify routes were set up
      expect(mockRouter.post).toHaveBeenCalledWith(
        '/create-user',
        expect.any(Function)
      );
      expect(mockRouter.post).toHaveBeenCalledWith(
        '/login',
        expect.any(Function)
      );
    });

    it('should throw error if dependencies are missing', () => {
      expect(() => setupRoutes()).toThrow('Missing required dependencies');
      expect(() => setupRoutes({})).toThrow('Missing required dependencies');
    });

    it('should throw error if use cases are missing', () => {
      expect(() => setupRoutes({ useCases: {} }))
        .toThrow('Missing required use cases');
    });
  });

  describe('Route Handlers', () => {
    let router;
    let createUserHandler;
    let loginHandler;

    beforeEach(() => {
      const deps = {
        useCases: {
          createUserUseCase: mockCreateUserUseCase,
          loginUserUseCase: mockLoginUserUseCase
        }
      };

      router = setupRoutes(deps);

      // Get route handlers
      const postCalls = mockRouter.post.mock.calls;
      createUserHandler = postCalls.find(
        ([path]) => path === '/create-user'
      )[1];
      loginHandler = postCalls.find(
        ([path]) => path === '/login'
      )[1];
    });

    describe('Create User Route', () => {
      it('should handle successful user creation', async () => {
        const mockReq = {
          body: { username: 'test', email: 'test@example.com' }
        };
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const mockResult = { id: '123', username: 'test' };
        
        mockCreateUserUseCase.execute.mockResolvedValue(mockResult);

        await createUserHandler(mockReq, mockRes);

        expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(mockReq.body);
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(mockResult);
      });

      it('should handle user creation errors', async () => {
        const mockReq = {
          body: { username: 'test', email: 'invalid-email' }
        };
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const mockError = new Error('Invalid email');
        
        mockCreateUserUseCase.execute.mockRejectedValue(mockError);

        await createUserHandler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: mockError.message
        });
      });
    });

    describe('Login Route', () => {
      it('should handle successful login', async () => {
        const mockReq = {
          body: { email: 'test@example.com', password: 'password123' }
        };
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const mockResult = { token: 'jwt-token' };
        
        mockLoginUserUseCase.execute.mockResolvedValue(mockResult);

        await loginHandler(mockReq, mockRes);

        expect(mockLoginUserUseCase.execute).toHaveBeenCalledWith(mockReq.body);
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(mockResult);
      });

      it('should handle login errors', async () => {
        const mockReq = {
          body: { email: 'test@example.com', password: 'wrong-password' }
        };
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        const mockError = new Error('Invalid credentials');
        
        mockLoginUserUseCase.execute.mockRejectedValue(mockError);

        await loginHandler(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: mockError.message
        });
      });
    });
  });
});